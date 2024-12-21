import React from "react";
import { DataGrid } from "@mui/x-data-grid";

const StreetPatterns = ({ data, darkMode }) => (
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
    sx={{
      backgroundColor: darkMode ? "#1e1e1e" : "#fff",
      color: darkMode ? "#f0f0f0" : "#333",
    }}
  />
);

export default StreetPatterns;
