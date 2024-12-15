import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Modal,
  Box,
  Button,
  Grid,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

  const handleOpenModal = () => {
    setOpenModal(true);
    fetchGeocodeData(property.location);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Fetch latitude and longitude data for the property
  const fetchGeocodeData = async (address) => {
    try {
      const response = await fetch(
        `http://localhost:8080/property_location?address=${address}`
      );
      if (response.ok) {
        const data = await response.json();
        setGeocodeData(data);
        console.log("Geocode data:", data);
      } else {
        console.error("Error fetching geocode data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching geocode data:", error);
    }
  };

  return (
    <>
      <Card
        onClick={handleOpenModal}
        sx={{ cursor: "pointer", margin: "20px" }}
      >
        <CardMedia
          component="img"
          height="140"
          image={getPropertyImage(property.category_code_description)}
          alt={property.category_code_description}
        />
        <CardContent>
          <Typography variant="h6">{property.location}</Typography>
          <Typography>
            <strong>Zip Code:</strong> {property.zip_code}
          </Typography>
          <Typography>
            <strong>Market Value:</strong> ${Number(property.market_value)}
          </Typography>
          <Typography>
            <strong>Sale Price:</strong> ${Number(property.sale_price)}
          </Typography>
          <Typography>
            <strong>Type:</strong> {property.category_code_description}
          </Typography>
          <Typography>
            <strong>Area:</strong> {property.total_livable_area} sqft
          </Typography>
          <Typography>
            <strong>Year Built:</strong> {property.year_built}
          </Typography>
        </CardContent>
      </Card>

      {/* Modal for expanded property information */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
          }}
        >
          <Grid container spacing={2}>
            {/* Left side: add more property details */}
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                {property.location}
              </Typography>
              <Typography variant="body1">
                <strong>Zip Code:</strong> {property.zip_code}
              </Typography>
              <Typography variant="body1">
                <strong>Market Value:</strong> ${Number(property.market_value)}
              </Typography>
              <Typography variant="body1">
                <strong>Sale Price:</strong> ${Number(property.sale_price)}
              </Typography>
              <Typography variant="body1">
                <strong>Sale Date:</strong> {property.sale_date}
              </Typography>
              <Typography variant="body1">
                <strong>Type:</strong> {property.category_code_description}
              </Typography>
              <Typography variant="body1">
                <strong>Bedrooms:</strong>{" "}
                {property.number_of_bedrooms === 0
                  ? "N/A"
                  : property.number_of_bedrooms}
              </Typography>
              <Typography variant="body1">
                <strong>Bathrooms:</strong>{" "}
                {property.number_of_bathrooms === 0
                  ? "N/A"
                  : Number(property.number_of_bathrooms)}
              </Typography>
              <Typography variant="body1">
                <strong>Year Built:</strong> {property.year_built}
              </Typography>
              <Typography variant="body1">
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
              {geocodeData && (
                <MapContainer
                  center={[geocodeData.latitude, geocodeData.longitude]}
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
                    position={[geocodeData.latitude, geocodeData.longitude]}
                    icon={createpropertyIcon()}
                  >
                    <Popup>
                      <Typography variant="body2">
                        {geocodeData.display_name}
                      </Typography>
                    </Popup>
                  </Marker>
                </MapContainer>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
