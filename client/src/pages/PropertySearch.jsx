import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Pagination,
  Slider,
} from "@mui/material";

export default function PropertySearch() {
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState(""); // State for address search
  const [crimeStats, setCrimeStats] = useState(null); // State for crime stats
  const [avgHousePrice, setAvgHousePrice] = useState("")
  const [filters, setFilters] = useState({
    min_bathrooms: 0,
    max_bathrooms: 10,
    min_bedrooms: 0,
    max_bedrooms: 10,
    min_livable_area: 0,
    max_livable_area: 10000,
    min_market_value: 0,
    max_market_value: 5000000,
  });
  const [properties, setProperties] = useState([]);
  const [specificProperty, setSpecificProperty] = useState(null); // State for specific property search
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12;

  // Handle Zip Code and Filter Search
  const handleSearchByZip = async () => {
    try {
      const params = new URLSearchParams({
        zipcode,
        ...filters,
      });

      // Fetch properties by zip code
      const propertiesResponse = await fetch(
        `http://localhost:8080/properties_in_zip?${params.toString()}`
      );
      if (!propertiesResponse.ok) {
        throw new Error(`HTTP error! status: ${propertiesResponse.status}`);
      }
      const propertiesData = await propertiesResponse.json();
      setProperties(propertiesData);

      // Fetch crime stats by zip code
      const crimeResponse = await fetch(`http://localhost:8080/crime_per_capita/${zipcode}`);
      if (!crimeResponse.ok) {
        throw new Error(`HTTP error! status: ${crimeResponse.status}`);
      }
      const crimeData = await crimeResponse.json();
      setCrimeStats(crimeData);

      // Fetch average house price by zip code
      const avgPriceResponse = await fetch(`http://localhost:8080/average_house_price/${zipcode}`);
      if (!avgPriceResponse.ok) {
        throw new Error(`HTTP error! status: ${avgPriceResponse.status}`);
      }
      const price = await avgPriceResponse.json();
      setAvgHousePrice(price);

      setSpecificProperty(null); // Clear specific property display
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching data:", error);
      setProperties([]);
      setCrimeStats(null); // Clear crime stats on error
      setAvgHousePrice("");
    }
  };

  // Handle Specific Address Search
  const handleSearchByAddress = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/property/${encodeURIComponent(address)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSpecificProperty(data[0] || null); // Set specific property or null if not found
      setProperties([]); // Clear zip code search results
    } catch (error) {
      console.error("Error fetching property by address:", error);
    }
  };

  // Handle Pagination
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Handle Filter Changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return (
    <Box sx={{ padding: "20px" }}>
      {/* Search Section */}
      <Box
        sx={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Find Your Dream Home
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Search for properties in your desired neighborhood by zip code or specific address.
        </Typography>

        {/* Zip Code Search */}
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <TextField
            label="Enter Zip Code"
            variant="outlined"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            sx={{ marginRight: "10px", width: "300px" }}
          />
          <Button variant="contained" size="large" onClick={handleSearchByZip}>
            Search by Zip Code
          </Button>
        </Box>

        {/* Address Search */}
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <TextField
            label="Enter Address"
            variant="outlined"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ marginRight: "10px", width: "300px" }}
          />
          <Button variant="contained" size="large" onClick={handleSearchByAddress}>
            Search by Address
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      {(
        <Box sx={{ marginBottom: "20px" }}>
          <Typography variant="h6">Filters</Typography>
          <Grid container spacing={3} sx={{ marginTop: "10px" }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Bathrooms</Typography>
              <Slider
                value={[filters.min_bathrooms, filters.max_bathrooms]}
                onChange={(e, value) =>
                  handleFilterChange("min_bathrooms", value[0]) ||
                  handleFilterChange("max_bathrooms", value[1])
                }
                valueLabelDisplay="auto"
                min={0}
                max={10}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Bedrooms</Typography>
              <Slider
                value={[filters.min_bedrooms, filters.max_bedrooms]}
                onChange={(e, value) =>
                  handleFilterChange("min_bedrooms", value[0]) ||
                  handleFilterChange("max_bedrooms", value[1])
                }
                valueLabelDisplay="auto"
                min={0}
                max={10}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Livable Area (sq. ft.)</Typography>
              <Slider
                value={[filters.min_livable_area, filters.max_livable_area]}
                onChange={(e, value) =>
                  handleFilterChange("min_livable_area", value[0]) ||
                  handleFilterChange("max_livable_area", value[1])
                }
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={100}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography>Market Value ($)</Typography>
              <Slider
                value={[filters.min_market_value, filters.max_market_value]}
                onChange={(e, value) =>
                  handleFilterChange("min_market_value", value[0]) ||
                  handleFilterChange("max_market_value", value[1])
                }
                valueLabelDisplay="auto"
                min={0}
                max={5000000}
                step={50000}
              />
            </Grid>
          </Grid>
        </Box>
      )}

    {/* Crime Statistics Display */}
    {crimeStats && (
        <Box
          sx={{
            backgroundColor: "#e3f2fd",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h6">Safety Information for Zip Code </Typography>
          <Typography>
            <strong>Population:</strong> {crimeStats.population}
          </Typography>
          <Typography>
            <strong>Total Crimes:</strong> {crimeStats.crime_count}
          </Typography>
          <Typography>
            <strong>Crime Per Capita:</strong> {Number(crimeStats.crime_per_capita).toFixed(4)}
          </Typography>
        </Box>
      )}

{/* Average House Price Display */}
{avgHousePrice && (
  <Box
    sx={{
      backgroundColor: "#e8f5e9", // Light green for house price
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      textAlign: "center",
      marginBottom: "20px",
    }}
  >
    <Typography variant="h6">Average House Price for Zip Code</Typography>
    <Typography>
      <strong>Average Price:</strong> ${Number(avgHousePrice.avg_house_price).toFixed(0)}
    </Typography>
  </Box>
)}

{(properties.length === 0 && specificProperty === null && zipcode === "" && address === "") && (
  <Box sx={{ textAlign: "center", marginTop: "20px", color: "gray" }}>
    <Typography variant="h6">Please enter a zip code or address to search for properties.</Typography>
  </Box>
)}

{(properties.length === 0 && specificProperty === null && (zipcode || address)) && (
  <Box sx={{ textAlign: "center", marginTop: "20px", color: "gray" }}>
    <Typography variant="h6">No results found. Please try a different zip code or address.</Typography>
  </Box>
)}
      {/* Property Display Section */}
      <Grid container spacing={3}>
        {specificProperty ? (
          <Grid item xs={12}>
            <Card sx={{ maxWidth: 600, margin: "0 auto" }}>
              <CardContent>
                <Typography variant="h5">{specificProperty.location}</Typography>
                <Typography><strong>Zip Code:</strong> {specificProperty.zip_code}</Typography>
                <Typography><strong>Market Value:</strong> ${specificProperty.market_value}</Typography>
                <Typography><strong>Sale Price:</strong> ${specificProperty.sale_price}</Typography>
                <Typography><strong>Sale Date:</strong> {specificProperty.sale_date}</Typography>
                <Typography><strong>Category:</strong> {specificProperty.category_code_description}</Typography>
                <Typography><strong>Bathrooms:</strong> {specificProperty.number_of_bathrooms}</Typography>
                <Typography><strong>Bedrooms:</strong> {specificProperty.number_of_bedrooms}</Typography>
                <Typography><strong>Livable Area:</strong> {specificProperty.total_livable_area} sq. ft.</Typography>
                <Typography><strong>Total Area:</strong> {specificProperty.total_area} sq. ft.</Typography>
                <Typography><strong>Year Built:</strong> {specificProperty.year_built}</Typography>
                <Typography><strong>Number of Stories:</strong> {specificProperty.number_stories}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          currentProperties.map((property, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image="https://via.placeholder.com/300x180.png?text=Property+Image"
                  alt="Property Image"
                />
                <CardContent>
                  <Typography variant="h6">{property.location}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Market Value: ${property.market_value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bedrooms: {property.number_of_bedrooms}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bathrooms: {property.number_of_bathrooms}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Year Built: {property.year_built}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination */}
      {!specificProperty && properties.length > propertiesPerPage && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <Pagination
            count={Math.ceil(properties.length / propertiesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
