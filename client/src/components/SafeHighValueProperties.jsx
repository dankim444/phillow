import React from "react";
import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const SafeHighValueProperties = ({ data }) => (
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
);

export default SafeHighValueProperties;