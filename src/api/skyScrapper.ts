import axios from "axios";

const envApi = import.meta.env.VITE_API;
const api = axios.create({
  baseURL: "https://sky-scrapper.p.rapidapi.com",
  headers: {
    "x-rapidapi-key": envApi,
    "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
  },
});
console.log(envApi);
export interface Airport {
  skyId: string;
  entityId: string;
  title: string;
  subtitle: string;
}

export type CabinClass = "economy" | "premium_economy" | "business" | "first";
export type SortBy =
  | "best"
  | "price_high"
  | "fastest"
  | "outbound_take_off_time"
  | "outbound_landing_time"
  | "return_take_off_time"
  | "return_landing_time";

export interface FlightSearchParams {
  originSkyId: string;
  destinationSkyId: string;
  originEntityId: string;
  destinationEntityId: string;
  date: string;
  returnDate?: string;
  cabinClass?: CabinClass;
  adults?: number;
  childrens?: number;
  infants?: number;
  sortBy?: SortBy;
  limit?: number;
  carriersIds?: string;
  currency?: string;
  market?: string;
  countryCode?: string;
}

export interface Itinerary {
  id: string;
  price: {
    raw: number;
    formatted: string;
  };
  legs: any[];
  carriers: any[];
  duration: number;
  stopCount: number;
}

export interface FlightSearchResponse {
  status: boolean;
  data: {
    itineraries: Itinerary[];
    flightsSessionId: string;
  };
}

export const searchAirports = async (query: string) => {
  try {
    const response = await api.get("/api/v1/flights/searchAirport", {
      params: { query },
    });

    if (response.data.status) {
      const airports = response.data.data.map((airport: any) => ({
        skyId: airport.skyId,
        entityId: airport.entityId,
        title: airport.presentation.title,
        subtitle: airport.presentation.subtitle,
      }));

      return { status: true, data: airports };
    } else {
      return { status: false, data: [] };
    }
  } catch (error) {
    console.error(error);
    return { status: false, data: [] };
  }
};

export const searchFlights = async (
  params: FlightSearchParams
): Promise<FlightSearchResponse | null> => {
  try {
    const response = await api.get("api/v2/flights/searchFlights", {
      params: {
        ...params,
        cabinClass: params.cabinClass || "economy",
        adults: params.adults || 1,
        childrens: params.childrens || 0,
        infants: params.infants || 0,
        sortBy: params.sortBy || "best",
        currency: params.currency || "USD",
        market: params.market || "en-US",
        countryCode: params.countryCode || "US",
        limit: 1,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
