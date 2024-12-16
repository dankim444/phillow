const { Pool, types } = require("pg");
const config = require("./config.json");
const fetch = require("node-fetch");

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

// [USED] [USED] [USED]
// Route 1: GET /properties
// Description: Parameterized query to get all houses in zipcode, filter by number_of_bathrooms, number_of_bedrooms,
// total_livable_area, market_value. Handles null values with defaults.
const getProperties = async (req, res) => {
  const {
    zipcode,
    address,
    min_bathrooms,
    max_bathrooms,
    min_bedrooms,
    max_bedrooms,
    min_livable_area,
    max_livable_area,
    min_market_value,
    max_market_value,
  } = req.query;

  let query = `
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
    WHERE 
      number_of_bathrooms BETWEEN COALESCE($1, 0) AND COALESCE($2, 13)
      AND number_of_bedrooms BETWEEN COALESCE($3, 0) AND COALESCE($4, 100)
      AND total_livable_area BETWEEN COALESCE($5, 0) AND COALESCE($6, 100000)
      AND market_value BETWEEN COALESCE($7, 0) AND COALESCE($8, 1000000000)
  `;

  const queryParams = [
    min_bathrooms,
    max_bathrooms,
    min_bedrooms,
    max_bedrooms,
    min_livable_area,
    max_livable_area,
    min_market_value,
    max_market_value,
  ];

  if (zipcode) {
    query += " AND zip_code = $9";
    queryParams.push(zipcode);
  }

  if (address) {
    query += ` AND LOWER(location) LIKE LOWER('%' || $${
      queryParams.length + 1
    } || '%')`;
    queryParams.push(address);
  }

  connection.query(query, queryParams, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json([]);
    } else {
      res.json(data.rows);
    }
  });
};

// [USED] [USED] [USED]
// Route 2: GET /property_location
const getPropertyLocation = async (req, res) => {
  const address = req.query.address;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&addressdetails=1&limit=1`;
  const headers = {
    "User-Agent": "Phillow/1.0 (xiaoshenma2016@gmail.com)",
  };

  try {
    console.log(`Requesting geocode data for address: ${address}`);
    const response = await fetch(url, { headers });
    console.log(`Response status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      
      // Check if we have results
      if (data.length > 0) {
        // Extract only the fields we want
        const locationData = {
          lon: data[0].lon,
          lat: data[0].lat,
          display_name: data[0].display_name
        };
        res.json(locationData);
      } else {
        res.status(404).json({ error: "Location not found" });
      }
    } else {
      console.error(`Error fetching geocode data: ${response.statusText}`);
      res.status(response.status).json({ error: response.statusText });
    }
  } catch (error) {
    console.error(`Error fetching geocode data: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

// [USED] [USED] [USED]
// Route 3: GET /crime_per_capita/:zipcode
// Description: Computes crime per capita for a specific zip code.
const getCrimePerCapitaByZipcode = async (req, res) => {
  const { zipcode } = req.params;

  connection.query(
    `
    SELECT pc.zip_code, 
           COUNT(pc.object_id) AS crime_count, 
           zp.population, 
           (COUNT(pc.object_id) * 1.0) / zp.population AS crime_per_capita 
    FROM crime_data AS pc
    JOIN zipcode_population AS zp ON pc.zip_code = zp.zip_code
    WHERE pc.zip_code = $1
    GROUP BY pc.zip_code, zp.population
    `,
    [zipcode],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json([]);
      } else if (data.rows.length === 0) {
        res
          .status(404)
          .json({ message: `No data found for zip code ${zipcode}` });
      } else {
        res.json(data.rows[0]); // Return the single result
      }
    }
  );
};

// [USED] [USED] [USED]
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

// [USED] [USED] [USED]
// Route 5: GET /police_stations/:zipcode
// Description: Simple query returning the location (address(es)) of the police station in the zip code (if any)
const getPoliceStationsInZip = async (req, res) => {
  const zipcode = req.params.zipcode;

  connection.query(
    `
    SELECT location, lat, lng 
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

// [USED] [USED] [USED]
// Route 6: GET /average_house_price/:zipcode
// Description: Fetches the average house price for a specific zip code
const getAverageHousePriceByZip = async (req, res) => {
  const { zipcode } = req.params;

  connection.query(
    `
    SELECT 
      zip_code,
      AVG(market_value) AS avg_house_price
    FROM properties
    WHERE zip_code = $1
    GROUP BY zip_code
    `,
    [zipcode],
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      } else if (data.rows.length === 0) {
        res
          .status(404)
          .json({ message: `No data found for zip code ${zipcode}` });
      } else {
        res.json(data.rows[0]); // Return the average house price for the specific zip code
      }
    }
  );
};

