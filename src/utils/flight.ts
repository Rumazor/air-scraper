import { CabinClass } from "../api/skyScrapper";

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
