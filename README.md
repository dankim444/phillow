# Phillow

## Overview

This project is a web application designed to help users search for properties in Philadelphia while providing insights into crime data in the surrounding areas. The platform combines real estate data and crime statistics to offer advanced filtering, safety scores, and interactive visualizations to aid decision-making.

## Features

### Page 1 - Property Search and Safety Overview

- **Property search bar and zip code selector**:
  - Search for homes by zip code or address.
- **Filter sliders for bathrooms, bedrooms, price, and livable area**:
  - Filter properties based on specific features.
- **Displays population, total crimes, crime per capita, and average house price for the zip code**:
  - View aggregated safety statistics for the selected area.
- **A list of properties and their corresponding information**:
  - Display detailed property information.

### Page 2 - Crime Map

- **View all the crimes in a selected neighborhood on a map**:
  - Visualize crime density and safety statistics.
- **Add multiple addresses and view total crimes, top crime types, and nearby police stations on an interactive map**:
  - Compare multiple locations.
- **Comparative table for quick evaluation of multiple locations**:
  - Evaluate safety and crime statistics side-by-side.

### Page 3 - Insights Page

- **Detailed table and distribution chart showing average market value, total crimes, population, and crime rate per capita by zip code**:
  - Explore property trends and safety data across Philadelphia.
- **Tabs for exploring crime info by street, property info by street, and identifying properties filtered by type of crime and market value**:
  - Detailed analysis of crime and property data.
- **Visual chart of market value distribution for quick trend analysis**:
  - Visualize market value trends.

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

1. **Get Properties**: `GET /properties`
   - Retrieves properties with optional filters for bathrooms, bedrooms, livable area, market value, and zip code.

2. **Get Property Location**: `GET /property_location`
   - Retrieves the geocode data for a given address.

3. **Average House Price by Zip Code**: `GET /average_house_price/:zipcode`
   - Returns the average market value of properties in a specific zip code.

### **Crime-Related Endpoints**

4. **Crime Per Capita by Zip Code**: `GET /crime_per_capita/:zipcode`
   - Computes and returns the crime rate per capita for a specific zip code.

5. **Crimes in a Zip Code**: `GET /crimes_in_zip/:zipcode`
   - Returns the coordinates and count of crimes by type in a specific zip code.

6. **Police Stations in a Zip Code**: `GET /police_stations/:zipcode`
   - Returns the locations of police stations in a given zip code.

### **Complex Queries**

7. **Zip Code Info**: `GET /zipcode_info`
   - Gets the average market value, property count, population, total crimes, police stations, and crime rate per capita for each zip code.

8. **Street Patterns**: `GET /street_patterns`
   - Analyzes property and crime patterns on individual streets, focusing on streets with at least five properties.

9. **Safe High-Value Properties**: `GET /safe_high_value_properties`
   - Returns properties with a market value above a specified threshold and no reported crimes of a specified type.

10. **Street Info**: `GET /street_info`
    - Gets info on every street including the number of crimes, number of properties, and types of crimes committed.

11. **Crimes Near Address**: `POST /crime_near_address`
    - Gets crimes within a variable radius of a given address.

## Installation

### **Prerequisites**

- Node.js
- PostgreSQL
- Configured `config.json` file for database credentials.

### **Setup**

1. Clone the repository:
   ```
   git clone [url]
   cd cis-550-project
   ```

2. Install Dependencies:
   ```
   cd client
   npm install
   cd ../server
   npm install
   ```

3. Set up the `config.json` file with database credentials.

4. Start the server:
   ```
   npm run start
   ```

5. Start the client:
   ```
   cd ../client
   npm run start
   ```

## Tech stack

- **Backend**: Node.js, Express.js
- **Frontend**: React.js, Material UI, Redux
- **Database**: PostgreSQL

## Team

- Dan Kim
- Richard Zhang
- Xiaoshen Ma
- Kevin Zhou
