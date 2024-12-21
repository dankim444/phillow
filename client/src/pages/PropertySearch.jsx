import React, { useState, useEffect } from "react";
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
import { Link } from "react-router-dom"; // Import Link

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function PropertySearch() {
  const [zipcode, setZipcode] = useState(""); // Selected zip code
  const [address, setAddress] = useState(""); // Entered address
  const [crimeStats, setCrimeStats] = useState(null); // Crime statistics
  const [avgHousePrice, setAvgHousePrice] = useState(""); // Average house price
  const [filters, setFilters] = useState({
    min_bathrooms: 0,
    max_bathrooms: 25,
    min_bedrooms: 0,
    max_bedrooms: 45,
    min_livable_area: 0,
    max_livable_area: 45000,
    min_market_value: 0,
    max_market_value: 12000000,
  }); // Filter settings
  const [properties, setProperties] = useState([]); // Properties for search results
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const propertiesPerPage = 12; // Number of properties displayed per page
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );

  useEffect(() => {
    const savedMode = JSON.parse(localStorage.getItem("darkMode"));
    if (savedMode) setDarkMode(savedMode);
  }, []);

  const zipCodes = [
    "19102",
    "19103",
    "19104",
    "19106",
    "19107",
    "19111",
    "19114",
    "19115",
    "19116",
    "19118",
    "19119",
    "19120",
    "19121",
    "19122",
    "19123",
    "19124",
    "19125",
    "19126",
    "19127",
    "19128",
    "19129",
    "19130",
    "19131",
    "19132",
    "19133",
    "19134",
    "19135",
    "19136",
    "19137",
    "19138",
    "19139",
    "19140",
    "19141",
    "19142",
    "19143",
    "19144",
    "19145",
    "19146",
    "19147",
    "19148",
    "19149",
    "19150",
    "19151",
    "19152",
    "19153",
    "19154",
  ];

  const validateInputs = () => {
    if (!zipcode && !address) {
      alert("Please enter a zip code or address.");
      return false;
    }
    if (zipcode && !zipCodes.includes(zipcode)) {
      alert("Please enter a valid zip code.");
      return false;
    }
    return true;
  };

  const handleSearch = async () => {
    if (!validateInputs()) return;

    try {
      const propertiesURL = new URL(`${API_URL}/properties`);

      if (zipcode) {
        propertiesURL.searchParams.append("zipcode", zipcode);
      }

      if (address) {
        propertiesURL.searchParams.append("address", address);
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            propertiesURL.searchParams.append(key, value);
          }
        });
      }

      // Fetch properties by zip code and optionally by filters and address
      const propertiesResponse = await fetch(propertiesURL);
      if (!propertiesResponse.ok) {
        throw new Error(`HTTP error! status: ${propertiesResponse.status}`);
      }
      const propertiesData = await propertiesResponse.json();
      setProperties(propertiesData);

      // Fetch crime stats by zip code
      if (zipcode) {
        const crimeResponse = await fetch(
          `${API_URL}/crime_per_capita/${zipcode}`
        );
        if (!crimeResponse.ok) {
          throw new Error(`HTTP error! status: ${crimeResponse.status}`);
        }
        const crimeData = await crimeResponse.json();
        setCrimeStats(crimeData);
      }

      // Fetch average house price by zip code
      if (zipcode) {
        const avgPriceResponse = await fetch(
          `${API_URL}/average_house_price/${zipcode}`
        );
        if (!avgPriceResponse.ok) {
          throw new Error(`HTTP error! status: ${avgPriceResponse.status}`);
        }
        const price = await avgPriceResponse.json();
        setAvgHousePrice(price);
      }

      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching data:", error);
      setProperties([]);
      setCrimeStats(null); // Clear crime stats on error
      setAvgHousePrice("");
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
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: darkMode ? "#121212" : "#f8f9fa",
        color: darkMode ? "#f0f0f0" : "#333",
      }}
    >
      <Box
        sx={{
          backgroundColor: darkMode ? "#121212" : "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <Box sx={{ textAlign: "left" }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            sx={{
              marginBottom: "20px",
              padding: "8px 16px",
              fontSize: "1rem",
            }}
          >
            Home
          </Button>
        </Box>
        <Typography variant="h4" gutterBottom>
          Find Your Dream Home
        </Typography>
        <Typography variant="body1" gutterBottom>
          Search for properties in your desired neighborhood by zip code or
          specific address.
        </Typography>

        {/* Zip Code Search with Dropdown */}
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        >
          <FormControl
            sx={{
              width: "300px",
              marginRight: "10px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: darkMode ? "#f0f0f0" : "#333", // Outline color
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#f0f0f0" : "#333", // Outline color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "#f0f0f0" : "#333", // Outline color when focused
                },
              },
            }}
          >
            <InputLabel
              sx={{
                color: darkMode ? "#f0f0f0" : "#333",
              }}
            >
              Select Zip Code
            </InputLabel>
            <Select
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              label="Select Zip Code"
              sx={{
                color: darkMode ? "#f0f0f0" : "#333", // Change color based on dark mode
                "& .MuiSelect-icon": {
                  color: darkMode ? "#f0f0f0" : "#333", // Change icon color based on dark mode
                },
              }}
            >
              {zipCodes.map((zip) => (
                <MenuItem key={zip} value={zip}>
                  {zip}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" size="large" onClick={handleSearch}>
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
            sx={{
              marginRight: "10px",
              width: "300px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: darkMode ? "#f0f0f0" : "#333", // Outline color
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#f0f0f0" : "#333", // Outline color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "#f0f0f0" : "#333", // Outline color when focused
                },
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#f0f0f0" : "#333", // Label color
              },
              "& .MuiInputBase-input": {
                color: darkMode ? "#f0f0f0" : "#333", // Text color
              },
            }}
          />
          <Button variant="contained" size="large" onClick={handleSearch}>
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
                max={25}
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
                max={45}
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
                max={45000}
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
                max={12000000}
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
            <Button variant="contained" size="large" onClick={handleSearch}>
              Apply Filters
            </Button>
          </Box>
        </Box>
      }

      {/* Display crime stats */}
      {crimeStats && (
        <Box
          sx={{
            backgroundColor: darkMode ? "#2e3b4e" : "#e3f2fd",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h6">Safety Information for Zip Code</Typography>
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
            backgroundColor: darkMode ? "#2e4e3b" : "#e8f5e9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h6">Average House Price for Zip Code</Typography>
          <Typography>
            <strong>Average Price:</strong> $
            {Number(avgHousePrice.avg_house_price).toFixed(2)}
          </Typography>
        </Box>
      )}

      {/* Display properties */}
      <Grid container spacing={3}>
        {currentProperties.map((property, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <PropertyCard property={property} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {properties.length > propertiesPerPage && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            backgroundColor: darkMode ? "#333" : "#f0f0f0", // Background color based on dark mode
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <Pagination
            count={Math.ceil(properties.length / propertiesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: darkMode ? "#f0f0f0" : "#333", // Text color based on dark mode
              },
              "& .Mui-selected": {
                backgroundColor: darkMode ? "#555" : "#ddd", // Selected item background color
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
