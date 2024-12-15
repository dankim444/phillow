const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// define endpoints
app.get("/properties", routes.getProperties); // done - PropertySearch.js
pp.get("/property_location", routes.getPropertyLocation); // done - PropertyCard.js
app.get("/crime_per_capita/:zipcode", routes.getCrimePerCapitaByZipcode); // done - PropertySearch.js
app.get("/crimes_in_zip/:zipcode", routes.getCrimesInZip); // done - CrimeMap.js
app.get("/police_stations/:zipcode", routes.getPoliceStationsInZip); // done - CrimeMap.js
app.get("/average_house_price/:zipcode", routes.getAverageHousePriceByZip); // done - PropertySearch.js
app.get("/zipcode_info", routes.getZipCodeInfo); // done - Insights.js
app.get("/street_patterns", routes.getStreetPatterns); // done - Insights.js
app.get("/safe_high_value_properties", routes.getSafeProperties); // done - Insights.js
app.get("/street_info", routes.getStreetInfo); // done - Insights.js
app.post("/crime_near_address", routes.getCrimesNearAddress); // done - CrimeMap.js


app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
});

module.exports = app;
