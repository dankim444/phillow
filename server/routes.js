const { Pool, types } = require("pg");
const config = require("./config.json");
const { exec } = require("child_process");
const path = require("path");

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
// Route 1: GET /property/:address
// Description: Base query to get specific house by address and optionally by zipcode
const getPropertyByAddress = async (req, res) => {
  const address = req.params.address;
  const zipcode = req.query.zipcode;

  const query = `
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
    WHERE LOWER(location) LIKE LOWER('%' || $1 || '%')
    ${zipcode ? "AND zip_code = $2" : ""} 
    ORDER BY location
  `;

  const queryParams = zipcode ? [address, zipcode] : [address];

  connection.query(query, queryParams, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({});
    } else {
      res.json(data.rows);
    }
  });
};

// [USED] [USED] [USED]
// Route 2: GET /properties_in_zip
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
    address,
  } = req.query;

  const query = `
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
      ${address ? "AND LOWER(location) LIKE LOWER('%' || $10 || '%')" : ""}

    `;

  const queryParams = address
    ? [
        zipcode,
        min_bathrooms,
        max_bathrooms,
        min_bedrooms,
        max_bedrooms,
        min_livable_area,
        max_livable_area,
        min_market_value,
        max_market_value,
        address,
      ]
    : [
        zipcode,
        min_bathrooms,
        max_bathrooms,
        min_bedrooms,
        max_bedrooms,
        min_livable_area,
        max_livable_area,
        min_market_value,
        max_market_value,
      ];

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
// Route 8: GET /zipcode_info
// Description: Gets the average market value, property count, population, total crimes, police stations, and crime rate per capita for each zip code

// POST-Optimization: ~1 s
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
// Route 9: GET /street_patterns
/* 
Description: This query analyzes both property and crime patterns on individual streets by extracting street names from property addresses and crime location blocks.
It aggregates the data to calculate metrics like average propety value, crime types, and crime freqeuncy. 
*/
// UI - Help users identify streets with high property values or high crime activity.

// duration: 6 s
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

// Route 10: GET /safe_high_value_properties
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
    SELECT 
        p.location,
        p.market_value,
        p.zip_code,
        zp.population,
        (SELECT COUNT(*) FROM crime_data WHERE zip_code = p.zip_code) as total_crimes_in_zip
    FROM properties p
    JOIN zipcode_population zp ON p.zip_code = zp.zip_code
    WHERE 
        p.market_value > $1 
        AND NOT EXISTS (
            SELECT 1
            FROM crime_data c
            WHERE 
                c.zip_code = p.zip_code 
                AND c.text_general_code = $2
        )
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

// Route 11: GET /investment_scores
/*
Description: This complex query analyzes property sales trends, safety, and market dynamics across zip codes to calculate an investment score
for each area, considering factors like price trends, new construction, crime rate, and police station presence. It ranks the zip codes by
investment potential, helping identify the most promising areas for real estate investment.
*/

// duration: 2 s
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

// duration: 54 s
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

// [USED] [USED] [USED]
// NEW Route: GET /street_info
/* [Kevin]
Description: Gets info on every street (# of crimes on that street, # of properties, types of crimes committed broken down)
average market value, etc
*/

