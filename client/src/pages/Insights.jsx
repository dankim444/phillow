import React, { useState } from "react";
import { Typography, Grid, Button, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Insights() {
  const [selectedInsight, setSelectedInsight] = useState(null); // Track the selected insight
  const [data, setData] = useState([]); // Store the fetched data

  const fetchData = (endpoint) => {
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  const handleButtonClick = (insight) => {
    setSelectedInsight(insight);

    // Fetch data based on the selected insight
    switch (insight) {
      case "streetPatterns":
        fetchData("http://localhost:8080/street_patterns");
        break;
      case "streetInfo":
        fetchData("http://localhost:8080/street_info");
        break;
      case "zipcodeInfo":
        fetchData("http://localhost:8080/zipcode_info");
        break;
      default:
        setData([]);
    }
  };

  const renderContent = () => {
    if (!data.length) return <Typography>No data available.</Typography>;

    switch (selectedInsight) {
      case "zipcodeInfo":
        return (
          <>
            <DataGrid
              rows={data.map((row, index) => ({
                id: index,
                ...row,
              }))}
              columns={[
                { field: "zip_code", headerName: "Zip Code", width: 130 },
                {
                  field: "avg_market_value",
                  headerName: "Avg Market Value",
                  width: 200,
                },
                {
                  field: "property_count",
                  headerName: "Property Count",
                  width: 150,
                },
                { field: "population", headerName: "Population", width: 150 },
                {
                  field: "total_crimes",
                  headerName: "Total Crimes",
                  width: 130,
                },
                {
                  field: "police_stations",
                  headerName: "Police Stations",
                  width: 150,
                },
                {
                  field: "crime_rate_per_capita",
                  headerName: "Crime Rate Per Capita",
                  width: 200,
                },
              ]}
              pageSize={10}
              autoHeight
            />
            <Typography variant="h6" sx={{ marginTop: "20px" }}>
              Zip Code Avg Market Value Distribution
            </Typography>
            <BarChart
              width={1400}
              height={300}
              data={data.map((row) => ({
                name: row.zip_code,
                avgMarketValue: row.avg_market_value,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" 
                      interval={0} // Show every zipcode
                      angle={-45} // Rotate tick labels for better readability
                      textAnchor="end" // Align text with ticks
              />
              <YAxis domain={[0, 1000000]}/>
              <Tooltip />
              <Bar dataKey="avgMarketValue" fill="#82ca9d" />
            </BarChart>
          </>
        );

      case "streetPatterns":
        return (
          <DataGrid
            rows={data.map((row, index) => ({ id: index, ...row }))}
            columns={[
              { field: "street_name", headerName: "Street Name", width: 200 },
              { field: "num_crimes", headerName: "Crimes", width: 130 },
              { field: "crime_types", headerName: "Crime Types", width: 130 },
              {
                field: "crimes_per_month",
                headerName: "Crimes/Month",
                width: 150,
              },
              {
                field: "crimes_per_property",
                headerName: "Crimes/Property",
                width: 170,
              },
            ]}
            pageSize={10}
            autoHeight
          />
        );

      case "streetInfo":
        return (
          <>
            <DataGrid
              rows={data.map((row, index) => ({ id: index, ...row }))}
              columns={[
                { field: "street_name", headerName: "Street Name", width: 200 },
                { field: "zip_code", headerName: "Zip Code", width: 100 },
                {
                  field: "property_count",
                  headerName: "Property Count",
                  width: 150,
                },
                {
                  field: "avg_market_value",
                  headerName: "Avg Market Value",
                  width: 180,
                },
                {
                  field: "avg_sale_price",
                  headerName: "Avg Sale Price",
                  width: 180,
                },
                { field: "population", headerName: "Population", width: 130 },
                {
                  field: "police_station_count",
                  headerName: "Police Stations",
                  width: 160,
                },
                {
                  field: "home_finder_score",
                  headerName: "Home Finder Score",
                  width: 180,
                },
              ]}
              pageSize={10}
              autoHeight
            />
          </>
        );

      default:
        return <Typography>Select an insight to view details.</Typography>;
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
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
      </Grid>
      <Box>{renderContent()}</Box>
    </Box>
  );
}
