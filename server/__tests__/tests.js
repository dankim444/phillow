const { expect } = require('@jest/globals');
const supertest = require('supertest');
const app = require('../server');

const { exec } = require('child_process');

test('GET /property/:address returns property data', async () => {
  await supertest(app)
    .get('/property/1420 LOCUST ST')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('location');
        expect(response.body[0]).toHaveProperty('zip_code');
        expect(response.body[0]).toHaveProperty('market_value');
        expect(response.body[0]).toHaveProperty('sale_price');
        expect(response.body[0]).toHaveProperty('total_livable_area');
        expect(response.body[0].zip_code).toBe('19102');
      }
    });
});

test('GET /property/:address with zipcode returns filtered data', async () => {
  await supertest(app)
    .get('/property/1420 LOCUST ST?zipcode=19102')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].zip_code).toBe('19102');
        expect(response.body.length).toBe(414);
      }
    });
});

test('GET /properties_in_zip returns properties for zipcode', async () => {
  await supertest(app)
    .get('/properties_in_zip?zipcode=19102')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('location');
        expect(response.body[0]).toHaveProperty('zip_code');
        expect(response.body[0]).toHaveProperty('market_value');
        expect(response.body[0].zip_code).toBe('19102');
        expect(response.body.length).toBe(1213);
      }
    });
});

test('GET /properties_in_zip with filters returns filtered properties', async () => {
  await supertest(app)
    .get('/properties_in_zip?zipcode=19104&min_bathrooms=2&max_bathrooms=3&min_bedrooms=2&max_bedrooms=3')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const property = response.body[0];
        expect(Number(property.number_of_bathrooms)).toBeLessThanOrEqual(3.0);
        expect(Number(property.number_of_bathrooms)).toBeGreaterThanOrEqual(2.0);
        expect(Number(property.number_of_bedrooms)).toBeGreaterThanOrEqual(2.0);
        expect(Number(property.number_of_bedrooms)).toBeLessThanOrEqual(3.0);
        expect(property.zip_code).toBe('19104');
      }
    });
});

test('GET /crime_per_capita/:zipcode returns crime statistics', async () => {
  await supertest(app)
    .get('/crime_per_capita/19104')
    .expect(200)
    .then((response) => {
      expect(response.body).toHaveProperty('zip_code');
      expect(response.body).toHaveProperty('crime_count');
      expect(response.body).toHaveProperty('population');
      expect(response.body).toHaveProperty('crime_per_capita');
      expect(response.body.zip_code).toBe('19104');
      expect(Number(response.body.crime_count)).toBe(5778);
      expect(Number(response.body.population)).toBe(53679);
      expect(Number(response.body.crime_per_capita)).toBeGreaterThan(0);
    });
});

test('GET /crime_per_capita/:zipcode with invalid zipcode returns 404', async () => {
  await supertest(app)
    .get('/crime_per_capita/00000')
    .expect(404)
    .then((response) => {
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('No data found for zip code 00000');
    });
});

test('GET /crimes_in_zip/:zipcode returns crime locations and counts', async () => {
  await supertest(app)
    .get('/crimes_in_zip/19104')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const firstCrime = response.body[0];
        expect(firstCrime).toHaveProperty('lat');
        expect(firstCrime).toHaveProperty('lng');
        expect(firstCrime).toHaveProperty('text_general_code');
        expect(firstCrime).toHaveProperty('crime_count');
        expect(Number(firstCrime.lat)).toBeTruthy();
        expect(Number(firstCrime.lng)).toBeTruthy();
        expect(Number(firstCrime.crime_count)).toBeGreaterThan(0);
        expect(response.body.length).toBe(2429);
      }
    });
});

test('GET /police_stations/:zipcode returns police station locations', async () => {
  await supertest(app)
    .get('/police_stations/19104')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const station = response.body[0];
        expect(station).toHaveProperty('location');
        expect(station).toHaveProperty('lat');
        expect(station).toHaveProperty('lng');
        expect(Number(station.lat)).toBeTruthy();
        expect(Number(station.lng)).toBeTruthy();
        expect(response.body.length).toBe(2);
      }
    });
});

test('GET /average_house_price/:zipcode returns average price', async () => {
  await supertest(app)
    .get('/average_house_price/19104')
    .expect(200)
    .then((response) => {
      expect(response.body).toHaveProperty('zip_code');
      expect(response.body).toHaveProperty('avg_house_price');
      expect(response.body.zip_code).toBe('19104');
      expect(Number(response.body.avg_house_price)).toBeGreaterThan(300000.0);
    });
});

test('GET /zipcode_info returns aggregate statistics', async () => {
  await supertest(app)
    .get('/zipcode_info')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const zipInfo = response.body[0];
        expect(zipInfo).toHaveProperty('zip_code');
        expect(zipInfo).toHaveProperty('avg_market_value');
        expect(zipInfo).toHaveProperty('property_count');
        expect(zipInfo).toHaveProperty('population');
        expect(zipInfo).toHaveProperty('total_crimes');
        expect(zipInfo).toHaveProperty('police_stations');
        expect(zipInfo).toHaveProperty('crime_rate_per_capita');
        expect(Number(zipInfo.avg_market_value)).toBeGreaterThan(0);
        expect(Number(zipInfo.property_count)).toBeGreaterThan(0);
        expect(Number(zipInfo.population)).toBeGreaterThan(0);
        expect(response.body.length).toBe(46);
      }
    });
});