//26 seconds PRE-Optimization
const getStreetInfo = async (req, res) => {
  connection.query(
    `
    WITH crime_street AS (
        SELECT
          SUBSTRING(cd.location_block FROM '^[0-9]+ BLOCK (.+)$') AS street_name,
          cd.zip_code,
          cd.text_general_code AS crime_type,
          COUNT(*) AS crime_count
        FROM crime_data cd
        WHERE cd.dispatch_date >= DATE '2018-01-01'
          AND cd.dispatch_date <  DATE '2019-01-01'
        GROUP BY 1, cd.zip_code, cd.text_general_code
    ),
    crime_street_agg AS (
        SELECT
          cs.street_name,
          cs.zip_code,
          SUM(cs.crime_count) AS total_crimes_2018,
          JSONB_OBJECT_AGG(cs.crime_type, cs.crime_count) AS crimes_by_type
        FROM crime_street cs
        GROUP BY cs.street_name, cs.zip_code
    ),
    property_street AS (
        SELECT
          SUBSTRING(p.location FROM '^[0-9]+ (.+)$') AS street_name,
          p.zip_code,
          COUNT(*) AS property_count,
          AVG(p.market_value) AS avg_market_value,
          AVG(p.sale_price)   AS avg_sale_price,
          COUNT(DISTINCT p.category_code_description) AS property_type_diversity
        FROM properties p
        GROUP BY 1, p.zip_code
    ),
    joined_data AS (
        SELECT
          ps.street_name,
          ps.zip_code,
          ps.property_count,
          ps.avg_market_value,
          ps.avg_sale_price,
          ps.property_type_diversity,
          COALESCE(csa.total_crimes_2018, 0) AS total_crimes_2018,
          csa.crimes_by_type
        FROM property_street ps
        LEFT JOIN crime_street_agg csa
              ON ps.street_name = csa.street_name
              AND ps.zip_code = csa.zip_code
    ),
    zip_info AS (
        SELECT
          zp.zip_code,
          zp.population,
          COUNT(DISTINCT pol.object_id) AS police_station_count
        FROM zipcode_population zp
        LEFT JOIN police_stations pol
              ON zp.zip_code = pol.zip_code
        GROUP BY zp.zip_code, zp.population
    ),
    final_rank AS (
        SELECT
          jd.street_name,
          jd.zip_code,
          jd.property_count,
          jd.avg_market_value,
          jd.avg_sale_price,
          jd.property_type_diversity,
          jd.total_crimes_2018,
          jd.crimes_by_type,
          zi.population,
          zi.police_station_count,
          -- Replaced efficient window functions with correlated subqueries
          (SELECT COUNT(*) + 1
          FROM joined_data jd2
          WHERE jd2.avg_market_value > jd.avg_market_value) AS market_value_rank,
          (SELECT COUNT(*) + 1
          FROM joined_data jd2
          WHERE jd2.total_crimes_2018 < jd.total_crimes_2018) AS crime_rank
        FROM joined_data jd
        JOIN zip_info zi ON jd.zip_code = zi.zip_code
    )
    SELECT
        fr.street_name,
        fr.zip_code,
        fr.property_count,
        ROUND(fr.avg_market_value,2) AS avg_market_value,
        ROUND(fr.avg_sale_price,2)   AS avg_sale_price,
        fr.property_type_diversity,
        fr.total_crimes_2018,
        fr.crimes_by_type AS crime_type_distribution,
        fr.population,
        fr.police_station_count,
        fr.market_value_rank,
        fr.crime_rank,
        ROUND(
          (0.4 * fr.market_value_rank)
          + (0.4 * fr.crime_rank)
          - (0.2 * fr.police_station_count),
        2) AS home_finder_score
    FROM final_rank fr
    WHERE fr.property_count >= 3
    ORDER BY total_crimes_2018 DESC;
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
// New route: POST /crime_near_address
const getCrimesNearAddress = async (req, res) => {
  const { address, radius } = req.body;

  if (!address || !radius) {
    return res.status(400).json({ error: "Address and radius are required" });
  }

  // Adjust the path to `geocoder.py` based on its actual location
  const geocoderScript = path.resolve(__dirname, "../scripts", "geocoder.py");

  try {
    exec(`python3 ${geocoderScript} "${address}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Geocoder error:", error.message);
        console.error("Error stack:", error.stack);
        return res.status(500).json({ error: "Geocoding failed" });
      }

      if (stderr) {
        console.error("Geocoder stderr:", stderr);
        return res.status(500).json({ error: "Geocoding error" });
      }

      console.log("Geocoder output:", stdout);

      try {
        const geocodeResult = JSON.parse(stdout);

        if (geocodeResult.error) {
          return res.status(404).json({ error: "Address not found" });
        }

        const { latitude, longitude } = geocodeResult;

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
                  return res
                    .status(500)
                    .json({ error: "Database query failed" });
                }

                res.json({
                  crimes: crimeData.rows,
                  stations: stationData.rows,
                });
              }
            );
          }
        );
      } catch (parseError) {
        console.error("Parse error:", parseError.message);
        return res.status(500).json({ error: "Invalid geocoding output" });
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};

// [USED] [USED] [USED]
// New route: GET /property_location
const getPropertyLocation = (req, res) => {
  const address = req.query.address;
  const geocoderScript = path.resolve(__dirname, "../scripts", "geocoder.py");
  exec(`python3 ${geocoderScript} "${address}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${stderr}`);
      res.status(500).send({ error: stderr });
    } else {
      try {
        const data = JSON.parse(stdout);
        res.send(data);
      } catch (parseError) {
        console.error(`Error parsing JSON: ${parseError}`);
        res
          .status(500)
          .send({ error: "Error parsing JSON response from script" });
      }
    }
  });
};

module.exports = {
  getPropertyByAddress,
  getPropertiesInZip,
  getCrimePerCapitaByZipcode,
  getCrimesInZip,
  getPoliceStationsInZip,
  getAverageHousePriceByZip,
  getZipCodeInfo,
  getStreetPatterns,
  getSafeProperties,
  getInvestmentScores,
  getStreetSafetyScores,
  getStreetInfo,
  getCrimesNearAddress,
  getPropertyLocation,
};
