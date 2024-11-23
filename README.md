# Real Estate and Crime Data Platform

## Overview

This project is a web application designed to help users search for properties in Philadelphia while providing insights into crime data in the surrounding areas. The platform combines real estate data and crime statistics to offer advanced filtering, safety scores, and interactive visualizations to aid decision-making.

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
- `object_id`, `location`, `zip_code`, `market_value`, `sale_price`, `sale_date`, `number_of_bathrooms`, `number_of_bedrooms`, `year_built`, etc.

#### `crime_data`

Stores crime incidents with information about location, type, and time of occurrence.

- **Columns**:
- `object_id`, `dispatch_date`, `dispatch_time`, `text_general_code`, `location_block`, `lat`, `lng`.

#### `zipcode_population`

Maps zip codes to their population.

- **Columns**:
- `zip_code`, `population`.

#### `police_stations`

Contains details about police stations in each zip code.

- **Columns**:
- `object_id`, `district_number`, `location`, `zip_code`.

## Endpoints

### **Property-Related Endpoints**

1. **Get Property by Address**: GET /property/:address

   - Returns detailed information about a property at a specific address.

2. **Get Properties in Zip Code**: GET /properties_in_zip

   - Accepts filters like bathrooms, bedrooms, livable area, and market value to find properties in a specific zip code.

3. **Average House Price by Zip Code**: GET /avg_price_by_zip
   - Calculates and returns the average market value of properties grouped by zip code.

### **Crime-Related Endpoints**

4. **Crime Per Capita**: GET /crime_per_capita

   - Computes and returns the crime rate per capita for all zip codes.

5. **Crime Locations by Zip Code**: GET /crime_locations
   - Returns the coordinates and count of crimes by type for a specified zip code.

### **Safety Analysis Endpoints**

6. **Street Safety Scores**: GET /street_safety_scores

   - Calculates safety scores for streets based on property values, crime statistics, and police presence.

7. **Top Safe Zip Codes for Specific Crimes**: GET /safe_zipcodes

   - Accepts up to three crime types and returns zip codes with the lowest per capita crime rates for those crimes.

8. **Investment Score by Zip Code**: GET /investment_scores
   - Ranks zip codes based on property sales trends, safety, and market dynamics.

## Installation

### **Prerequisites**

- Node.js
- PostgreSQL
- Configured `.env` or `config.json` file for database credentials.

### **Setup**

1. Clone the repository:
    - git clone <repository-url>
    - cd <project-directory>
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

### Backend
- Node.js
- Express.js
### Frontend
- React.js
### Database
- PostgreSQL

## Team
- Dan Kim
- Richard Zhang
- Xioashen Ma
- Kevin Zhou



