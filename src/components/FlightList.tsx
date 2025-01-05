import { AnimatePresence, motion } from "framer-motion";
import FlightDetails from "./FlightDetails";

type Props = {
  flights: any[];
  selectedFlight: any;
  sessionId: string;
  setSelectedFlight: (flight: any) => void;
};

export default function FlightList({
  flights,
  selectedFlight,
  sessionId,
  setSelectedFlight,
}: Props) {
  return (
    <div>
      {flights.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Available Flights ({flights.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {flights.map((flight: any, index: number) => (
                <motion.div
                  key={flight.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="border border-gray-200 rounded p-4 hover:shadow cursor-pointer"
                    onClick={() => setSelectedFlight(flight)}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <p className="text-lg font-semibold text-blue-600">
                          {flight.price}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">
                          Duration: {Math.floor(flight.duration / 60)}h{" "}
                          {flight.duration % 60}m
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">
                          Stops: {flight.stopCount}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {flight.carriers.map((carrier: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1">
                            <img
                              src={carrier.logoUrl}
                              alt={carrier.name}
                              width={20}
                              height={20}
                            />
                            <p className="text-sm">{carrier.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {selectedFlight && (
            <FlightDetails
              open={Boolean(selectedFlight)}
              onClose={() => setSelectedFlight(null)}
              itineraryId={selectedFlight.id}
              legs={selectedFlight.legs}
              sessionId={sessionId}
            />
          )}
        </div>
      )}
    </div>
  );
}
