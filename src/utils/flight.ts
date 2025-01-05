import { CabinClass, SortBy } from "../api/skyScrapper";

export const getCabinClassLabel = (cabinClass: CabinClass): string => {
  switch (cabinClass) {
    case "economy":
      return "Economy";
    case "premium_economy":
      return "Premium Economy";
    case "business":
      return "Business";
    case "first":
      return "First";
    default:
      return "Economy";
  }
};

export const getSortLabel = (sortBy: SortBy): string => {
  switch (sortBy) {
    case "best":
      return "Best";
    case "price_high":
      return "Cheapest";
    case "fastest":
      return "Fastest";
    case "outbound_take_off_time":
      return "Departure (outbound)";
    case "outbound_landing_time":
      return "Arrival (outbound)";
    case "return_take_off_time":
      return "Departure (return)";
    case "return_landing_time":
      return "Arrival (return)";
    default:
      return "Best";
  }
};
