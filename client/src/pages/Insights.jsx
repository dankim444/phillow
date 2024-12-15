import React, { useState, useEffect } from "react";
import { Typography, Grid, Button, Box } from "@mui/material";
import { Link } from "react-router-dom"; // Import Link
import ZipcodeInfo from "../components/ZipcodeInfo";
import StreetPatterns from "../components/StreetPatterns";
import StreetInfo from "../components/StreetInfo";
import SafeHighValueProperties from "../components/SafeHighValueProperties";

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

  const { data, loading, error } = useFetchData(endpoint);

  const handleButtonClick = (insight) => {
    setSelectedInsight(insight);
    setButtonClicked(true);

    // Set endpoint based on the selected insight
    switch (insight) {
      case "streetPatterns":
        setEndpoint("http://localhost:8080/street_patterns");
        break;
      case "streetInfo":
        setEndpoint("http://localhost:8080/street_info");
        break;
      case "zipcodeInfo":
        setEndpoint("http://localhost:8080/zipcode_info");
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
      return <SafeHighValueProperties />;
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
        return <ZipcodeInfo data={data} />;
      case "streetPatterns":
        return <StreetPatterns data={data} />;
      case "streetInfo":
        return <StreetInfo data={data} />;
      default:
        return <Typography>Select an insight to view details.</Typography>;
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
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
