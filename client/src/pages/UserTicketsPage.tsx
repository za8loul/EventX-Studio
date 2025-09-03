import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Link } from "wouter";
import { Calendar, MapPin, Users, QrCode, ArrowLeft, Ticket } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import type { Ticket as TicketType, Event } from "../../../shared/schema";

interface TicketWithEvent extends TicketType {
  event?: Event;
}

export function UserTicketsPage() {
  const { user } = useAuth();
  
  const { data: tickets, isLoading } = useQuery<TicketWithEvent[]>({
    queryKey: ["/tickets/my-tickets"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-tickets-title">My Tickets</h2>
          <p className="text-gray-600" data-testid="text-tickets-description">
            View and manage your booked event tickets
          </p>
        </div>

        {tickets && tickets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {tickets.map((ticket) => (
              <Card key={ticket._id} className="overflow-hidden" data-testid={`card-ticket-${ticket._id}`}>
                <div className="grid md:grid-cols-3">
                  {/* Event Info */}
                  <div className="md:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl" data-testid={`text-ticket-event-${ticket._id}`}>
                          {ticket.event?.title || `Event #${ticket.event}`}
                        </CardTitle>
                        <Badge 
                          variant={ticket.status === "active" ? "default" : "destructive"}
                          data-testid={`badge-ticket-status-${ticket._id}`}
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <CardDescription data-testid={`text-ticket-date-${ticket._id}`}>
                        Booked on {new Date(ticket.issuedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Booking Reference:</span>
                          <p className="text-gray-600 font-mono" data-testid={`text-ticket-reference-${ticket._id}`}>
                            {ticket.bookingReference}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Purchase Price:</span>
                          <p className="text-green-600 font-semibold" data-testid={`text-ticket-price-${ticket._id}`}>
                            ${ticket.purchasePrice}
                          </p>
                        </div>
                      </div>
                      
                      {ticket.event && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Event Date:</span>
                            <p className="text-gray-600" data-testid={`text-event-date-${ticket._id}`}>
                              {new Date(ticket.event.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Location:</span>
                            <p className="text-gray-600" data-testid={`text-event-location-${ticket._id}`}>
                              {ticket.event.location}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  {/* QR Code Section */}
                  <div className="bg-gray-50 p-6 flex flex-col items-center justify-center border-l">
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                        {ticket.qrCode ? (
                          <img 
                            src={ticket.qrCode} 
                            alt="QR Code" 
                            className="w-full h-full object-contain"
                            data-testid={`img-qr-code-${ticket._id}`}
                          />
                        ) : (
                          <QrCode className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 mb-1" data-testid={`text-qr-title-${ticket._id}`}>
                        Ticket QR Code
                      </p>
                      <p className="text-xs text-gray-600 font-mono" data-testid={`text-qr-code-${ticket._id}`}>
                        {ticket.bookingReference}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-4"
                      data-testid={`button-download-${ticket._id}`}
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2" data-testid="text-no-tickets">No tickets found</h3>
            <p className="text-gray-600 mb-4" data-testid="text-no-tickets-description">
              You haven't booked any tickets yet. Browse events to get started!
            </p>
            <Link href="/">
              <Button data-testid="button-browse-events">
                Browse Events
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}