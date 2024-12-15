import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
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
const createStarIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="font-size:20px; color:blue;">★</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15], // Center the icon
  });
};

export default function CrimeMap() {
  const [tabIndex, setTabIndex] = useState(0); // To manage active tab
  const [zipcode, setZipcode] = useState(""); // Zip code for search
  const [newAddress, setNewAddress] = useState(""); // New address input
  const [addresses, setAddresses] = useState([]); // List of addresses
  const [radius, setRadius] = useState(0.5); // Radius for address-based search
  const [crimeData, setCrimeData] = useState([]); // Crime data for zip code
  const [policeStationData, setPoliceStationData] = useState([]); // Police station data for zip code
  const [dataByAddress, setDataByAddress] = useState([]); // Crime and station data for each address
  const [error, setError] = useState("");

  // Switch between tabs
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError(""); // Clear errors when switching tabs
    setCrimeData([]);
    setPoliceStationData([]);
  };

  // Fetch crimes and police stations by zip code
  const fetchCrimeDataByZip = async () => {
    if (!zipcode) {
      setError("Please enter a zip code.");
      return;
    }

    setError("");
    setCrimeData([]);
    setPoliceStationData([]);

    try {
      const response = await fetch(`http://localhost:8080/crimes_in_zip/${zipcode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const crimeResults = await response.json();
      setCrimeData(crimeResults || []);

      const stationResponse = await fetch(`http://localhost:8080/police_stations/${zipcode}`);
      if (!stationResponse.ok) {
        throw new Error(`HTTP error! status: ${stationResponse.status}`);
      }
      const stationResults = await stationResponse.json();
      setPoliceStationData(stationResults || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
    }
  };

  // Fetch crimes and police stations for a single address
  const fetchCrimeDataForAddress = async (address) => {
    setError("");

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
        setError(`No data found for address: ${address}`);
        return;
      }

      setDataByAddress((prev) => [
        ...prev,
        { address, crimes: data.crimes || [], stations: data.stations || [] },
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Failed to fetch data for address: ${address}. Please try again.`);
    } finally {
    }
  };

  // Add a new address to the list
  const addAddress = () => {
    if (!newAddress) {
      setError("Please enter an address.");
      return;
    }
    setAddresses((prev) => [...prev, newAddress]);
    fetchCrimeDataForAddress(newAddress);
    setNewAddress(""); // Clear input field
    setError(""); // Clear error
  };

  // Remove an address from the list
  const removeAddress = (index) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
    setDataByAddress((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Crime Map
      </Typography>

      {/* Tabs for switching between search modes */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{ marginBottom: "20px" }}
        centered
      >
        <Tab label="Search by Zip Code" />
        <Tab label="Search by Address" />
      </Tabs>

      {tabIndex === 0 && (
        <Box>
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
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          {/* Address Search */}
          <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <TextField
              label="Enter Address"
              variant="outlined"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
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
            <Button variant="contained" size="large" onClick={addAddress}>
              Add Address
            </Button>
          </Box>

          {/* Address List with Remove Option */}
          {addresses.map((address, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                backgroundColor: "#f9f9f9",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <Typography>{address}</Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => removeAddress(index)}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Typography color="error" sx={{ marginTop: "20px" }}>
          {error}
        </Typography>
      )}

      {/* Map Display */}
      <MapContainer
        center={[39.9526, -75.1652]} // Default to Philadelphia coordinates
        zoom={13}
        style={{ height: "500px", width: "100%", borderRadius: "8px", marginTop: "20px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Crime Data for Zip Code */}
        {tabIndex === 0 &&
          crimeData.map((crime, index) => (
            <Marker
              key={`crime-${index}`}
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

        {tabIndex === 0 &&
          policeStationData.map((station, index) => (
            <Marker
              key={`station-${index}`}
              position={[station.lat, station.lng]}
              icon={createStarIcon()}
            >
              <Popup>
                <Typography variant="body2"><strong>Police Station</strong></Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {station.location}
                </Typography>
              </Popup>
            </Marker>
          ))}

        {/* Data for Addresses */}
        {tabIndex === 1 &&
          dataByAddress.map((entry, index) => (
            <React.Fragment key={`entry-${index}`}>
              {entry.crimes.map((crime, crimeIndex) => (
                <Marker
                  key={`crime-${index}-${crimeIndex}`}
                  position={[crime.lat, crime.lng]}
                  icon={createDotIcon(getMarkerColor(1))}
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
              {entry.stations.map((station, stationIndex) => (
                <Marker
                  key={`station-${index}-${stationIndex}`}
                  position={[station.lat, station.lng]}
                  icon={createStarIcon()}
                >
                  <Popup>
                    <Typography variant="body2"><strong>Police Station</strong></Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {station.location}
                    </Typography>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          ))}
      </MapContainer>
    </Box>
  );
}
