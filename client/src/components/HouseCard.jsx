import React, { useState } from "react";
import {
  Card,
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

const createHouseIcon = () =>
  L.divIcon({
    className: "custom-house-marker",
    html: `<div style="width:14px; height:14px; background-color:blue; border-radius:50%;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

export default function HouseCard({ house }) {
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Card onClick={handleOpenModal} sx={{ cursor: "pointer", margin: "20px" }}>
        <CardContent>
          <Typography variant="h6">{house.location}</Typography>
          <Typography variant="body2">Price: ${house.market_value}</Typography>
          <Typography variant="body2">Bedrooms: {house.number_of_bedrooms}</Typography>
          <Typography variant="body2">Bathrooms: {house.number_of_bathrooms}</Typography>
        </CardContent>
      </Card>

      {/* Modal for expanded house information */}
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
            {/* Left side: House details */}
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                {house.location}
              </Typography>
              <Typography variant="body1">
                <strong>Market Value:</strong> ${house.market_value}
              </Typography>
              <Typography variant="body1">
                <strong>Sale Price:</strong> ${house.sale_price}
              </Typography>
              <Typography variant="body1">
                <strong>Bedrooms:</strong> {house.number_of_bedrooms}
              </Typography>
              <Typography variant="body1">
                <strong>Bathrooms:</strong> {house.number_of_bathrooms}
              </Typography>
              <Typography variant="body1">
                <strong>Year Built:</strong> {house.year_built}
              </Typography>
              <Typography variant="body1">
                <strong>Total Livable Area:</strong> {house.total_livable_area} sqft
              </Typography>
              <Typography variant="body1">
                <strong>Total Area:</strong> {house.total_area} sqft
              </Typography>
              <Button variant="contained" color="primary" onClick={handleCloseModal}>
                Close
              </Button>
            </Grid>

            {/* Right side: Map */}
            <Grid item xs={12} md={6}>
              <MapContainer
                center={[house.latitude, house.longitude]} // Replace with actual lat/lng from `house`
                zoom={15}
                style={{ height: "400px", width: "100%", borderRadius: "8px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[house.latitude, house.longitude]} icon={createHouseIcon()}>
                  <Popup>
                    <Typography variant="body2">{house.location}</Typography>
                  </Popup>
                </Marker>
              </MapContainer>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
