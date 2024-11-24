import React from "react";
import { Typography, Button, Grid } from "@mui/material";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <Grid container direction="column" alignItems="center" >
      <Typography variant="h2" gutterBottom>
        Welcome to Phillow.
      </Typography>
      <Typography variant="body1" align="center">
        Search for properties, analyze neighborhoods, and discover crime data in Philadelphia.
      </Typography>
      <Button variant="contained" component={Link} to="/property-search">
        Start Exploring Properties
      </Button>
    </Grid>
  );
}
