import React, { useState } from "react";
import {
  Typography,
  Box,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const SafeHighValueProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minMarketValue, setMinMarketValue] = useState(100000); // Default value
  const [crimeType, setCrimeType] = useState("Vagrancy/Loitering"); // Default value
  const [submitted, setSubmitted] = useState(false); // Track if the form has been submitted

  const fetchData = () => {
    setLoading(true);
    setSubmitted(true);
    fetch(
      `${API_URL}/safe_high_value_properties?min_market_value=${minMarketValue}&crime_type=${crimeType}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched data:", data); // Debugging log
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error); // Debugging log
        setError(error);
        setLoading(false);
      });
  };

  const handleMarketValueChange = (event, newValue) => {
    setMinMarketValue(newValue);
  };

  const handleCrimeTypeChange = (event) => {
    setCrimeType(event.target.value);
  };

  const handleSubmit = () => {
    fetchData();
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h6" sx={{ marginBottom: "50px" }} gutterBottom>
        Safe High Value Properties
      </Typography>
      <Box sx={{ marginBottom: "20px" }}>
        <FormControl sx={{ marginRight: "20px", minWidth: 200 }}>
          <InputLabel>Crime Type</InputLabel>
          <Select
            value={crimeType}
            onChange={handleCrimeTypeChange}
            sx={{ marginTop: "20px" }} // Add margin to create space
          >
            <MenuItem value="Vagrancy/Loitering">Vagrancy/Loitering</MenuItem>
            <MenuItem value="Forgery and Counterfeiting">
              Forgery and Counterfeiting
            </MenuItem>
            <MenuItem value="Arson">Arson</MenuItem>
            <MenuItem value="Robbery No Firearm">Robbery No Firearm</MenuItem>
            <MenuItem value="Receiving Stolen Property">
              Receiving Stolen Property
            </MenuItem>
            <MenuItem value="Vandalism/Criminal Mischief">
              Vandalism/Criminal Mischief
            </MenuItem>
            <MenuItem value="Public Drunkenness">Public Drunkenness</MenuItem>
            <MenuItem value="Weapon Violations">Weapon Violations</MenuItem>
            <MenuItem value="All Other Offenses"> All Other Offenses</MenuItem>
            <MenuItem value="Thefts">Thefts</MenuItem>
            <MenuItem value="Burglary Residential">
              Burglary Residential
            </MenuItem>
            <MenuItem value="Fraud">Fraud</MenuItem>
            <MenuItem value="Liquor Law Violations">
              Liquor Law Violations
            </MenuItem>
            <MenuItem value="Other Sex Offenses (Not Commercialized)">
              Other Sex Offenses (Not Commercialized)
            </MenuItem>
            <MenuItem value="Homicide - Criminal">Homicide - Criminal</MenuItem>
            <MenuItem value="Aggravated Assault No Firearm">
              Aggravated Assault No Firearm
            </MenuItem>
            <MenuItem value="Prostitution and Commercialized Vice">
              Prostitution and Commercialized Vice
            </MenuItem>
            <MenuItem value="Robbery Firearm">Robbery Firearm</MenuItem>
            <MenuItem value="Embezzlement">Embezzlement</MenuItem>
            <MenuItem value="Disorderly Conduct">Disorderly Conduct</MenuItem>
            <MenuItem value="Gambling Violations">Gambling Violations</MenuItem>
            <MenuItem value="Narcotic / Drug Law Violations">
              Narcotic / Drug Law Violations
            </MenuItem>
            <MenuItem value="Aggravated Assault Firearm">
              Aggravated Assault Firearm
            </MenuItem>
            <MenuItem value="Rape">Rape</MenuItem>
            <MenuItem value="Other Assaults">Other Assaults</MenuItem>
            <MenuItem value="Burglary Non-Residential">
              Burglary Non-Residential
            </MenuItem>
            <MenuItem value="Motor Vehicle Theft">Motor Vehicle Theft</MenuItem>
            <MenuItem value="Theft from Vehicle">Theft from Vehicle</MenuItem>
            <MenuItem value="Offenses Against Family and Children">
              Offenses Against Family and Children
            </MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ width: 300, display: "inline-block" }}>
          <Typography gutterBottom>Minimum Market Value</Typography>
          <Slider
            value={minMarketValue}
            onChange={handleMarketValueChange}
            aria-labelledby="min-market-value-slider"
            valueLabelDisplay="auto"
            step={50000}
            marks
            min={0}
            max={1000000}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ marginLeft: "20px" }}
        >
          Submit
        </Button>
      </Box>
      {submitted && (
        <>
          {loading && <Typography>Loading...</Typography>}
          {error && (
            <Typography>Error fetching data: {error.message}</Typography>
          )}
          {!loading && !error && data.length === 0 && (
            <Typography>
              There are no properties without the crime {crimeType}.
            </Typography>
          )}
          {!loading && !error && data.length > 0 && (
            <>
              <DataGrid
                rows={data.map((row, index) => ({
                  id: index,
                  ...row,
                }))}
                columns={[
                  { field: "location", headerName: "Location", width: 200 },
                  {
                    field: "market_value",
                    headerName: "Market Value",
                    width: 150,
                  },
                  { field: "zip_code", headerName: "Zip Code", width: 130 },
                  { field: "population", headerName: "Population", width: 150 },
                  {
                    field: "total_crimes_in_zip",
                    headerName: "Total Crimes in Zip",
                    width: 200,
                  },
                ]}
                pageSize={10}
                autoHeight
              />
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default SafeHighValueProperties;