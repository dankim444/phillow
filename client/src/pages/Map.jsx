import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Function to determine marker color based on crime count
const getMarkerColor = (crimeCount) => {
  if (crimeCount < 5) return "green"; // Low crime count
  if (crimeCount < 15) return "orange"; // Moderate crime count
  return "red"; // High crime count
};

// Function to create a custom icon with a specified color
const createDotIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:10px; height:10px; background-color:${color}; border-radius:50%;"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
};

// Function to create a star icon for police stations
// Using a Unicode star (★) and styling it with a larger size and blue color
const createStarIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="font-size:20px; color:blue;">★</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15], // Center the icon
  });
};

export default function CrimeMap() {
  const [zipcode, setZipcode] = useState("");
  const [crimeData, setCrimeData] = useState([]);
  const [policeStationData, setPoliceStationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch crimes data by zip code
  const fetchCrimeData = async () => {
    if (!zipcode) {
      setError("Please enter a zip code.");
      return;
    }

    setLoading(true);
    setError("");
    setPoliceStationData([]);
    try {
      const response = await fetch(`http://localhost:8080/crimes_in_zip/${zipcode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.length === 0) {
        setError("No crimes found for the given zip code.");
        setCrimeData([]);
      } else {
        setCrimeData(data);
      }
      const stationResponse = await fetch(`http://localhost:8080/police_stations/${zipcode}`);
      if (!stationResponse.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } 
      const stationJson = await stationResponse.json();
      if (stationJson.length === 0) {
        setError("No police stations found for the given zip code.");
        setPoliceStationData([]);
      } else {
        setPoliceStationData(stationJson);
      }
    } catch (err) {
      console.error("Error fetching crime data:", err);
      setError("Failed to fetch crime data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Crime Map
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Enter a zip code to view crimes and their locations.
      </Typography>

      {/* Zip Code Input */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <TextField
          label="Enter Zip Code"
          variant="outlined"
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
          sx={{ marginRight: "10px", width: "300px" }}
        />
        <Button variant="contained" size="large" onClick={fetchCrimeData}>
          Search
        </Button>
      </Box>

      {/* Error or Loading Message */}
      {error && (
        <Typography color="error" sx={{ marginBottom: "20px" }}>
          {error}
        </Typography>
      )}
      {loading && (
        <Typography sx={{ marginBottom: "20px" }}>Loading crime data...</Typography>
      )}

      {/* Map Display */}
      {(crimeData.length > 0 || policeStationData.length > 0) && (
        <MapContainer
          center={[39.9526, -75.1652]} // Default to Philadelphia coordinates
          zoom={12}
          style={{ height: "500px", width: "100%", borderRadius: "8px" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {crimeData.map((crime, index) => (
            <Marker
              key={index}
              position={[crime.lat, crime.lng]}
              icon={createDotIcon(getMarkerColor(crime.crime_count))} // Dynamically set icon color
            >
              <Popup>
                <Typography variant="body2">
                  <strong>Type:</strong> {crime.text_general_code}
                </Typography>
                <Typography variant="body2">
                  <strong>Count:</strong> {crime.crime_count}
                </Typography>
              </Popup>
            </Marker>
          ))}
          {policeStationData.map((station, index) => (
            <Marker
              key={index}
              position={[station.lat, station.lng]}
              icon={createStarIcon()}
            >
              <Popup>
                <Typography variant="body2"><strong>Police Station</strong></Typography>
                {station.location && (
                  <Typography variant="body2">
                    <strong>Address:</strong> {station.location}
                  </Typography>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </Box>
  );
}
