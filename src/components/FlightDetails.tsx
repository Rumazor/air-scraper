import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import axios from "axios";

interface FlightDetailsProps {
  open: boolean;
  onClose: () => void;
  itineraryId: string;
  legs: Array<{
    origin: string;
    destination: string;
    date: string;
  }>;
  sessionId: string;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({
  open,
  onClose,
  itineraryId,
  legs,
  sessionId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [details, setDetails] = useState<any>(null);

  const formattedLegs = legs.map((leg: any) => ({
    origin: leg.origin.displayCode,
    destination: leg.destination.displayCode,
    date: leg.date,
  }));

  const envApi = import.meta.env.VITE_API;

  const fetchFlightDetails = async () => {
    try {
      const response = await axios.get(
        "https://sky-scrapper.p.rapidapi.com/api/v1/flights/getFlightDetails",
        {
          params: {
            itineraryId,
            legs: JSON.stringify(formattedLegs),
            sessionId,
            adults: 1,
            currency: "USD",
            locale: "en-US",
            market: "en-US",
            countryCode: "US",
          },
          headers: {
            "x-rapidapi-key": envApi,
            "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );

      if (response.data.status) {
        if (response.data.data.pollingCompleted) {
          const bookingSessionId = response.data.data.bookingSessionId;

          const detailsResponse = await axios.get(
            "https://sky-scrapper.p.rapidapi.com/api/v1/flights/getBookingDetails",
            {
              params: { bookingSessionId },
              headers: {
                "x-rapidapi-key": "",
                "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
              },
            }
          );

          if (detailsResponse.data.status && detailsResponse.data.data) {
            setDetails(detailsResponse.data.data);
            setError("");
          } else {
            setError("Unable to fetch detailed flight information.");
          }
        }
      } else {
        setError("Unable to fetch flight details");
      }
    } catch (err) {
      setError("Error loading flight details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError("");
      fetchFlightDetails();
    }
  }, [open, itineraryId, legs, sessionId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Flight Details
          <IconButton onClick={onClose}>X</IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : details ? (
          <Box>
            {details.legs?.map((leg: any, index: number) => (
              <Box key={index} mb={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {leg.origin} → {leg.destination}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Departure</Typography>
                    <Typography variant="body1">{leg.departure}</Typography>
                    <Typography variant="caption">
                      {leg.originAirport}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Arrival</Typography>
                    <Typography variant="body1">{leg.arrival}</Typography>
                    <Typography variant="caption">
                      {leg.destinationAirport}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box my={1}>
                      <Divider />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Flight Duration</Typography>
                    <Typography>
                      {Math.floor(leg.durationInMinutes / 60)}h{" "}
                      {leg.durationInMinutes % 60}m
                    </Typography>
                  </Grid>

                  {leg.carriers?.marketing?.map((carrier: any, idx: number) => (
                    <Grid item xs={12} key={idx}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <img
                          src={carrier.logoUrl}
                          alt={carrier.name}
                          width={24}
                          height={24}
                        />
                        <Typography>
                          {carrier.name} - Flight {carrier.flightNumber}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}

                  {leg.stopCount > 0 && (
                    <Grid item xs={12}>
                      <Chip
                        label={`${leg.stopCount} ${
                          leg.stopCount === 1 ? "stop" : "stops"
                        }`}
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                  )}
                </Grid>
                {index < details.legs.length - 1 && (
                  <Box my={2}>
                    <Divider />
                  </Box>
                )}
              </Box>
            ))}

            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                Price Details
              </Typography>
              <Typography variant="h5" color="primary">
                {details.price?.formatted}
              </Typography>
              {details.farePolicy && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Fare Policy
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Chip
                        label={
                          details.farePolicy.isChangeAllowed
                            ? "Changes Allowed"
                            : "No Changes"
                        }
                        color={
                          details.farePolicy.isChangeAllowed
                            ? "success"
                            : "error"
                        }
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={
                          details.farePolicy.isCancellationAllowed
                            ? "Cancellation Allowed"
                            : "No Cancellation"
                        }
                        color={
                          details.farePolicy.isCancellationAllowed
                            ? "success"
                            : "error"
                        }
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default FlightDetails;
