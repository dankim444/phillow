import React, { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Modal,
  Box,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const createpropertyIcon = () =>
  L.divIcon({
    className: "custom-property-marker",
    html: `<div style="width:14px; height:14px; background-color:blue; border-radius:50%;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const getPropertyImage = (propertyType) => {
  const type = propertyType?.toLowerCase();

  const imageMap = {
    "multi family": "/images/multi-family.jpg",
    "single family": "/images/single-family.jpg",
    "garage - residential": "/images/garage-residential.jpg",
    "mixed use": "/images/mixed-use.jpg",
    "apartments  > 4 units": "/images/large-apartment.jpg",
    "vacant land - residential": "/images/vacant-residential.jpg",
    commercial: "/images/commercial.jpg",
    "special purpose": "/images/special-purpose.jpg",
    industrial: "/images/industrial.jpg",
    "garage - commercial": "/images/garage-commercial.jpg",
    "vacant land": "/images/vacant-land.jpg",
    offices: "/images/offices.jpg",
    retail: "/images/retail.jpg",
  };

  return imageMap[type] || "/images/default-property.jpg";
};

export default function PropertyCard({ property }) {
  const [openModal, setOpenModal] = useState(false);
  const [geocodeData, setGeocodeData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => JSON.parse(localStorage.getItem("darkMode")) || false
  );

  useEffect(() => {
    const savedMode = JSON.parse(localStorage.getItem("darkMode"));
    if (savedMode) setDarkMode(savedMode);
  }, []);

  const handleOpenModal = () => {
    setOpenModal(true);
    fetchGeocodeData(property.location, property.zip_code);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setGeocodeData(null); // Reset geocode data when closing the modal
    setError(null); // Reset error when closing the modal
  };

  // Fetch lat and lon data for the property
  const fetchGeocodeData = async (address, zipcode) => {
    setIsLoading(true);
    setError(null);
    const fullAddress = `${address}, Philadelphia, PA ${zipcode}`;

    try {
      const response = await fetch(
        `${API_URL}/property_location?address=${encodeURIComponent(
          fullAddress
        )}`
      );

      if (response.ok) {
        const data = await response.json();

        // Check if we have the required data
        if (data) {
          setGeocodeData({
            lat: Number(data.lat),
            lon: Number(data.lon),
            display_name: data.display_name,
          });
        } else {
          setError("Invalid location data received");
        }
      } else {
        setError(`Failed to load location data: ${response.status}`);
      }
    } catch (error) {
      setError(`Error loading location data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card
        onClick={handleOpenModal}
        sx={{
          backgroundColor: darkMode ? "#2e3b4e" : "#e3f2fd",
          cursor: "pointer",
          margin: "20px",
        }}
      >
        <CardMedia
          component="img"
          height="140"
          image={getPropertyImage(property.category_code_description)}
          alt={property.category_code_description}
        />
        <CardContent>
          <Typography
            variant="h6"
            sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
          >
            {property.location}
          </Typography>
          <Typography sx={{ color: darkMode ? "#f0f0f0" : "#333" }}>
            <strong>Zip Code:</strong> {property.zip_code}
          </Typography>
          <Typography sx={{ color: darkMode ? "#f0f0f0" : "#333" }}>
            <strong>Market Value:</strong> ${Number(property.market_value)}
          </Typography>
          <Typography sx={{ color: darkMode ? "#f0f0f0" : "#333" }}>
            <strong>Type:</strong> {property.category_code_description}
          </Typography>
          <Typography sx={{ color: darkMode ? "#f0f0f0" : "#333" }}>
            <strong>Area:</strong> {property.total_livable_area} sqft
          </Typography>
          <Typography sx={{ color: darkMode ? "#f0f0f0" : "#333" }}>
            <strong>Year Built:</strong> {property.year_built}
          </Typography>
        </CardContent>
      </Card>

      {/* Modal for expanded property information */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            backgroundColor: darkMode ? "#2e3b4e" : "#e3f2fd",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <Grid container spacing={2}>
            {/* Left side: add more property details */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
                gutterBottom
              >
                {property.location}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
              >
                <strong>Zip Code:</strong> {property.zip_code}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
              >
                <strong>Market Value:</strong> ${Number(property.market_value)}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
              >
                <strong>Sale Date:</strong> {property.sale_date}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
              >
                <strong>Type:</strong> {property.category_code_description}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
              >
                <strong>Bedrooms:</strong>{" "}
                {property.number_of_bedrooms === 0
                  ? "N/A"
                  : property.number_of_bedrooms}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
              >
                <strong>Bathrooms:</strong>{" "}
                {Number(property.number_of_bathrooms) === 0
                  ? "N/A"
                  : Number(property.number_of_bathrooms)}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
              >
                <strong>Year Built:</strong> {property.year_built}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: darkMode ? "#f0f0f0" : "#333" }}
              >
                <strong>Total Livable Area:</strong>{" "}
                {property.total_livable_area} sqft
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCloseModal}
                sx={{ marginTop: "20px" }}
              >
                Close
              </Button>
            </Grid>

            {/* Right side: Map */}
            <Grid item xs={12} md={6}>
              {error && <Typography color="error">{error}</Typography>}
              {isLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="400px"
                  bgcolor="background.paper"
                  borderRadius="8px"
                >
                  <CircularProgress />
                </Box>
              ) : geocodeData ? (
                <MapContainer
                  center={[geocodeData.lat, geocodeData.lon]}
                  zoom={15}
                  style={{
                    height: "400px",
                    width: "100%",
                    borderRadius: "8px",
                  }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[geocodeData.lat, geocodeData.lon]}
                    icon={createpropertyIcon()}
                  >
                    <Popup>
                      <Typography variant="body2">
                        {geocodeData.display_name}
                      </Typography>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                !error && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="400px"
                    bgcolor="background.paper"
                    borderRadius="8px"
                  >
                    <Typography>No location data available</Typography>
                  </Box>
                )
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
