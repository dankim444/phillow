# Phillow

## Overview

This project is a web application designed to help users search for properties in Philadelphia while providing insights into crime data in the surrounding areas. The platform combines real estate data and crime statistics to offer advanced filtering, safety scores, and interactive visualizations to aid decision-making.

## Instructions:
- clone this repo
- cd server, npm run start
- cd client, npm run start


## Features

- **Basic Property Search**:
  - Search for homes using filters such as price, square footage, number of bathrooms/bedrooms, and build year.
- **Crime Filtering**:
  - Filter properties based on specific types of crimes and their frequency within a given radius.
- **Interactive Map**:
  - Visualize properties and crime hotspots using an integrated map API.
- **Safety Score**:
  - Streets and neighborhoods are assigned safety scores based on property values, crime rates, and proximity to police stations.

## Database Schema

### **Tables**

#### `properties`

Stores real estate data including property characteristics, market value, and sales history.

- **Columns**:
- `object_id`, `location`, `zip_code`, `market_value`, `sale_price`, `sale_date`, `mailing_city_state`, `category_code_description`, `number_of_bathrooms`, `number_of_bedrooms`, `total_livable_area`, `total_area`, `year_built`, `number_stories`

#### `crime_data`

Stores crime incidents with information about location, type, and time of occurrence.

- **Columns**:
- `object_id`, `dispatch_date`, `dispatch_time`, `hour`, `text_general_code`, `location_block`, `lat`, `lng`, `zip_code`

#### `zipcode_population`

Maps zip codes to their population.

- **Columns**:
- `zip_code`, `population`

#### `police_stations`

Contains details about police stations in each zip code.

- **Columns**:
- `object_id`, `district_number`, `location`, `telephone_number`, `zip_code`

## Endpoints

### **Property-Related Endpoints**

1. **Get Property by Address**: `GET /property/:address`

   - Retrieves detailed information about a property at a specific address.

2. **Get Properties in Zip Code**: `GET /properties_in_zip`

   - Retrieves properties in a specific zip code, supporting filters like bathrooms, bedrooms, livable area, and market value.

3. **Average House Price by Zip Code**: `GET /avg_price_by_zip`

   - Returns the average market value of properties grouped by zip code.

4. **Average House Price for Populated Zip Codes**: `GET /average_house_price_over_population`
   - Returns average house prices for zip codes with populations exceeding 10,000.

### **Crime-Related Endpoints**

5. **Crime Per Capita**: `GET /crime_per_capita`

   - Computes and returns the crime rate per capita for each zip code.

6. **Crimes in a Zip Code**: `GET /crimes_in_zip/:zipcode`

   - Returns the coordinates and count of crimes by type in a specific zip code.

7. **Police Stations in a Zip Code**: `GET /police_stations/:zipcode`
   - Returns the locations of police stations in a given zip code.

### **Street-Level Analysis Endpoints**

8. **Street Data**: `GET /street_data/:street_name`

   - Provides the total number of properties and crimes committed on a specified street.

9. **Street Patterns**: `GET /street_patterns`

   - Analyzes property and crime patterns on individual streets, focusing on streets with at least five properties.

10. **Street Safety Scores**: `GET /street_safety_scores`
    - Calculates safety scores for streets based on property values, crime statistics, and police presence.

### **Safety and Investment Analysis Endpoints**

11. **Top Safe Zip Codes for Specific Crimes**: `GET /lowest_crime_zips`

    - Accepts up to three crime types and returns zip codes with the lowest per capita crime rates for those crimes.

12. **Investment Scores by Zip Code**: `GET /investment_scores`
    - Ranks zip codes based on property sales trends, safety, and market dynamics.

## Installation

### **Prerequisites**

- Node.js
- PostgreSQL
- Configured `.env` or `config.json` file for database credentials.

### **Setup**

1. Clone the repository:
   - git clone [url]
   - cd cis-550-project
2. Install Dependencies:
   - cd client
   - npm install
   - cd ../server
   - npm install
3. Set up the config.json file with database credentials.
4. Start the server:
   - npm run start
5. Start the client:
   - cd ../client
   - npm run start

## Tech stack

- **Backend**: Node.js, Express.js
- **Frontend**: React.js, Material UI, Redux
- **Database**: PostgreSQL

## Team

- Dan Kim
- Richard Zhang
- Xiaoshen Ma
- Kevin Zhou
