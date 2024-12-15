import React, { useState, useEffect } from "react";
import { Typography, Button, Grid, Box, Switch, FormControlLabel } from "@mui/material";
import { Link } from "react-router-dom";

export default function HomePage() {
  // Retrieve darkMode preference from localStorage, default to false
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );

  // Function to toggle dark mode and save it to localStorage
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", JSON.stringify(newMode)); // Save preference
      return newMode;
    });
  };

  // Apply saved mode when component mounts
  useEffect(() => {
    const savedMode = JSON.parse(localStorage.getItem("darkMode"));
    if (savedMode) setDarkMode(savedMode);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: darkMode
          ? "url('/images/background2.png')" // Dark mode background
          : "url('/images/background1.png')", // Light mode background
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "20px",
        color: darkMode ? "#f0f0f0" : "#333",
      }}
    >
      <Grid
        container
        direction="column"
        alignItems="center"
        sx={{
          backgroundColor: darkMode ? "rgba(50, 50, 50, 0.9)" : "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          padding: "40px",
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        {/* Dark Mode Toggle */}
        <FormControlLabel
          control={
            <Switch checked={darkMode} onChange={toggleDarkMode} color="primary" />
          }
          label="Dark Mode"
          sx={{
            alignSelf: "flex-end",
            marginBottom: "20px",
            color: darkMode ? "#f0f0f0" : "#333",
          }}
        />

        <Typography
          variant="h2"
          gutterBottom
          sx={{
            color: darkMode ? "#80d8ff" : "#003b64",
            fontWeight: "bold",
          }}
        >
          Welcome to Phillow
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginBottom: "20px",
            fontSize: "1.2rem",
            color: darkMode ? "#ccc" : "#666",
          }}
        >
          Discover properties, analyze neighborhoods, and uncover crime data in
          Philadelphia.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            component={Link}
            to="/property-search"
            sx={{
              backgroundColor: darkMode ? "#80d8ff" : "#0074e4",
              "&:hover": { backgroundColor: darkMode ? "#4db8e4" : "#005bb5" },
              padding: "12px",
              fontSize: "1.1rem",
              color: "#fff",
            }}
          >
            Start Exploring Properties
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/crime-map"
            sx={{
              backgroundColor: darkMode ? "#6272a4" : "#4d90fe",
              "&:hover": { backgroundColor: darkMode ? "#49527c" : "#357acb" },
              padding: "12px",
              fontSize: "1.1rem",
              color: "#fff",
            }}
          >
            Compare Neighborhoods and Addresses
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/insights"
            sx={{
              backgroundColor: darkMode ? "#bd93f9" : "#6c5ce7",
              "&:hover": { backgroundColor: darkMode ? "#9274c9" : "#4b4dae" },
              padding: "12px",
              fontSize: "1.1rem",
              color: "#fff",
            }}
          >
            Explore Insights
          </Button>
        </Box>
      </Grid>
    </Box>
  );
}