/** Complex queries **/

// [USED] [USED] [USED]
// Route 7: GET /zipcode_info
// Description: Gets the average market value, property count, population, total crimes, police stations, and crime rate per capita for each zip code
const getZipCodeInfo = async (req, res) => {
  connection.query(
    `
    WITH zip_crimes AS (
      SELECT zip_code, COUNT(*) as crime_count
      FROM crime_data
      GROUP BY zip_code
    ),
    zip_police AS (
      SELECT zip_code, COUNT(*) as station_count
      FROM police_stations
      GROUP BY zip_code
    )
    SELECT
      p.zip_code,
      ROUND(AVG(p.market_value)::NUMERIC, 2) AS avg_market_value,
      COUNT(p.object_id) AS property_count,
      zp.population,
      COALESCE(c.crime_count, 0) AS total_crimes,
      COALESCE(ps.station_count, 0) AS police_stations,
      ROUND((COALESCE(c.crime_count, 0)::DECIMAL / zp.population), 4) AS crime_rate_per_capita
    FROM properties p
    INNER JOIN zipcode_population zp ON p.zip_code = zp.zip_code
    LEFT JOIN zip_crimes c ON c.zip_code = p.zip_code
    LEFT JOIN zip_police ps ON ps.zip_code = p.zip_code
    GROUP BY 
      p.zip_code, 
      zp.population, 
      c.crime_count, 
      ps.station_count
    ORDER BY avg_market_value DESC;
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

// [USED] [USED] [USED]
// Route 8: GET /street_patterns
/* 
Description: This query analyzes both property and crime patterns on individual streets by extracting street names from property addresses and crime location blocks.
It aggregates the data to calculate metrics like average propety value, crime types, and crime freqeuncy. 
*/
// UI - Help users identify streets with high property values or high crime activity.

// duration: 5 s
// after indexing: 1 s
const getStreetPatterns = async (req, res) => {
  connection.query(
    `
WITH unique_streets AS (
    SELECT DISTINCT street_name
    FROM properties
),
street_properties AS (
    SELECT
        us.street_name,
        COUNT(DISTINCT p.object_id) AS num_properties,
        COUNT(DISTINCT p.category_code_description) AS property_types,
        MAX(p.year_built) AS newest_property,
        MIN(p.year_built) AS oldest_property
    FROM unique_streets us
    JOIN properties p ON p.street_name = us.street_name
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
    JOIN crime_data c ON c.street_name = us.street_name
    GROUP BY us.street_name
)
SELECT
    sp.street_name,
    sp.num_properties,
    sp.property_types,
    sp.newest_property,
    sp.oldest_property,
    sc.num_crimes,
    sc.crime_types,
    sc.avg_crime_hour,
    sc.months_with_crimes,
    ROUND(sc.num_crimes::DECIMAL / sc.months_with_crimes, 2) AS crimes_per_month,
    ROUND(sc.num_crimes::DECIMAL / sp.num_properties, 2) AS crimes_per_property
FROM street_properties sp
JOIN street_crimes sc ON sp.street_name = sc.street_name
WHERE sp.num_properties >= 5
ORDER BY sc.num_crimes DESC;
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

// Route 9: GET /safe_high_value_properties
/*
Description: This route allows a user to provide a minimum market value and a specific crime type
they want to avoid. It returns a list of properties where all properties have a market value above the
specified threshold and there are no reported crimes of the specified type.
*/

// duration:
const getSafeProperties = async (req, res) => {
  const { min_market_value, crime_type } = req.query;

  if (!min_market_value || !crime_type) {
    return res
      .status(400)
      .json({ error: "Missing required query parameters." });
  }

  connection.query(
    `
    WITH crime_counts AS (
        SELECT 
            zip_code,
            COUNT(*) as total_crimes,
            bool_or(text_general_code = $2) as has_specific_crime
        FROM crime_data
        GROUP BY zip_code
    ),
    filtered_crimes AS (
        SELECT zip_code 
        FROM crime_counts
        WHERE NOT has_specific_crime
    )
    SELECT 
        p.location,
        p.market_value,
        p.zip_code,
        zp.population,
        COALESCE(cc.total_crimes, 0) as total_crimes_in_zip
    FROM properties p
    JOIN zipcode_population zp ON p.zip_code = zp.zip_code
    JOIN filtered_crimes fc ON p.zip_code = fc.zip_code
    LEFT JOIN crime_counts cc ON p.zip_code = cc.zip_code
    WHERE p.market_value > $1
    ORDER BY p.market_value
    LIMIT 100;
    `,
    [min_market_value, crime_type],
    (err, data) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Database query failed." });
      }
      res.json(data.rows);
    }
  );
};

