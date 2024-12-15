import React from "react";
import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const ZipcodeInfo = ({ data }) => (
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
      <XAxis
        dataKey="name"
        interval={0} // Show every zipcode
        angle={-45} // Rotate tick labels for better readability
        textAnchor="end" // Align text with ticks
      />
      <YAxis domain={[0, 1000000]} />
      <Tooltip />
      <Bar dataKey="avgMarketValue" fill="#82ca9d" />
    </BarChart>
  </>
);

export default ZipcodeInfo;
