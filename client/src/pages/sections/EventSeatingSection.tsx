import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";

interface Event {
  _id: string;
  title: string;
  date: string;
  seatingLayout: {
    rows: number;
    seatsPerRow: number;
  };
}

interface Seat {
  _id: string;
  rowNumber: number;
  seatNumber: number;
  status: "available" | "reserved" | "paid";
}

export const EventSeatingSection = (): JSX.Element => {
  // Fetch latest event
  const { data: latestEventData } = useQuery({
    queryKey: ["/events/admin/all"],
    queryFn: async () => {
      const response = await apiRequest("/events/admin/all");
      return response.json();
    },
  });

  // Fetch seats for the latest event
  const { data: seatsData } = useQuery({
    queryKey: ["/events/latest/seats"],
    queryFn: async () => {
      if (!latestEventData?.events?.[0]?._id) return null;
      const response = await apiRequest(`/events/${latestEventData.events[0]._id}/seats`);
      return response.json();
    },
    enabled: !!latestEventData?.events?.[0]?._id,
  });

  // Get latest event
  const getLatestEvent = (): Event | null => {
    if (!latestEventData?.events?.length) return null;
    
    // Sort by date and get the most recent
    const sortedEvents = latestEventData.events.sort((a: Event, b: Event) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedEvents[0];
  };

  const latestEvent = getLatestEvent();
  const seats = seatsData?.seats || {};

  // Generate seat grid dynamically
  const generateSeatGrid = () => {
    if (!latestEvent?.seatingLayout) return [];

    const { rows, seatsPerRow } = latestEvent.seatingLayout;
    const grid = [];

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < seatsPerRow; col++) {
        const seatKey = `${row + 1}`;
        const seatData = seats[seatKey]?.find((seat: Seat) => seat.seatNumber === col + 1);
        const status = seatData?.status || "available";
        
        rowSeats.push({
          row,
          col,
          status,
          seatId: seatData?._id || `${row + 1}-${col + 1}`
        });
      }
      grid.push(rowSeats);
    }

    return grid;
  };

  const seatGrid = generateSeatGrid();

  const legendItems = [
    { color: "bg-[#633fb5]", label: "Paid Seats" },
    { color: "bg-[#633fb5b0]", label: "Reserved Seats" },
    { color: "bg-[#d9d9d9]", label: "To be sold" },
  ];

  const getSeatColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-[#633fb5]";
      case "reserved":
        return "bg-[#633fb5b0]";
      case "available":
        return "bg-[#d9d9d9]";
      default:
        return "bg-[#d9d9d9]";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!latestEvent) {
    return (
      <div className="w-full">
        <Card className="bg-white rounded-[15px]">
          <CardContent className="p-6">
            <h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[normal] mb-6">
              Latest Event
            </h2>
            <div className="text-center text-gray-500 py-8">
              No events available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="bg-white rounded-[15px]">
        <CardContent className="p-6">
          <h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[normal] mb-6">
            Latest Event
          </h2>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-4">
                <div className="[font-family:'Poppins',Helvetica] font-medium text-[#00000078] text-sm tracking-[0] leading-[normal]">
                  Event Name:
                </div>
                <div className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal] mt-1">
                  {latestEvent.title}
                </div>
              </div>

              <div className="mb-6">
                <div className="[font-family:'Poppins',Helvetica] font-medium text-[#00000078] text-sm tracking-[0] leading-[normal]">
                  Event Date:
                </div>
                <div className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm tracking-[0] leading-[normal] mt-1">
                  {formatDate(latestEvent.date)}
                </div>
              </div>

              <div className="space-y-2">
                {legendItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-[13px] h-[13px] ${item.color} rounded-[10px]`}
                    ></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Seat Grid */}
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Seat Layout</h3>
                <p className="text-sm text-gray-600">
                  {latestEvent.seatingLayout.rows} rows × {latestEvent.seatingLayout.seatsPerRow} seats
                </p>
              </div>

              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-2 bg-gray-200 rounded text-sm font-medium">
                    STAGE
                  </div>
                </div>

                <div className="space-y-2">
                  {seatGrid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1">
                      <div className="w-8 text-center text-sm font-medium text-gray-600 mr-4">
                        {String.fromCharCode(65 + rowIndex)}
                      </div>
                      {row.map((seat, colIndex) => (
                        <div
                          key={seat.seatId}
                          className={`w-6 h-6 rounded text-xs font-medium flex items-center justify-center cursor-pointer transition-colors ${
                            seat.status === 'paid' ? 'bg-[#633fb5] text-white' :
                            seat.status === 'reserved' ? 'bg-[#633fb5b0] text-white' :
                            'bg-[#d9d9d9] text-gray-600'
                          }`}
                          title={`Row ${String.fromCharCode(65 + rowIndex)}, Seat ${colIndex + 1} - ${seat.status}`}
                        >
                          {colIndex + 1}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
