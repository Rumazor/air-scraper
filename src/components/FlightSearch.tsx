// FlightSearch.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  searchAirports,
  Airport,
  CabinClass,
  SortBy,
} from "../api/skyScrapper";
import FlightList from "./FlightList";
import { handleSearchFlights } from "../utils/useHandleSearchFlights";
import DateAndCabinModal, { DatePickerButton } from "./DateAndCabinSelection";
import {
  FaExchangeAlt,
  FaFilter,
  FaUsers,
  FaSuitcase,
  FaSearch,
  FaExclamationCircle,
} from "react-icons/fa";
import { getCabinClassLabel, getSortLabel } from "../utils/flight";
import { motion, AnimatePresence } from "framer-motion";

const FlightSearch: React.FC = () => {
  const [flightDetails, setFlightDetails] = useState({
    origin: null as Airport | null,
    destination: null as Airport | null,
    date: "",
    returnDate: "",
    cabinClass: "economy" as CabinClass,
    sortBy: "best" as SortBy,
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");

  const [options, setOptions] = useState({
    originOptions: [] as Airport[],
    destinationOptions: [] as Airport[],
  });

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<
    null | "sort" | "passengers" | "class"
  >(null);

  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchAirports = async (
    value: string,
    type: "origin" | "destination"
  ) => {
    if (!value || value.length < 2) return;
    try {
      const response = await searchAirports(value);
      if (response.status && response.data) {
        setOptions((prev) => ({
          ...prev,
          [type === "origin" ? "originOptions" : "destinationOptions"]:
            response.data,
        }));
      } else {
        console.error(`No airports found for ${type}`);
      }
    } catch (err) {
      console.error(`Error searching ${type} airports:`, err);
    }
  };

  const handleSearchFlightsWrapper = async () => {
    setHasSearched(true);
    await handleSearchFlights({
      flightDetails,
      setError,
      setLoading,
      setFlights,
      setSessionId,
    });
  };

  const departureLabel = flightDetails.date ? flightDetails.date : "Select";
  const returnLabel = flightDetails.returnDate
    ? flightDetails.returnDate
    : "Select";

  const handleSwap = () => {
    setFlightDetails((prev) => ({
      ...prev,
      origin: flightDetails.destination,
      destination: flightDetails.origin,
    }));
    setOriginInput(
      flightDetails.destination ? flightDetails.destination.title : ""
    );
    setDestinationInput(flightDetails.origin ? flightDetails.origin.title : "");
    setOptions(() => ({
      originOptions: options.destinationOptions,
      destinationOptions: options.originOptions,
    }));
  };

  const passengerSummary = () => {
    const { adults, children, infants } = flightDetails;
    const total = adults + children + infants;
    return `${total} `;
  };

  return (
    <div className="p-2 font-sans min-h-screen">
      <AnimatePresence>
        {!loading && !hasSearched && (
          <motion.div
            key="hero"
            initial={{ opacity: 1, height: "auto" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 1 }}
            className="overflow-hidden"
          >
            <img src="/hero.svg" className="w-full max-w-2xl mx-auto" alt="" />
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-6xl text-center font-medium mt-4 mb-6 text-gray-800"
            >
              Flights
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key="search-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: loading ? 0.5 : 1 }}
        className="bg-gray-100 max-w-6xl w-full mx-auto shadow-lg p-6 relative rounded-lg"
      >
        <div
          className="flex justify-center md:justify-start gap-4 mb-4"
          ref={dropdownRef}
        >
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100"
              onClick={() =>
                setOpenDropdown((prev) => (prev === "sort" ? null : "sort"))
              }
            >
              <FaFilter />
              <span className="hidden md:inline">
                {`Sort: ${getSortLabel(flightDetails.sortBy)}`}
              </span>
            </button>

            {openDropdown === "sort" && (
              <motion.div
                key="sort-dropdown"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 bg-white border border-gray-300 rounded-lg mt-2 right-0 w-40 text-sm"
              >
                <ul className="flex flex-col">
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        flightDetails.sortBy === "best" ? "font-medium" : ""
                      }`}
                      onClick={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          sortBy: "best",
                        }));
                        setOpenDropdown(null);
                      }}
                    >
                      Best
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        flightDetails.sortBy === "price_high"
                          ? "font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          sortBy: "price_high",
                        }));
                        setOpenDropdown(null);
                      }}
                    >
                      Cheapest
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        flightDetails.sortBy === "fastest" ? "font-medium" : ""
                      }`}
                      onClick={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          sortBy: "fastest",
                        }));
                        setOpenDropdown(null);
                      }}
                    >
                      Fastest
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        flightDetails.sortBy === "outbound_take_off_time"
                          ? "font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          sortBy: "outbound_take_off_time",
                        }));
                        setOpenDropdown(null);
                      }}
                    >
                      Departure (outbound)
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        flightDetails.sortBy === "outbound_landing_time"
                          ? "font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          sortBy: "outbound_landing_time",
                        }));
                        setOpenDropdown(null);
                      }}
                    >
                      Arrival (outbound)
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        flightDetails.sortBy === "return_take_off_time"
                          ? "font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          sortBy: "return_take_off_time",
                        }));
                        setOpenDropdown(null);
                      }}
                    >
                      Departure (return)
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        flightDetails.sortBy === "return_landing_time"
                          ? "font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          sortBy: "return_landing_time",
                        }));
                        setOpenDropdown(null);
                      }}
                    >
                      Arrival (return)
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100"
              onClick={() =>
                setOpenDropdown((prev) =>
                  prev === "passengers" ? null : "passengers"
                )
              }
            >
              <FaUsers />
              <span className="hidden md:inline">{passengerSummary()}</span>
            </button>

            {openDropdown === "passengers" && (
              <motion.div
                key="passengers-dropdown"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 bg-white border border-gray-300 rounded-lg mt-2 right-0 w-54 text-sm"
              >
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    Adults
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="px-2 py-1 bg-gray-200 rounded-full"
                      onClick={() =>
                        setFlightDetails((prev) => ({
                          ...prev,
                          adults: Math.max(1, prev.adults - 1),
                        }))
                      }
                      disabled={flightDetails.adults <= 1}
                    >
                      -
                    </button>
                    <span>{flightDetails.adults}</span>
                    <button
                      type="button"
                      className="px-2 py-1 bg-gray-200 rounded-full"
                      onClick={() =>
                        setFlightDetails((prev) => ({
                          ...prev,
                          adults: prev.adults + 1,
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-700 mr-3">
                    Children
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="px-2 py-1 bg-gray-200 rounded-full"
                      onClick={() =>
                        setFlightDetails((prev) => ({
                          ...prev,
                          children: Math.max(0, prev.children - 1),
                        }))
                      }
                      disabled={flightDetails.children <= 0}
                    >
                      -
                    </button>
                    <span>{flightDetails.children}</span>
                    <button
                      type="button"
                      className="px-2 py-1 bg-gray-200 rounded-full"
                      onClick={() =>
                        setFlightDetails((prev) => ({
                          ...prev,
                          children: prev.children + 1,
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-700">
                    Infants
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="px-2 py-1 bg-gray-200 rounded-full"
                      onClick={() =>
                        setFlightDetails((prev) => ({
                          ...prev,
                          infants: Math.max(0, prev.infants - 1),
                        }))
                      }
                      disabled={flightDetails.infants <= 0}
                    >
                      -
                    </button>
                    <span>{flightDetails.infants}</span>
                    <button
                      type="button"
                      className="px-2 py-1 bg-gray-200 rounded-full"
                      onClick={() =>
                        setFlightDetails((prev) => ({
                          ...prev,
                          infants: prev.infants + 1,
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100"
              onClick={() =>
                setOpenDropdown((prev) => (prev === "class" ? null : "class"))
              }
            >
              <FaSuitcase />
              <span className="hidden md:inline">
                {getCabinClassLabel(flightDetails.cabinClass)}
              </span>
            </button>

            {openDropdown === "class" && (
              <motion.div
                key="class-dropdown"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 bg-white border border-gray-300 rounded-lg mt-2 right-0 w-40 text-sm"
              >
                <ul className="flex flex-col">
                  {(
                    [
                      "economy",
                      "premium_economy",
                      "business",
                      "first",
                    ] as CabinClass[]
                  ).map((option) => (
                    <li key={option}>
                      <button
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                          flightDetails.cabinClass === option
                            ? "font-medium"
                            : ""
                        }`}
                        onClick={() => {
                          setFlightDetails((prev) => ({
                            ...prev,
                            cabinClass: option,
                          }));
                          setOpenDropdown(null);
                        }}
                      >
                        {option === "economy"
                          ? "Economy"
                          : option === "premium_economy"
                          ? "Premium Economy"
                          : option === "business"
                          ? "Business"
                          : "First"}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr,auto] items-center gap-2">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Origin
            </label>
            <div className="relative">
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={originInput}
                onChange={(e) => {
                  setOriginInput(e.target.value);
                  handleSearchAirports(e.target.value, "origin");
                }}
                placeholder="Enter origin airport"
                required
              />
              {options.originOptions.length > 0 && (
                <motion.ul
                  key="origin-options"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bg-white border border-gray-200 rounded-lg w-full mt-1 max-h-60 overflow-auto shadow-lg z-50"
                >
                  {options.originOptions.map((option) => (
                    <li
                      key={option.skyId}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onMouseDown={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          origin: option,
                        }));
                        setOriginInput(option.title);
                        setOptions((prev) => ({
                          ...prev,
                          originOptions: [],
                        }));
                      }}
                    >
                      {option.title} ({option.subtitle})
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {!flightDetails.origin
                ? "Please select an airport"
                : flightDetails.origin.title}
            </span>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
              aria-label="Swap origin and destination"
            >
              <FaExchangeAlt className="text-gray-700" />
            </button>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Destination
            </label>
            <div className="relative">
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={destinationInput}
                onChange={(e) => {
                  setDestinationInput(e.target.value);
                  handleSearchAirports(e.target.value, "destination");
                }}
                placeholder="Enter destination airport"
                required
              />
              {options.destinationOptions.length > 0 && (
                <motion.ul
                  key="destination-options"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bg-white border border-gray-200 rounded-lg w-full mt-1 max-h-60 overflow-auto shadow-lg z-50"
                >
                  {options.destinationOptions.map((option) => (
                    <li
                      key={option.skyId}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onMouseDown={() => {
                        setFlightDetails((prev) => ({
                          ...prev,
                          destination: option,
                        }));
                        setDestinationInput(option.title);
                        setOptions((prev) => ({
                          ...prev,
                          destinationOptions: [],
                        }));
                      }}
                    >
                      {option.title} ({option.subtitle})
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {!flightDetails.destination
                ? "Please select an airport"
                : flightDetails.destination.title}
            </span>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Dates
            </label>
            <DatePickerButton
              departureLabel={departureLabel}
              returnLabel={returnLabel}
              onClick={() => setIsModalOpen(true)}
            />
            <DateAndCabinModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              flightDetails={flightDetails}
              setFlightDetails={setFlightDetails}
            />
            <label className="text-xs text-gray-500 mt-1">
              Select dates and class
            </label>
          </div>
        </div>

        <div className="mt-6 md:mt-10 relative">
          <button
            onClick={handleSearchFlightsWrapper}
            disabled={
              loading ||
              !flightDetails.origin ||
              !flightDetails.destination ||
              !flightDetails.date
            }
            className={`w-full absolute translate-x-2/4 right-2/4 scale-110 md:w-auto ${
              loading ||
              !flightDetails.origin ||
              !flightDetails.destination ||
              !flightDetails.date
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold py-2 px-4 rounded-3xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Searching...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaSearch />
                <span className="text-sm">Search</span>
              </div>
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center mt-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative  max-w-6xl mx-auto"
            role="alert"
          >
            <FaExclamationCircle className="mr-2" />
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flights.length > 0 && !loading && (
          <motion.div
            key="flight-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <FlightList
              flights={flights}
              selectedFlight={selectedFlight}
              sessionId={sessionId}
              setSelectedFlight={setSelectedFlight}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlightSearch;
