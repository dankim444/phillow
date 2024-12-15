import React from "react";
import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const StreetInfo = ({ data }) => (
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

export default StreetInfo;