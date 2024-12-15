import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
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
const createStarIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="font-size:20px; color:blue;">★</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15], // Center the icon
  });
};

export default function CrimeMap() {
  const [zipcode, setZipcode] = useState(""); // Zip code for search
  const [address, setAddress] = useState(""); // Address for search
  const [radius, setRadius] = useState(1); // Radius for address-based search
  const [crimeData, setCrimeData] = useState([]);
  const [policeStationData, setPoliceStationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch crimes and police stations by zip code
  const fetchCrimeDataByZip = async () => {
    if (!zipcode) {
      setError("Please enter a zip code.");
      return;
    }

    setLoading(true);
    setError("");
    setCrimeData([]);
    setPoliceStationData([]);

    try {
      const response = await fetch(
        `http://localhost:8080/crimes_in_zip/${zipcode}`
      );
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
      const stationResponse = await fetch(
        `http://localhost:8080/police_stations/${zipcode}`
      );
      if (!stationResponse.ok) {
        throw new Error(`HTTP error! status: ${stationResponse.status}`);
      }
      const stationData = await stationResponse.json();
      setPoliceStationData(stationData.length > 0 ? stationData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch crimes and police stations by address
  const fetchCrimeDataByAddress = async () => {
    if (!address) {
      setError("Please enter an address.");
      return;
    }

    setLoading(true);
    setError("");
    setCrimeData([]);
    setPoliceStationData([]);

    try {
      const response = await fetch("http://localhost:8080/crime_near_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, radius }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.crimes.length && !data.stations.length) {
        setError("No data found for the given address.");
      } else {
        setCrimeData(data.crimes || []);
        setPoliceStationData(data.stations || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
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
        Search by zip code or address to view crimes and police stations nearby.
      </Typography>

      {/* Zip Code Search */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <TextField
          label="Enter Zip Code"
          variant="outlined"
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
          sx={{ marginRight: "10px", width: "300px" }}
        />
        <Button variant="contained" size="large" onClick={fetchCrimeDataByZip}>
          Search by Zip Code
        </Button>
      </Box>

      {/* Address Search */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <TextField
          label="Enter Address"
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{ marginRight: "10px", width: "300px" }}
        />
        <TextField
          label="Radius (km)"
          type="number"
          variant="outlined"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          sx={{ marginRight: "10px", width: "150px" }}
        />
        <Button
          variant="contained"
          size="large"
          onClick={fetchCrimeDataByAddress}
        >
          Search by Address
        </Button>
      </Box>

      {/* Error or Loading Message */}
      {error && (
        <Typography color="error" sx={{ marginBottom: "20px" }}>
          {error}
        </Typography>
      )}
      {loading && (
        <Typography sx={{ marginBottom: "20px" }}>Loading data...</Typography>
      )}

      {/* Map Display */}
      {(crimeData.length > 0 || policeStationData.length > 0) && (
        <MapContainer
          center={[39.9526, -75.1652]} // Default to Philadelphia coordinates
          zoom={13}
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
              icon={createDotIcon(getMarkerColor(crime.crime_count))}
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
                <Typography variant="body2">
                  <strong>Police Station</strong>
                </Typography>
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
