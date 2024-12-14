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
  const [address, setAddress] = useState("");
  const [crimeStats, setCrimeStats] = useState(null);
  const [avgHousePrice, setAvgHousePrice] = useState("");
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
  const [addressSearchResults, setAddressSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12;

  // Handle Zip Code and Filter Search
  const handleSearchByZip = async () => {
    try {
      const propertiesURL = new URL("http://localhost:8080/properties_in_zip");
      propertiesURL.searchParams.append("zipcode", zipcode);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            propertiesURL.searchParams.append(key, value);
          }
        });
      }

      if (address) {
        propertiesURL.searchParams.append("address", address);
      }

      // Fetch properties by zip code and optionally by filters and address
      const propertiesResponse = await fetch(propertiesURL);
      if (!propertiesResponse.ok) {
        throw new Error(`HTTP error! status: ${propertiesResponse.status}`);
      }
      const propertiesData = await propertiesResponse.json();
      setProperties(propertiesData);

      // Fetch crime stats by zip code
      const crimeResponse = await fetch(
        `http://localhost:8080/crime_per_capita/${zipcode}`
      );
      if (!crimeResponse.ok) {
        throw new Error(`HTTP error! status: ${crimeResponse.status}`);
      }
      const crimeData = await crimeResponse.json();
      setCrimeStats(crimeData);

      // Fetch average house price by zip code
      const avgPriceResponse = await fetch(
        `http://localhost:8080/average_house_price/${zipcode}`
      );
      if (!avgPriceResponse.ok) {
        throw new Error(`HTTP error! status: ${avgPriceResponse.status}`);
      }
      const price = await avgPriceResponse.json();
      setAvgHousePrice(price);

      setAddressSearchResults([]); // Clear specific property display
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
      // Construct URL with optional zipcode parameter
      const url = new URL(
        `http://localhost:8080/property/${encodeURIComponent(address)}`
      );
      if (zipcode) {
        url.searchParams.append("zipcode", zipcode);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAddressSearchResults(data);
      setProperties([]); // Clear zip code search results

      // If zipcode is provided, also fetch zipcode-related data
      if (zipcode) {
        // Fetch crime stats
        const crimeResponse = await fetch(
          `http://localhost:8080/crime_per_capita/${zipcode}`
        );
        if (crimeResponse.ok) {
          const crimeData = await crimeResponse.json();
          setCrimeStats(crimeData);
        }

        // Fetch average house price
        const avgPriceResponse = await fetch(
          `http://localhost:8080/average_house_price/${zipcode}`
        );
        if (avgPriceResponse.ok) {
          const price = await avgPriceResponse.json();
          setAvgHousePrice(price);
        }
      } else {
        // Clear zipcode-related data if no zipcode provided
        setCrimeStats(null);
        setAvgHousePrice("");
      }
    } catch (error) {
      console.error("Error fetching property by address:", error);
      setAddressSearchResults([]);
    }
  };

  // gets property image
  const getPropertyImage = (propertyType) => {
    const type = propertyType?.toLowerCase();

    const imageMap = {
      "multi family": "/images/multi-family.jpg",
      "single family": "/images/single-family.jpg",
      "garage - residential": "/images/garage-residential.jpg",
      "mixed use": "/images/mixed-use.jpg",
      "apartments  > 4 units": "/images/large-apartment.jpg",
      "vacant land - residential": "/images/vacant-residential.jpg",
      commercial: "/images/commercial.jpg",
      "special purpose": "/images/special-purpose.jpg",
      industrial: "/images/industrial.jpg",
      "garage - commercial": "/images/garage-commercial.jpg",
      "vacant land": "/images/vacant-land.jpg",
      offices: "/images/offices.jpg",
      retail: "/images/retail.jpg",
    };

    return imageMap[type] || "/images/default-property.jpg";
  };

  // Handle Pagination
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);
  const currentAddresses =
    addressSearchResults.length > 0
      ? addressSearchResults.slice(startIndex, endIndex)
      : currentProperties;

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
          Search for properties in your desired neighborhood by zip code and/or
          specific address.
        </Typography>

        {/* Zip Code Search */}
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        >
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
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        >
          <TextField
            label="Enter Address"
            variant="outlined"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ marginRight: "10px", width: "300px" }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleSearchByAddress}
          >
            Search by Address
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      {
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
          {/* Apply Filters Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleSearchByZip}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      }

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
          <Typography variant="h6">
            Safety Information for Zip Code: {zipcode}{" "}
          </Typography>
          <Typography>
            <strong>Population:</strong> {crimeStats.population}
          </Typography>
          <Typography>
            <strong>Total Crimes:</strong> {crimeStats.crime_count}
          </Typography>
          <Typography>
            <strong>Crime Per Capita:</strong>{" "}
            {Number(crimeStats.crime_per_capita).toFixed(4)}
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
          <Typography variant="h6">
            Average House Price for Zip Code: {zipcode}
          </Typography>
          <Typography>
            <strong>Average Price:</strong> $
            {Number(avgHousePrice.avg_house_price).toFixed(0)}
          </Typography>
        </Box>
      )}

      {properties.length === 0 &&
        addressSearchResults.length === 0 &&
        zipcode === "" &&
        address === "" && (
          <Box sx={{ textAlign: "center", marginTop: "20px", color: "gray" }}>
            <Typography variant="h6">
              Please enter a zip code or address to search for properties.
            </Typography>
          </Box>
        )}

      {properties.length === 0 &&
        addressSearchResults.length === 0 &&
        (zipcode || address) && (
          <Box sx={{ textAlign: "center", marginTop: "20px", color: "gray" }}>
            <Typography variant="h6">
              No results found. Please try a different zip code or address.
            </Typography>
          </Box>
        )}
      {/* Property Display Section */}
      <Grid container spacing={3}>
        {addressSearchResults.length > 0
          ? // Map through address search results
            currentAddresses.map((property, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ maxWidth: 345 }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={getPropertyImage(property.category_code_description)}
                    alt={`${property.category_code_description} property`}
                  />
                  <CardContent>
                    <Typography variant="h6">{property.location}</Typography>
                    <Typography>
                      <strong>Zip Code:</strong> {property.zip_code}
                    </Typography>
                    <Typography>
                      <strong>Market Value:</strong> ${property.market_value}
                    </Typography>
                    <Typography>
                      <strong>Sale Price:</strong> ${property.sale_price}
                    </Typography>
                    <Typography>
                      <strong>Bathrooms:</strong> {property.number_of_bathrooms}
                    </Typography>
                    <Typography>
                      <strong>Bedrooms:</strong> {property.number_of_bedrooms}
                    </Typography>
                    <Typography>
                      <strong>Year Built:</strong> {property.year_built}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : // Map through zip code search results
            currentAddresses.map((property, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ maxWidth: 345 }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={getPropertyImage(property.category_code_description)}
                    alt={`${property.category_code_description} property`}
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
            ))}
      </Grid>

      {/* Pagination */}
      {(addressSearchResults.length > propertiesPerPage ||
        properties.length > propertiesPerPage) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <Pagination
            count={Math.ceil(
              (addressSearchResults.length > 0
                ? addressSearchResults.length
                : properties.length) / propertiesPerPage
            )}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
