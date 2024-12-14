import React from "react";
import { Typography, Button, Grid, Box } from "@mui/material";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5", // Soft gray background
        padding: "20px",
      }}
    >
      <Grid
        container
        direction="column"
        alignItems="center"
        sx={{
          backgroundColor: "#fff", // Clean white card
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          padding: "40px",
          maxWidth: "600px",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            color: "#003b64", // Zillow-inspired blue
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
            color: "#666", // Neutral gray for supporting text
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
              backgroundColor: "#0074e4", // Zillow blue
              "&:hover": { backgroundColor: "#005bb5" }, // Darker blue hover
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
              backgroundColor: "#4d90fe", // Complementary lighter blue
              "&:hover": { backgroundColor: "#357acb" }, // Darker blue hover
              padding: "12px",
              fontSize: "1.1rem",
              color: "#fff",
            }}
          >
            Compare Neighborhoods
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/insights"
            sx={{
              backgroundColor: "#6c5ce7",
              "&:hover": { backgroundColor: "#4b4dae" },
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
