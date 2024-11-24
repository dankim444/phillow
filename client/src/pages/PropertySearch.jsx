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
} from "@mui/material";

export default function PropertySearch() {
  const [zipcode, setZipcode] = useState("");
  const [properties, setProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12; // Number of properties per page

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/properties_in_zip?zipcode=${zipcode}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProperties(data); // Set properties from API response
      setCurrentPage(1); // Reset to first page when new data is fetched
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  // Calculate properties to display for the current page
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

  // Handle pagination page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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
          Search for properties in your desired neighborhood by zip code.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <TextField
            label="Enter Zip Code"
            variant="outlined"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            sx={{ marginRight: "10px", width: "300px" }}
          />
          <Button variant="contained" size="large" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </Box>

      {/* Properties Display Section */}
      <Grid container spacing={3}>
        {currentProperties.length > 0 ? (
          currentProperties.map((property, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ maxWidth: 345, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
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
        ) : (
          <Typography variant="body1" color="textSecondary" sx={{ marginTop: "20px" }}>
            No properties found. Try another zip code.
          </Typography>
        )}
      </Grid>

      {/* Pagination Section */}
      {properties.length > propertiesPerPage && (
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
