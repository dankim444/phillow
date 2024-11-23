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
  const streetName = req.params.street_name.toLowerCase();

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

// Route 9: GET /street_patterns
/* 
Description: This query analyzes both property and crime patterns on individual streets by extracting street names from property addresses and crime location blocks.
It aggregates the data to calculate metrics like average propety value, crime types, and crime freqeuncy. 
*/
// UI - Help users identify streets with high property values or high crime activity.
const getStreetPatterns = async (req, res) => {
  connection.query(
    `
    WITH unique_streets AS (
        SELECT DISTINCT
            TRIM(REGEXP_REPLACE(location, '^[^ ]+ ', '')) AS street_name
        FROM properties
    ),
    street_properties AS (
        SELECT
            us.street_name,
            COUNT(DISTINCT p.object_id) AS num_properties,
            ROUND(AVG(p.market_value), 2) AS avg_property_value,
            COUNT(DISTINCT p.category_code_description) AS property_types,
            MAX(p.year_built) AS newest_property,
            MIN(p.year_built) AS oldest_property
        FROM unique_streets us
        JOIN properties p ON TRIM(REGEXP_REPLACE(p.location, '^[^ ]+ ', '')) = us.street_name
        GROUP BY us.street_name
    ),
    street_crimes AS (
        SELECT
            us.street_name,
            COUNT(DISTINCT c.object_id) AS num_crimes,
            COUNT(DISTINCT c.text_general_code) AS crime_types,
            ROUND(AVG(c.hour), 1) AS avg_crime_hour,
            COUNT(DISTINCT DATE_TRUNC('month', c.dispatch_date)) AS months_with_crimes
        FROM unique_streets us
        JOIN crime_data c ON
            TRIM(REGEXP_REPLACE(REGEXP_REPLACE(c.location_block, 'BLOCK ', ''), '^[^ ]+ ', '')) = us.street_name
        GROUP BY us.street_name
    )
    SELECT
        sp.street_name,
        sp.num_properties,
        sp.avg_property_value,
        sc.num_crimes,
        sc.crime_types,
        sc.avg_crime_hour,
        sc.months_with_crimes,
        ROUND(sc.num_crimes::DECIMAL / sc.months_with_crimes, 2) AS crimes_per_month,
        ROUND(sc.num_crimes::DECIMAL / sp.num_properties, 2) AS crimes_per_property
    FROM street_properties sp
    JOIN street_crimes sc ON sp.street_name = sc.street_name
    WHERE sp.num_properties >= 5
    ORDER BY sc.num_crimes DESC
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

// Route 10: GET /lowest_crime_zips
/*
Description: Complex query that allows a user to provide up to 3 crimes they are most worried about and then provides a sorted list of zipcodes with the
lowest per capita crime of those types along with the average price of a property in the zipcode.
*/
const getLowestCrimeZips = async (req, res) => {
  const { crime_type1, crime_type2, crime_type3 } = req.query;

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

// Route 11: GET /investment_scores
/*
Description: This complex query analyzes property sales trends, safety, and market dynamics across zip codes to calculate an investment score
for each area, considering factors like price trends, new construction, crime rate, and police station presence. It ranks the zip codes by
investment potential, helping identify the most promising areas for real estate investment.
*/
const getInvestmentScores = async (req, res) => {
  connection.query(
    `
    WITH PropertyValueTrends AS (
        SELECT
            p.zip_code,
            p.category_code_description,
            EXTRACT(YEAR FROM p.sale_date) as sale_year,
            COUNT(*) as total_sales,
            AVG(p.sale_price) as avg_sale_price,
            AVG(p.market_value) as avg_market_value,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.sale_price) as median_sale_price,
            AVG(p.total_livable_area) as avg_size,
            COUNT(*) FILTER (WHERE p.year_built >= EXTRACT(YEAR FROM CURRENT_DATE) - 10) as new_construction
        FROM properties p
        WHERE p.sale_date >= CURRENT_DATE - INTERVAL '5 years'
          AND p.sale_price > 0
        GROUP BY p.zip_code, p.category_code_description, EXTRACT(YEAR FROM p.sale_date)
    ),
    ZipSafety AS (
        SELECT
            p.zip_code,
            COUNT(DISTINCT ps.object_id) as police_stations,
            COUNT(DISTINCT c.object_id) as annual_crimes,
            zp.population
        FROM properties p
        LEFT JOIN police_stations ps ON p.zip_code = ps.zip_code
        LEFT JOIN crime_data c ON
            SUBSTRING(p.location FROM '^[0-9]+ (.+)$') =
            SUBSTRING(c.location_block FROM '^[0-9]+ BLOCK (.+)$')
            AND c.dispatch_date >= CURRENT_DATE - INTERVAL '1 year'
        JOIN zipcode_population zp ON p.zip_code = zp.zip_code
        GROUP BY p.zip_code, zp.population
    ),
    MarketDynamics AS (
        SELECT
            pvt.zip_code,
            pvt.category_code_description,
            MAX(pvt.avg_sale_price) - MIN(pvt.avg_sale_price) as price_range,
            AVG(pvt.avg_sale_price) as overall_avg_price,
            SUM(pvt.new_construction) as total_new_construction,
            COUNT(DISTINCT pvt.sale_year) as years_of_data,
            CORR(pvt.sale_year::numeric, pvt.avg_sale_price::numeric) as price_trend_correlation
        FROM PropertyValueTrends pvt
        GROUP BY pvt.zip_code, pvt.category_code_description
        HAVING COUNT(DISTINCT pvt.sale_year) >= 3
    )
    SELECT
        md.zip_code,
        md.category_code_description,
        ROUND(md.overall_avg_price::numeric, 2) as avg_price,
        ROUND(md.price_range::numeric, 2) as price_volatility,
        ROUND(md.price_trend_correlation::numeric, 3) as price_trend,
        md.total_new_construction,
        zs.police_stations,
        ROUND((zs.annual_crimes::numeric / NULLIF(zs.population, 0) * 1000)::numeric, 2) as crime_rate_per_1000,
        ROUND(
            (
                CASE
                    WHEN md.price_trend_correlation > 0.7 THEN 30
                    WHEN md.price_trend_correlation > 0.3 THEN 20
                    ELSE 10
                END +
                CASE
                    WHEN md.total_new_construction > 10 THEN 20
                    WHEN md.total_new_construction > 5 THEN 10
                    ELSE 0
                END +
                CASE
                    WHEN (zs.annual_crimes::numeric / NULLIF(zs.population, 0) * 1000) < 50 THEN 30
                    WHEN (zs.annual_crimes::numeric / NULLIF(zs.population, 0) * 1000) < 100 THEN 15
                    ELSE 0
                END +
                CASE
                    WHEN zs.police_stations > 0 THEN 20
                    ELSE 0
                END
            )::numeric,
        2) as investment_score
    FROM MarketDynamics md
    JOIN ZipSafety zs ON md.zip_code = zs.zip_code
    WHERE md.overall_avg_price > 0
    ORDER BY investment_score DESC;
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

// Route 12: GET /street_safety_scores
/*
Description: This query calculates a "safety score" for each street by combining property values, crime statistics, and police presence,
where the score is weighted based on how the street's property values compare to the zip code average (30%), crime frequency (40%), and
presence of police stations (30%), while filtering out streets with fewer than 5 properties.
*/
const getStreetSafetyScores = async (req, res) => {
  connection.query(
    `
    WITH CrimeByStreet AS (
        SELECT
            SUBSTRING(location_block FROM '^[0-9]+ BLOCK (.+)$') as street_name,
            COUNT(*) as crime_count,
            COUNT(DISTINCT DATE_TRUNC('month', dispatch_date)) as months_with_crimes,
            AVG(EXTRACT(HOUR FROM dispatch_time)) as avg_crime_hour
        FROM crime_data
        WHERE dispatch_date >= CURRENT_DATE - INTERVAL '1 year'
        GROUP BY SUBSTRING(location_block FROM '^[0-9]+ BLOCK (.+)$')
    ),
    PropertyStats AS (
        SELECT
            p.zip_code,
            SUBSTRING(p.location FROM '^[0-9]+ (.+)$') as street_name,
            COUNT(*) as property_count,
            AVG(p.market_value) as avg_property_value,
            AVG(p.total_livable_area) as avg_livable_area,
            COUNT(DISTINCT p.category_code_description) as property_type_diversity
        FROM properties p
        GROUP BY p.zip_code, SUBSTRING(p.location FROM '^[0-9]+ (.+)$')
    ),
    ZipSafety AS (
        SELECT
            ps.zip_code,
            COUNT(DISTINCT police.object_id) as police_station_count,
            AVG(p.market_value) as zip_avg_value,
            zp.population,
            COUNT(DISTINCT ps.street_name) as total_streets
        FROM PropertyStats ps
        JOIN zipcode_population zp ON ps.zip_code = zp.zip_code
        LEFT JOIN police_stations police ON ps.zip_code = police.zip_code
        JOIN properties p ON ps.zip_code = p.zip_code
        GROUP BY ps.zip_code, zp.population
    )
    SELECT
        ps.zip_code,
        ps.street_name,
        ROUND(ps.avg_property_value, 2) as avg_property_value,
        ps.property_count,
        cs.crime_count,
        cs.months_with_crimes,
        ROUND(cs.avg_crime_hour, 1) as avg_crime_hour,
        zs.police_station_count,
        ROUND(
            (
                (COALESCE(ps.avg_property_value, 0) / NULLIF(zs.zip_avg_value, 0) * 0.3) +
                (CASE WHEN cs.crime_count IS NULL THEN 1
                      WHEN cs.crime_count < 10 THEN 0.8
                      WHEN cs.crime_count < 50 THEN 0.5
                      ELSE 0.2 END * 0.4) +
                (CASE WHEN zs.police_station_count > 0 THEN 0.3 ELSE 0 END)
            ) * 100,
        2) as safety_score
    FROM PropertyStats ps
    LEFT JOIN CrimeByStreet cs ON ps.street_name = cs.street_name
    JOIN ZipSafety zs ON ps.zip_code = zs.zip_code
    WHERE ps.property_count >= 5  -- Filter for streets with meaningful data
    ORDER BY safety_score DESC;
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

module.exports = {
  getPropertyByAddress,
  getPropertiesInZip,
  getCrimePerCapita,
  getCrimesInZip,
  getPoliceStationsInZip,
  getAverageHousePricePerZip,
  getAverageHousePriceForPopulatedZips,
  getStreetData,
  getStreetPatterns,
  getLowestCrimeZips,
  getInvestmentScores,
  getStreetSafetyScores
};