// [USED] [USED] [USED]
// Route 10: GET /street_info
/* [Kevin]
Description: Gets info on every street (# of crimes on that street, # of properties, types of crimes committed broken down)
*/

//26 seconds PRE-Optimization
// 0.5 seconds POST-Optimization (caching)

const getStreetInfo = async (req, res) => {
  connection.query(
    `
    SELECT * FROM street_info_mv;
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

// NEW Route: getCrimesNearAddress
/* [Xiaoshen]
Description: Gets crimes within a variable radius of variable address
*/

// [USED] [USED] [USED]
// New route: POST /crime_near_address
const getCrimesNearAddress = async (req, res) => {
  const { address, radius } = req.body;

  if (!address || !radius) {
    return res.status(400).json({ error: "Address and radius are required" });
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&addressdetails=1&limit=1`;
  const headers = {
    "User-Agent": "Phillow/1.0 (xiaoshenma2016@gmail.com)",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`Error fetching geocode data: ${response.statusText}`);
      return res.status(response.status).json({ error: "Geocoding failed" });
    }

    const data = await response.json();
    if (data.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    const { lat: latitude, lon: longitude } = data[0];

    // Query the database for crimes and police stations
    connection.query(
      `
      WITH crime_distances AS (
          SELECT
              text_general_code AS crime_type,
              COUNT(*) AS crime_count,  -- Add this to count crimes
              MIN(dispatch_date) AS earliest_date, -- Optional: earliest crime date
              MIN(dispatch_time) AS earliest_time, -- Optional: earliest time
              zip_code,
              lat,
              lng,
              (
                  6371 * ACOS(
                      COS(RADIANS($1)) * COS(RADIANS(lat)) *
                      COS(RADIANS(lng) - RADIANS($2)) +
                      SIN(RADIANS($1)) * SIN(RADIANS(lat))
                  )
              ) AS distance_km
          FROM crime_data
          GROUP BY text_general_code, zip_code, lat, lng
      )
      SELECT
          crime_type as text_general_code,
          crime_count,  -- Include the count of crimes
          zip_code,
          lat,
          lng,
          distance_km
      FROM
          crime_distances
      WHERE
          distance_km <= $3
      ORDER BY
          distance_km ASC;
      `,
      [latitude, longitude, radius],
      (err, crimeData) => {
        if (err) {
          console.error("Database error:", err.message);
          return res.status(500).json({ error: "Database query failed" });
        }

        connection.query(
          `
          WITH station_distances AS (
            SELECT
              object_id,
              location,
              zip_code,
              lat,
              lng,
              (
                6371 * ACOS(
                  COS(RADIANS($1)) * COS(RADIANS(lat)) *
                  COS(RADIANS(lng) - RADIANS($2)) +
                  SIN(RADIANS($1)) * SIN(RADIANS(lat))
                )
              ) AS distance_km
            FROM police_stations
          )
          SELECT * FROM station_distances WHERE distance_km <= $3 ORDER BY distance_km ASC;
          `,
          [latitude, longitude, radius],
          (err2, stationData) => {
            if (err2) {
              console.error("Database error:", err2.message);
              return res.status(500).json({ error: "Database query failed" });
            }

            res.json({
              crimes: crimeData.rows,
              stations: stationData.rows,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error fetching geocode data:", error.message);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};

module.exports = {
  getProperties,
  getPropertyLocation,
  getCrimePerCapitaByZipcode,
  getCrimesInZip,
  getPoliceStationsInZip,
  getAverageHousePriceByZip,
  getZipCodeInfo,
  getStreetPatterns,
  getSafeProperties,
  getStreetInfo,
  getCrimesNearAddress,
};
