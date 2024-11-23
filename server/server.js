const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json()); // Enable JSON parsing for POST requests

// define endpoints
app.get('/property/:address', routes.getPropertyByAddress);
app.get('/properties_in_zip', routes.getPropertiesInZip);
app.get('/crime_per_capita', routes.getCrimePerCapita);
app.get('/crimes_in_zip/:zipcode', routes.getCrimesInZip);
app.get('/police_stations/:zipcode', routes.getPoliceStationsInZip);
app.get('/average_house_price', routes.getAverageHousePricePerZip);
app.get('/average_house_price_over_population', routes.getAverageHousePriceForPopulatedZips);
app.get('/street_data/:street_name', routes.getStreetData);
app.post('/specific_crime_analysis', routes.getSpecificCrimeAnalysis);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;
