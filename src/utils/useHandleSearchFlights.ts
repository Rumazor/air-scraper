// useHandleSearchFlights.ts
import { searchFlights, FlightSearchParams } from "../api/skyScrapper";
import { Airport, CabinClass, SortBy } from "../api/skyScrapper";

interface FlightDetails {
  origin: Airport | null;
  destination: Airport | null;
  date: string;
  returnDate: string;
  cabinClass: CabinClass;
  sortBy: SortBy;
  adults: number;
  children: number;
  infants: number;
}

interface HandleSearchFlightsArgs {
  flightDetails: FlightDetails;
  setError: (msg: string) => void;
  setLoading: (loading: boolean) => void;
  setFlights: (flights: any[]) => void;
  setSessionId: (id: string) => void;
}

export async function handleSearchFlights({
  flightDetails,
  setError,
  setLoading,
  setFlights,
  setSessionId,
}: HandleSearchFlightsArgs) {
  const {
    origin,
    destination,
    date,
    returnDate,
    cabinClass,
    adults,
    children,
    infants,
    sortBy,
  } = flightDetails;

  if (!origin || !destination || !date) {
    setError("Please select both airports and date");
    return;
  }

  setLoading(true);
  setError("");
  setFlights([]);

  const searchParams: FlightSearchParams = {
    originSkyId: origin.skyId,
    originEntityId: origin.entityId,
    destinationSkyId: destination.skyId,
    destinationEntityId: destination.entityId,
    date,
    returnDate: returnDate || undefined,
    cabinClass,
    adults,
    childrens: children,
    infants,
    sortBy,
    limit: 100,
  };

  try {
    const response = await searchFlights(searchParams);

    if (response?.status && response.data) {
      setSessionId(response.data.flightsSessionId);
      const itineraries = response.data.itineraries;

      if (itineraries && itineraries.length > 0) {
        const processedFlights = itineraries.map((itinerary: any) => {
          const legs = itinerary.legs || [];
          const firstLeg = legs[0] || {};

          return {
            id: itinerary.id,
            price: itinerary.price?.formatted || "N/A",
            duration: firstLeg.durationInMinutes || 0,
            stopCount: firstLeg.stopCount || 0,
            departure: firstLeg.departure || "N/A",
            arrival: firstLeg.arrival || "N/A",
            carriers: firstLeg.carriers?.marketing || [],
            legs: legs.map((leg: any) => ({
              origin: leg.origin,
              destination: leg.destination,
              date,
            })),
          };
        });

        setFlights(processedFlights);
      } else {
        setError("No flights available for the selected route and date");
      }
    } else {
      setError("Unable to fetch flight results. Please try again.");
    }
  } catch (err) {
    console.error("Error searching flights:", err);
    setError("Error searching flights");
  } finally {
    setLoading(false);
  }
}
