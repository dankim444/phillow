const { Pool, types } = require("pg");
const config = require("./config.json");

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, (val) => parseInt(val, 10)); // DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));

/** Basic Routes **/

// Route 1: GET /property/:address
// Description: Base query to get specific house by address
const getPropertyByAddress = async (req, res) => {
  const address = req.params.address;

  connection.query(
    `
    SELECT 
      location,
      zip_code,
      market_value,
      sale_price,
      sale_date,
      category_code_description,
      number_of_bathrooms,
      number_of_bedrooms,
      total_livable_area,
      total_area,
      year_built,
      number_stories
    FROM properties 
    WHERE location = $1
    `,
    [address],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route 2: GET /properties_in_zip - might need to modify
// Description: Parameterized query to get all houses in zipcode, filter by number_of_bathrooms, number_of_bedrooms,
// total_livable_area, market_value. Handles null values with defaults.
const getPropertiesInZip = async (req, res) => {
  const {
    zipcode,
    min_bathrooms,
    max_bathrooms,
    min_bedrooms,
    max_bedrooms,
    min_livable_area,
    max_livable_area,
    min_market_value,
    max_market_value,
  } = req.query;

  connection.query(
    `
    SELECT 
      location,
      zip_code,
      market_value,
      sale_price,
      sale_date,
      category_code_description,
      number_of_bathrooms,
      number_of_bedrooms,
      total_livable_area,
      total_area,
      year_built,
      number_stories 
    FROM properties 
    WHERE zip_code = $1 
      AND number_of_bathrooms BETWEEN COALESCE($2, 0) AND COALESCE($3, 100)
      AND number_of_bedrooms BETWEEN COALESCE($4, 0) AND COALESCE($5, 100)
      AND total_livable_area BETWEEN COALESCE($6, 0) AND COALESCE($7, 100000)
      AND market_value BETWEEN COALESCE($8, 0) AND COALESCE($9, 1000000000)
    `,
    [
      zipcode,
      min_bathrooms,
      max_bathrooms,
      min_bedrooms,
      max_bedrooms,
      min_livable_area,
      max_livable_area,
      min_market_value,
      max_market_value,
    ],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route 3: GET /crime_per_capita - maybe also create a new endpoint for getting the crime per capita BY zipcode, instead of FOR EACH zipcode
// Description: Simple query to compute the Crime per Capita in Philadelphia Zipcode: Population Table, Crime Table, use groupby for zipcode,
// count crimes, and then divide by population in the zip code

// UI - a page that displays zipcode safety score, which is the crime per capita for each zipcode
// maybe add a slider or dropdown in the property search filter to enable users to only search for properties below a certain theshold (ie. < 0.04 crimes/person)
// use the crime per capita data to create a leaderboard or highlight the safest zip codes in a heatmap.
const getCrimePerCapita = async (req, res) => {
  connection.query(
    `
    SELECT pc.zip_code, 
           COUNT(pc.object_id) AS crime_count, 
           zp.population, 
           (COUNT(pc.object_id) * 1.0) / zp.population AS crime_per_capita 
    FROM crime_data AS pc
    JOIN zipcode_population AS zp ON pc.zip_code = zp.zip_code
    GROUP BY pc.zip_code, zp.population
    ORDER BY crime_per_capita DESC
    `,
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route 4: GET /crimes_in_zip/:zipcode
// Description: Simple query returning the coords (lat long) of all the crimes in a zip code as well as a count of
// how many of each type of crime occurred in a zip code
const getCrimesInZip = async (req, res) => {
  const zipcode = req.params.zipcode;

  connection.query(
    `
    SELECT lat, lng, text_general_code, COUNT(*) AS crime_count 
    FROM crime_data 
    WHERE zip_code = $1
    GROUP BY lat, lng, text_general_code
    `,
    [zipcode],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route 5: GET /police_stations/:zipcode
// Description: Simple query returning the location (address(es)) of the police station in the zip code (if any)
const getPoliceStationsInZip = async (req, res) => {
  const zipcode = req.params.zipcode;

  connection.query(
    `
    SELECT location 
    FROM police_stations 
    WHERE zip_code = $1
    `,
    [zipcode],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route 6: GET /average_house_price
// Description: Simple query returning the average house price per zipcode

// UI - a page that displays the average house price for each zipcode in a table

// Heatmap Legend:
//Green: Affordable areas (e.g., <$300,000)
//Yellow: Mid-range prices (e.g., $300,000–$500,000)
//Red: Expensive areas (e.g., >$500,000)

// Allow users to search for houses in a specific price range (ie. Average Price Range: [ $250,000 - $500,000 ])
const getAverageHousePricePerZip = async (req, res) => {
  connection.query(
    `
    SELECT 
      zip_code,
      AVG(market_value) AS avg_house_price 
    FROM properties 
    GROUP BY zip_code
    ORDER BY avg_house_price DESC
    `,
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route 7: GET /average_house_price_over_population
// Description: Average house prices for zip codes with more than 10,000 population
const getAverageHousePriceForPopulatedZips = async (req, res) => {
  connection.query(
    `
    SELECT
      p.zip_code,
      AVG(p.market_value) AS avg_market_value,
      COUNT(p.object_id) AS property_count
    FROM properties p
    JOIN zipcode_population pop ON p.zip_code = pop.zip_code
    WHERE pop.population > 10000
    GROUP BY p.zip_code
    `,
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Route 8: GET /street_data/:street_name
// Description: Total number of properties and crimes committed on a specific street
const getStreetData = async (req, res) => {
  const streetName = req.params.street_name.toUpperCase(); // Ensure consistency in case

  connection.query(
    `
    SELECT
      COUNT(DISTINCT p.object_id) AS num_properties,
      COUNT(DISTINCT c.object_id) AS num_crimes
    FROM properties p
    CROSS JOIN crime_data c
    WHERE p.location LIKE $1
      AND c.location_block LIKE $2
    `,
    [`%${streetName}%`, `%${streetName}%`],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else {
        res.json(data.rows[0]); // Return a single object with counts
      }
    }
  );
};


/** Complex queries **/

// Route 9: POST /specific_crime_analysis
const getSpecificCrimeAnalysis = async (req, res) => {
  const { crime_type1, crime_type2, crime_type3 } = req.body;

  connection.query(
    `
    WITH filtered_crimes AS (
        SELECT 
            c.zip_code, 
            COUNT(c.object_id) AS specific_crime_count
        FROM crime_data AS c
        WHERE c.text_general_code IN ($1, $2, $3)
        GROUP BY c.zip_code
    ),
    crime_per_capita AS (
        SELECT 
            fc.zip_code, 
            fc.specific_crime_count, 
            zp.population, 
            (fc.specific_crime_count * 1.0) / zp.population AS specific_crime_per_capita
        FROM filtered_crimes AS fc
        JOIN zipcode_population AS zp ON fc.zip_code = zp.zip_code
        WHERE zp.population > 0  
    ),
    avg_property_price AS (
        SELECT 
            zip_code, 
            AVG(market_value) AS avg_price 
        FROM properties
        GROUP BY zip_code
    )
    SELECT 
        cpc.zip_code, 
        cpc.specific_crime_per_capita, 
        app.avg_price 
    FROM crime_per_capita AS cpc
    JOIN avg_property_price AS app ON cpc.zip_code = app.zip_code
    ORDER BY cpc.specific_crime_per_capita ASC
    LIMIT 10;
    `,
    [crime_type1, crime_type2, crime_type3],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

module.exports = {
  getPropertyByAddress,
  getPropertiesInZip,
  getCrimePerCapita,
  getCrimesInZip,
  getPoliceStationsInZip,
  getAverageHousePricePerZip,
  getAverageHousePriceForPopulatedZips,
  getStreetData,
  getSpecificCrimeAnalysis,
};
