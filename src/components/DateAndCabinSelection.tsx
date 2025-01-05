import React from "react";
import { CabinClass } from "../api/skyScrapper";
import { FaCalendarAlt } from "react-icons/fa";

interface FlightDetails {
  date: string;
  returnDate: string;
  cabinClass: CabinClass;
}

interface DateAndCabinModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightDetails: FlightDetails;
  setFlightDetails: any;
}

interface DatePickerProps {
  departureLabel: string;
  returnLabel: string;
  onClick: () => void;
}

export const DatePickerButton: React.FC<DatePickerProps> = ({
  departureLabel,
  returnLabel,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="border border-gray-300 bg-white rounded-md px-4 py-1 flex items-center justify-between w-full lg:w-[20rem] cursor-pointer hover:bg-gray-50"
    >
      <div className="flex flex-col items-start">
        <span className="text-[0.625rem] text-gray-500">Departure</span>
        <span className="text-xs text-gray-700">{departureLabel}</span>
      </div>

      <div className="mx-4 w-px h-6 bg-gray-200" />

      <div className="flex flex-col items-start">
        <span className="text-[0.625rem] text-gray-500">Return</span>
        <span className="text-xs text-gray-700">{returnLabel}</span>
      </div>

      <FaCalendarAlt className="ml-2 text-gray-400" />
    </div>
  );
};

const DateAndCabinModal: React.FC<DateAndCabinModalProps> = ({
  isOpen,
  onClose,
  flightDetails,
  setFlightDetails,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            X
          </button>

          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Select dates and class
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Departure date
              </label>
              <input
                type="date"
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={flightDetails.date}
                onChange={(e) =>
                  setFlightDetails((prev: any) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Return date (optional)
              </label>
              <input
                type="date"
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={flightDetails.returnDate}
                onChange={(e) =>
                  setFlightDetails((prev: any) => ({
                    ...prev,
                    returnDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
              }}
              className="bg-blue-600 px-4 py-2 rounded-md text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DateAndCabinModal;