test('GET /street_patterns returns street analysis', async () => {
  await supertest(app)
    .get('/street_patterns')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const streetData = response.body[0];
        expect(streetData).toHaveProperty('street_name');
        expect(streetData).toHaveProperty('num_properties');
        expect(streetData).toHaveProperty('property_types');
        expect(streetData).toHaveProperty('newest_property');
        expect(streetData).toHaveProperty('oldest_property');
        expect(streetData).toHaveProperty('num_crimes');
        expect(streetData).toHaveProperty('crime_types');
        expect(streetData).toHaveProperty('avg_crime_hour');
        expect(streetData).toHaveProperty('months_with_crimes');
        expect(streetData).toHaveProperty('crimes_per_month');
        expect(streetData).toHaveProperty('crimes_per_property');
        expect(streetData.street_name).toBe('N BROAD ST');
        expect(Number(streetData.num_properties)).toBeGreaterThanOrEqual(5);
        expect(response.body.length).toBe(2685);
      }
    });
}, 10000);

test('GET /safe_high_value_properties returns filtered properties', async () => {
  await supertest(app)
    .get('/safe_high_value_properties?min_market_value=1000000&crime_type=Robbery')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const property = response.body[0];
        expect(property).toHaveProperty('location');
        expect(property).toHaveProperty('market_value');
        expect(property).toHaveProperty('zip_code');
        expect(property).toHaveProperty('population');
        expect(property).toHaveProperty('total_crimes_in_zip');
        expect(Number(property.market_value)).toBeGreaterThan(1000000);
      }
    });
});

test('GET /street_info returns street information', async () => {
  await supertest(app)
    .get('/street_info')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const streetInfo = response.body[0];
        expect(streetInfo).toHaveProperty('street_name');
        expect(streetInfo).toHaveProperty('property_count');
        expect(streetInfo).toHaveProperty('avg_market_value');
        expect(streetInfo).toHaveProperty('total_crimes_2018');
        expect(streetInfo).toHaveProperty('crime_type_distribution');
        expect(Number(streetInfo.property_count)).toBeGreaterThan(0);
        expect(Number(streetInfo.avg_market_value)).toBeGreaterThan(0);
        expect(response.body.length).toBe(4879);
      }
    });
});

test('POST /crime_near_address returns nearby crimes and stations', async () => {
  await supertest(app)
    .post('/crime_near_address')
    .send({
      address: '1420 LOCUST ST',
      radius: 0.5
    })
    .expect(200)
    .then((response) => {
      expect(response.body).toHaveProperty('crimes');
      expect(response.body).toHaveProperty('stations');
      expect(Array.isArray(response.body.crimes)).toBe(true);
      expect(Array.isArray(response.body.stations)).toBe(true);
      
      if (response.body.crimes.length > 0) {
        const crime = response.body.crimes[0];
        expect(crime).toHaveProperty('text_general_code');
        expect(crime).toHaveProperty('crime_count');
        expect(crime).toHaveProperty('zip_code');
        expect(crime).toHaveProperty('lat');
        expect(crime).toHaveProperty('lng');
        expect(crime).toHaveProperty('distance_km');
        expect(Number(crime.distance_km)).toBeLessThanOrEqual(0.5);
      }

      if (response.body.stations.length > 0) {
        const station = response.body.stations[0];
        expect(station).toHaveProperty('location');
        expect(station).toHaveProperty('lat');
        expect(station).toHaveProperty('lng');
        expect(station).toHaveProperty('distance_km');
        expect(Number(station.distance_km)).toBeLessThanOrEqual(0.5);
      }
    });
}, 10000);

test('GET /property_location returns geocoded coordinates', async () => {
  await supertest(app)
    .get('/property_location?address=1420 LOCUST ST')
    .expect(200)
    .then((response) => {
      expect(response.body).toHaveProperty('latitude');
      expect(response.body).toHaveProperty('longitude');
      expect(Number(response.body.latitude)).toBeTruthy();
      expect(Number(response.body.longitude)).toBeTruthy();
    });
}, 10000);

test('GET /property_location requires address parameter', async () => {
  await supertest(app)
    .get('/property_location')
    .expect(200)
    .then((response) => {
      expect(response.display_name).toBeUndefined();
    });
});

test('POST /crime_near_address requires address and radius', async () => {
  await supertest(app)
    .post('/crime_near_address')
    .send({})
    .expect(400)
    .then((response) => {
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Address and radius are required');
    });
});

test('GET /safe_high_value_properties requires parameters', async () => {
  await supertest(app)
    .get('/safe_high_value_properties')
    .expect(400)
    .then((response) => {
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Missing required query parameters.');
    });
});

test('GET /average_house_price/:zipcode with invalid zipcode returns 404', async () => {
  await supertest(app)
    .get('/average_house_price/00000')
    .expect(404)
    .then((response) => {
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('No data found for zip code 00000');
    });
});

test('GET /police_stations/:zipcode with invalid zipcode returns empty array', async () => {
  await supertest(app)
    .get('/police_stations/00000')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
});

test('GET /crimes_in_zip/:zipcode with invalid zipcode returns empty array', async () => {
  await supertest(app)
    .get('/crimes_in_zip/00000')
    .expect(200)
    .then((response) => {
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
});

test('POST /crime_near_address handles invalid address', async () => {
  await supertest(app)
    .post('/crime_near_address')
    .send({
      address: 'thisisnotarealaddressatall123456',
      radius: 0.5
    })
    .expect(404)
    .then((response) => {
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Address not found');
    });
}, 10000);

