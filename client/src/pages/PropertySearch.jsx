import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Pagination,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import PropertyCard from "../components/PropertyCard";

export default function PropertySearch() {
  const [zipcode, setZipcode] = useState(""); // Selected zip code
  const [address, setAddress] = useState(""); // Entered address
  const [crimeStats, setCrimeStats] = useState(null); // Crime statistics
  const [avgHousePrice, setAvgHousePrice] = useState(""); // Average house price
  const [filters, setFilters] = useState({
    min_bathrooms: 0,
    max_bathrooms: 10,
    min_bedrooms: 0,
    max_bedrooms: 10,
    min_livable_area: 0,
    max_livable_area: 10000,
    min_market_value: 0,
    max_market_value: 5000000,
  }); // Filter settings
  const [properties, setProperties] = useState([]); // Properties for zip code search
  const [addressSearchResults, setAddressSearchResults] = useState([]); // Results for address search
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const propertiesPerPage = 12; // Number of properties displayed per page

  const zipCodes = [
    "19102", "19103", "19104", "19106", "19107", "19111", "19114", "19115",
    "19116", "19118", "19119", "19120", "19121", "19122", "19123", "19124",
    "19125", "19126", "19127", "19128", "19129", "19130", "19131", "19132",
    "19133", "19134", "19135", "19136", "19137", "19138", "19139", "19140",
    "19141", "19142", "19143", "19144", "19145", "19146", "19147", "19148",
    "19149", "19150", "19151", "19152", "19153", "19154",
  ];

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
          Search for properties in your desired neighborhood by zip code or
          specific address.
        </Typography>

        {/* Zip Code Search with Dropdown */}
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        >
          <FormControl sx={{ width: "300px", marginRight: "10px" }}>
            <InputLabel>Select Zip Code</InputLabel>
            <Select
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              label="Select Zip Code"
            >
              {zipCodes.map((zip) => (
                <MenuItem key={zip} value={zip}>
                  {zip}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="large"
            onClick={() => handleSearchByZip()}
            disabled={!zipcode} // Disable button if no zip code selected
          >
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
            onClick={() => handleSearchByAddress()}
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


      {/* Display crime stats */}
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
            Safety Information for Zip Code {zipcode}
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

      {/* Display average house price */}
      {avgHousePrice && (
        <Box
          sx={{
            backgroundColor: "#e8f5e9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h6">
            Average House Price for Zip Code {zipcode}
          </Typography>
          <Typography>
            <strong>Average Price:</strong> $
            {Number(avgHousePrice.avg_house_price).toFixed(2)}
          </Typography>
        </Box>
      )}

      {/* Display properties */}
      <Grid container spacing={3}>
        {currentAddresses.map((property, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <PropertyCard property={property} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {(addressSearchResults.length > propertiesPerPage ||
        properties.length > propertiesPerPage) && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
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

