import React, { useState, useEffect } from "react";
import { Typography, Grid, Button, Box } from "@mui/material";
import { Link } from "react-router-dom"; // Import Link
import ZipcodeInfo from "../components/ZipcodeInfo";
import StreetPatterns from "../components/StreetPatterns";
import StreetInfo from "../components/StreetInfo";
import SafeHighValueProperties from "../components/SafeHighValueProperties";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const useFetchData = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) return;

    setLoading(true);
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [endpoint]);

  return { data, loading, error };
};

export default function Insights() {
  const [selectedInsight, setSelectedInsight] = useState(null); // Track the selected insight
  const [endpoint, setEndpoint] = useState(null); // Store the endpoint to fetch data from
  const [buttonClicked, setButtonClicked] = useState(false); // Track if a button has been clicked
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );

  useEffect(() => {
    const savedMode = JSON.parse(localStorage.getItem("darkMode"));
    if (savedMode) setDarkMode(savedMode);
  }, []);

  const { data, loading, error } = useFetchData(endpoint);

  const handleButtonClick = (insight) => {
    setSelectedInsight(insight);
    setButtonClicked(true);

    // Set endpoint based on the selected insight
    switch (insight) {
      case "streetPatterns":
        setEndpoint(`${API_URL}/street_patterns`);
        break;
      case "streetInfo":
        setEndpoint(`${API_URL}/street_info`);
        break;
      case "zipcodeInfo":
        setEndpoint(`${API_URL}/zipcode_info`);
        break;
      case "propertyInfo":
        setEndpoint(null); // Do not set endpoint for propertyInfo
        break;
      default:
        setEndpoint(null);
    }
  };

  const renderContent = () => {
    if (!buttonClicked)
      return (
        <Typography>
          Please click one of the buttons above to learn more about Philly
          properties and crime.
        </Typography>
      );

    if (selectedInsight === "propertyInfo") {
      return <SafeHighValueProperties darkMode={darkMode} />;
    }

    if (loading) return <Typography>Loading...</Typography>;
    if (error)
      return <Typography>Error fetching data: {error.message}</Typography>;
    if (!data.length)
      return (
        <Typography>
          No data available. Please try a different option.
        </Typography>
      );

    switch (selectedInsight) {
      case "zipcodeInfo":
        return <ZipcodeInfo data={data} darkMode={darkMode} />;
      case "streetPatterns":
        return <StreetPatterns data={data} darkMode={darkMode} />;
      case "streetInfo":
        return <StreetInfo data={data} darkMode={darkMode} />;
      default:
        return <Typography>Select an insight to view details.</Typography>;
    }
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
      {/* Home Button */}
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
      <Typography variant="h4" gutterBottom>
        Insights Page
      </Typography>
      <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleButtonClick("zipcodeInfo")}
          >
            Zipcode Info
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleButtonClick("streetPatterns")}
          >
            Crime Info By Street
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleButtonClick("streetInfo")}
          >
            Property Info By Street
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleButtonClick("propertyInfo")}
          >
            Safe High Value Properties
          </Button>
        </Grid>
      </Grid>
      <Box>{renderContent()}</Box>
    </Box>
  );
}
