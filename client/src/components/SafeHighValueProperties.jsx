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
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const SafeHighValueProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minMarketValue, setMinMarketValue] = useState(100000); // Default value
  const [crimeType, setCrimeType] = useState("Vagrancy/Loitering"); // Default value
  const [submitted, setSubmitted] = useState(false); // Track if the form has been submitted

  const fetchData = () => {
    setLoading(true);
    fetch(
      `http://localhost:8080/safe_high_value_properties?min_market_value=${minMarketValue}&crime_type=${crimeType}`
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
        setSubmitted(true);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
        setSubmitted(true);
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
      <Typography variant="h6" gutterBottom>
        Safe High Value Properties
      </Typography>
      <Box sx={{ marginBottom: "20px" }}>
        <FormControl sx={{ marginRight: "20px", minWidth: 200 }}>
          <InputLabel>Crime Type</InputLabel>
          <Select value={crimeType} onChange={handleCrimeTypeChange}>
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
              No data available. Please try a different option.
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
                  { field: "address", headerName: "Address", width: 200 },
                  { field: "zip_code", headerName: "Zip Code", width: 130 },
                  {
                    field: "market_value",
                    headerName: "Market Value",
                    width: 150,
                  },
                  {
                    field: "total_livable_area",
                    headerName: "Total Livable Area",
                    width: 150,
                  },
                  { field: "year_built", headerName: "Year Built", width: 130 },
                ]}
                pageSize={10}
                autoHeight
              />
              <Typography variant="h6" sx={{ marginTop: "20px" }}>
                Property Market Value Distribution
              </Typography>
              <BarChart
                width={600}
                height={300}
                data={data.map((row) => ({
                  name: row.address,
                  marketValue: row.market_value,
                }))}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1000000]} />
                <Tooltip />
                <Bar dataKey="marketValue" fill="#82ca9d" />
              </BarChart>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default SafeHighValueProperties;
