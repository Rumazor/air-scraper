import React, { useState, useEffect } from "react";
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
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const envApi = import.meta.env.VITE_API;

  const formattedLegs = legs.map((leg: any) => ({
    origin: leg.origin.displayCode,
    destination: leg.destination.displayCode,
    date: leg.date,
  }));

  useEffect(() => {
    const fetchFlightDetails = async () => {
      if (abortController) {
        abortController.abort();
      }

      const controller = new AbortController();
      setAbortController(controller);

      try {
        setLoading(true);
        setError("");

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
            signal: controller.signal,
          }
        );

        if (response.data.status && response.data.data) {
          setDetails(response.data.data);
        } else {
          throw new Error("Unable to fetch flight details");
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(
            err instanceof Error ? err.message : "Error loading flight details"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (open && itineraryId && sessionId) {
      fetchFlightDetails();
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [open, itineraryId, legs, sessionId, envApi]);

  return (
    <div
      className={`fixed inset-0 ${
        open ? "flex" : "hidden"
      } items-center justify-center z-50`}
    >
      <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>

      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative z-10 m-4">
        {/* Header with Destination Image */}
        <div className="relative">
          {details?.itinerary?.destinationImage && (
            <div className="h-48 w-full relative rounded-t-lg overflow-hidden">
              <img
                src={details.itinerary.destinationImage}
                alt="Destination"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          )}

          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/10 rounded-full text-white"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : details?.itinerary ? (
            <div className="space-y-6">
              {details.itinerary.legs.map((leg: any, index: number) => (
                <div key={index} className="space-y-4">
                  {/* Flight Route */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold">
                        {leg.origin.displayCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {leg.origin.city}
                      </div>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <div className="text-sm text-gray-500">
                        {Math.floor(leg.duration / 60)}h {leg.duration % 60}m
                      </div>
                      <div className="border-t w-24 my-2"></div>
                      {leg.stopCount > 0 ? (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {leg.stopCount}{" "}
                          {leg.stopCount === 1 ? "stop" : "stops"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Direct</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {leg.destination.displayCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {leg.destination.city}
                      </div>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-500">Departure</div>
                      <div className="font-medium">
                        {new Date(leg.departure).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(leg.departure).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Arrival</div>
                      <div className="font-medium">
                        {new Date(leg.arrival).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(leg.arrival).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Carrier Info */}
                  {leg.segments.map((segment: any, segIndex: number) => (
                    <div
                      key={segIndex}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={segment.marketingCarrier.logo}
                        alt={segment.marketingCarrier.name}
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <div className="font-medium">
                          {segment.marketingCarrier.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Flight {segment.flightNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Price */}
              {details.itinerary.pricingOptions?.[0] && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-lg font-semibold mb-2">
                    Price Details
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${details.itinerary.pricingOptions[0].totalPrice}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
