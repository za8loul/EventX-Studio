import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { queryClient } from "../lib/queryClient";
import { apiRequest } from "../lib/queryClient";
import { Calendar, MapPin, Users, DollarSign, ArrowLeft, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import type { Event, Seat } from "../../../shared/schema";

export function EventBookingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/events/${id}`],
    queryFn: async () => {
      const response = await apiRequest(`/events/${id}`);
      const data = await response.json();
      console.log('Raw event API response:', data); // Debug this
      return data.event || data; // Extract event if it's wrapped
    },
  });
  
  const { data: seats, isLoading: seatsLoading } = useQuery<Seat[]>({
    queryKey: [`/events/${id}/seats`],
    queryFn: async () => {
      const response = await apiRequest(`/events/${id}/seats`);
      const data = await response.json();
      console.log('Raw seats API response:', data); // Debug this
      return data;
    },
  });

  // Debug: Log what we're getting from the API
  console.log('Event data:', event);
  console.log('Seats data:', seats);
  console.log('Event loading:', eventLoading);
  console.log('Seats loading:', seatsLoading);

  // Check if seats exist and if seating layout is configured
  const hasSeats = seats && typeof seats === 'object' && seats.seats && Object.keys(seats.seats).length > 0;
  const hasSeatingLayout = event?.seatingLayout?.rows && event?.seatingLayout?.seatsPerRow;

  console.log('Seat availability check:', {
    hasSeats,
    hasSeatingLayout,
    seatsKeys: seats?.seats ? Object.keys(seats.seats) : 'no seats object',
    seatingLayout: event?.seatingLayout
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: { eventId: string; seatIds: string[]; totalAmount: number }) => {
      try {
        console.log('Starting booking process for:', bookingData); // Debug log
        
        // Step 1: Map human-readable seat IDs to MongoDB ObjectIds
        const seatIdMapping = new Map();
        
        console.log('Raw seats data:', seats); // Debug log
        
        if (seats && seats.seats) {
          console.log('Seats.seats structure:', seats.seats);
          
          // Handle the nested structure properly
          Object.values(seats.seats).forEach(rowSeats => {
            if (Array.isArray(rowSeats)) {
              rowSeats.forEach(seat => {
                const seatIdentifier = `${String.fromCharCode(64 + seat.rowNumber)}${seat.seatNumber}`;
                seatIdMapping.set(seatIdentifier, seat._id);
                console.log(`Mapped ${seatIdentifier} to ${seat._id}`); // Debug each mapping
              });
            }
          });
        }
        
        console.log('Final seat ID mapping:', Object.fromEntries(seatIdMapping)); // Debug the complete mapping

        // Convert selected seat identifiers to MongoDB ObjectIds
        const mongoSeatIds = bookingData.seatIds
          .map(seatId => {
            const mongoId = seatIdMapping.get(seatId);
            console.log(`Converting ${seatId} to ${mongoId}`); // Debug each conversion
            return mongoId;
          })
          .filter(id => id); // Remove any undefined values

        console.log('Selected seats:', bookingData.seatIds);
        console.log('MongoDB IDs:', mongoSeatIds);

        if (mongoSeatIds.length !== bookingData.seatIds.length) {
          const missingSeats = bookingData.seatIds.filter(seatId => !seatIdMapping.has(seatId));
          console.error('Missing seats in mapping:', missingSeats);
          console.error('Available seat identifiers:', Array.from(seatIdMapping.keys()));
          throw new Error(`Some selected seats could not be found: ${missingSeats.join(', ')}`);
        }

        // Step 2: Reserve the selected seats using MongoDB ObjectIds
        const reserveResponse = await apiRequest(`/events/${bookingData.eventId}/seats/reserve`, "POST", {
          eventId: bookingData.eventId,
          selectedSeats: mongoSeatIds.map(seatId => ({ seatId })),
          numberOfTickets: mongoSeatIds.length
        });

        if (!reserveResponse.ok) {
          const errorData = await reserveResponse.json();
          throw new Error(errorData.message || "Failed to reserve seats");
        }

        const reserveData = await reserveResponse.json();
        console.log('Seats reserved:', reserveData);

        // Step 3: Complete the booking
        const bookingResponse = await apiRequest(`/events/${bookingData.eventId}/book`, "POST", {
          numberOfTickets: mongoSeatIds.length,
          paymentMethod: "credit_card", // Default for demo
          specialRequests: "",
          selectedSeats: reserveData.reservedSeats.map(seat => ({ seatId: seat.id }))
        });

        if (!bookingResponse.ok) {
          const errorData = await bookingResponse.json();
          throw new Error(errorData.message || "Failed to complete booking");
        }

        const bookingResult = await bookingResponse.json();
        console.log('Booking completed:', bookingResult);

        // Create tickets with QR codes for display
        const tickets = (bookingResult.selectedSeats || []).map((seat: any, index: number) => {
          // Add safety checks for undefined values
          const rowNumber = seat?.rowNumber || 1;
          const seatNumber = seat?.seatNumber || 1;
          const seatPrice = seat?.price || event?.price || 0;
          
          return {
            id: `ticket_${Date.now()}_${index}`,
            eventId: bookingData.eventId,
            eventTitle: event?.title || 'Unknown Event',
            seatId: `${String.fromCharCode(64 + rowNumber)}${seatNumber}`,
            purchasePrice: seatPrice,
            purchaseDate: new Date().toISOString(),
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
              ticketId: `ticket_${Date.now()}_${index}`,
              eventId: bookingData.eventId,
              seatId: `${String.fromCharCode(64 + rowNumber)}${seatNumber}`,
              eventTitle: event?.title,
              date: event?.date
            }))}`,
            status: 'confirmed'
          };
        });

        // Store tickets in localStorage for demo purposes
        const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
        const updatedTickets = [...existingTickets, ...tickets];
        localStorage.setItem('userTickets', JSON.stringify(updatedTickets));

        // Return data with safety checks
        return { 
          tickets, 
          totalAmount: bookingResult.totalAmount || bookingData.totalAmount || 0 
        };
      } catch (error) {
        console.error('Booking error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Booking success data:', data); // Debug log
      
      // Add safety checks for undefined values
      const ticketCount = data?.tickets?.length || 0;
      const totalAmount = data?.totalAmount || 0;
      
      toast({
        title: " Booking Confirmed!",
        description: `Successfully booked ${ticketCount} tickets for $${totalAmount.toFixed(2)}`,
      });
      
      // Invalidate queries to refresh seat availability
      queryClient.invalidateQueries({ queryKey: ["/events/browse"] });
      queryClient.invalidateQueries({ queryKey: [`/events/${id}/seats`] });
      
      // Navigate to success page with ticket details
      navigate(`/booking-success?eventId=${id}&tickets=${encodeURIComponent(JSON.stringify(data.tickets || []))}`);
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    },
  });
 
  // Remove the generateSeatsMutation - this should not be available to users

  const isLoading = eventLoading || seatsLoading;

  const handleSeatClick = (seatId: string) => {
    const { status } = getSeatStatus(seatId);
    if (status === 'available') {
      setSelectedSeats(prev => 
        prev.includes(seatId) 
          ? prev.filter(id => id !== seatId)
          : [...prev, seatId]
      );
    }
  };

  const handleBooking = () => {
    if (!event || selectedSeats.length === 0) return;
    
    const totalAmount = event.price * selectedSeats.length;
    
    bookingMutation.mutate({
      eventId: event._id,
      seatIds: selectedSeats,
      totalAmount,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <Button onClick={() => navigate("/")} data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  // Generate seat layout based on event seating configuration
  const generateSeatLayout = (): string[][] => {
    // Check if seatingLayout exists and has required properties
    if (!event?.seatingLayout?.rows || !event?.seatingLayout?.seatsPerRow) {
      return []; // Return empty array if seating layout is not configured
    }

    const rows: string[][] = [];
    const { rows: numRows, seatsPerRow } = event.seatingLayout;
    
    for (let row = 1; row <= numRows; row++) {
      const seats: string[] = [];
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatId = `${String.fromCharCode(64 + row)}${seat}`;
        seats.push(seatId);
      }
      rows.push(seats);
    }
    return rows;
  };

  const seatLayout: string[][] = generateSeatLayout();

  // Function to get seat status and color
  const getSeatStatus = (seatId: string): { status: string; color: string } => {
    // If no seats data, default to available
    if (!seats || !seats.seats) {
      return { status: 'available', color: 'bg-green-500 hover:bg-green-600 text-white cursor-pointer' };
    }

    // Check if this seat exists in the seats data
    const seatExists = Object.values(seats.seats).some(row => 
      row.some(seat => seat.seatIdentifier === seatId)
    );

    // If seat doesn't exist in database, it's unavailable
    if (!seatExists) {
      return { status: 'unavailable', color: 'bg-gray-400 text-gray-600 cursor-not-allowed' };
    }

    // Check if seat is selected by current user
    if (selectedSeats.includes(seatId)) {
      return { status: 'selected', color: 'bg-purple-500 text-white cursor-pointer' };
    }

    // Check seat status from database
    const seatData = Object.values(seats.seats).flat().find(seat => seat.seatIdentifier === seatId);
    
    if (seatData) {
      switch (seatData.status) {
        case 'reserved':
          return { status: 'reserved', color: 'bg-yellow-500 text-white cursor-pointer' };
        case 'paid':
          return { status: 'paid', color: 'bg-red-500 text-white cursor-pointer' };
        case 'available':
        default:
          return { status: 'available', color: 'bg-green-500 hover:bg-green-600 text-white cursor-pointer' };
      }
    }

    // Default to available if no specific status found
    return { status: 'available', color: 'bg-green-500 hover:bg-green-600 text-white cursor-pointer' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-1">
            <Card data-testid="card-event-details">
              <CardHeader>
                <CardTitle data-testid="text-event-title">{event?.title}</CardTitle>
                <CardDescription data-testid="text-event-description">{event?.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span data-testid="text-event-date">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span data-testid="text-event-location">{event.location}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span data-testid="text-event-capacity">
                    {event.availableSeats || event.capacity - event.currentBookings} available seats
                  </span>
                </div>
                
                <div className="flex items-center text-lg font-semibold text-green-600">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span data-testid="text-event-price">${event.price} per ticket</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Badge variant="outline">{event.category}</Badge>
                  <Badge variant={event.status === "published" ? "default" : "secondary"} className="ml-2">
                    {event.status}
                  </Badge>
                </div>

                {selectedSeats.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Selected Seats:</span>
                        <span data-testid="text-selected-seats">{selectedSeats.join(", ")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quantity:</span>
                        <span data-testid="text-ticket-quantity">{selectedSeats.length}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span data-testid="text-total-price">
                          ${(event.price * selectedSeats.length).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleBooking}
                      disabled={bookingMutation.isPending}
                      data-testid="button-book-tickets"
                    >
                      {bookingMutation.isPending ? (
                        "Processing..."
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Book Tickets
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Remove the seat generation button - users shouldn't see this */}
                
              </CardContent>
            </Card>
          </div>

          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <Card data-testid="card-seat-selection">
              <CardHeader>
                <CardTitle>Select Your Seats</CardTitle>
                <CardDescription>Click on available seats to select them for booking</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Stage/Screen */}
                <div className="bg-gray-200 text-center py-4 mb-8 rounded-lg">
                  <span className="text-gray-600 font-medium" data-testid="text-stage">STAGE</span>
                </div>

                {/* Seat Map */}
                {hasSeatingLayout ? (
                  hasSeats ? (
                    <div className="space-y-2">
                      {seatLayout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center space-x-1">
                          <div className="w-8 text-center text-sm font-medium text-gray-600 mr-4" data-testid={`text-row-${String.fromCharCode(65 + rowIndex)}`}>
                            {String.fromCharCode(65 + rowIndex)}
                          </div>
                          {row.map((seatId) => {
                            const isSelected = selectedSeats.includes(seatId);
                            const { status, color } = getSeatStatus(seatId);
                            
                            // Debug logging
                            console.log(`Seat ${seatId}:`, { status, color, isSelected });
                            
                            return (
                              <button
                                key={seatId}
                                onClick={() => {
                                  console.log(`Clicked seat ${seatId}, status: ${status}`); // Debug click
                                  if (status === 'available') {
                                    handleSeatClick(seatId);
                                  }
                                }}
                                disabled={status !== 'available'}
                                className={`w-8 h-8 text-xs font-medium rounded transition-colors ${
                                  isSelected 
                                    ? "bg-blue-600 text-white" 
                                    : color
                                }`}
                                data-testid={`button-seat-${seatId}`}
                              >
                                {seatId.slice(1)}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Seats Not Available</h3>
                      <p className="text-gray-600 mb-4">
                        This event has a seating layout configured but seats are not yet available for booking.
                        Please contact the event organizer or try again later.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Seating Layout Not Configured</h3>
                    <p className="text-gray-600 mb-4">
                      This event doesn't have a seating layout configured yet. 
                      Please contact the event organizer for assistance.
                    </p>
                  </div>
                )}

                {/* Legend - Only show when seating layout exists */}
                {hasSeatingLayout && (
                  <>
                    <div className="flex justify-center space-x-6 mt-8 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-400 rounded mr-2"></div>
                        <span>Reserved</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-600 rounded mr-2"></div>
                        <span>Paid</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                        <span>Unavailable</span>
                      </div>
                    </div>

                    {selectedSeats.length === 0 && (
                      <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-700" data-testid="text-select-seats-instruction">
                          Please select at least one seat to continue with booking
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}