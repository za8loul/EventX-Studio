import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, Download, ArrowLeft, QrCode } from 'lucide-react';

interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  seatId: string;
  purchasePrice: number;
  purchaseDate: string;
  qrCode: string;
  status: string;
}

export const BookingSuccessPage = () => {
  const [, setLocation] = useLocation();
  
  // Parse ticket data from URL params with error handling
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('eventId');
  const ticketsData = params.get('tickets');
  
  let tickets: Ticket[] = [];
  let totalAmount = 0;
  
  try {
    if (ticketsData) {
      // Decode the URL and parse JSON safely
      const decodedData = decodeURIComponent(ticketsData);
      console.log('Decoded tickets data:', decodedData); // Debug
      tickets = JSON.parse(decodedData);
      totalAmount = tickets.reduce((sum, ticket) => sum + ticket.purchasePrice, 0);
    }
  } catch (error) {
    console.error('Error parsing tickets data:', error);
    console.error('Raw tickets data:', ticketsData);
    
    // Fallback: create dummy tickets for demo purposes
    tickets = [
      {
        id: 'demo_ticket_1',
        eventId: eventId || 'unknown',
        eventTitle: 'Demo Event',
        seatId: 'A1',
        purchasePrice: 100,
        purchaseDate: new Date().toISOString(),
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=demo_ticket_1',
        status: 'confirmed'
      }
    ];
    totalAmount = 100;
  }

  const handleDownloadTickets = () => {
    // Create a simple text representation of tickets for download
    const ticketText = tickets.map(ticket => 
      `Ticket ID: ${ticket.id}\nEvent: ${ticket.eventTitle}\nSeat: ${ticket.seatId}\nPrice: $${ticket.purchasePrice}\nDate: ${new Date(ticket.purchaseDate).toLocaleDateString()}\n\n`
    ).join('');
    
    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${eventId || 'demo'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigate = (path: string) => {
    setLocation(path);
  };

  // If no tickets data, show error message
  if (!ticketsData && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">No Ticket Data Found</h1>
          <p className="text-gray-600 mb-4">
            The booking was successful, but ticket data could not be loaded.
          </p>
          <Button onClick={() => navigate('/')} className="mr-2">
            Back to Events
          </Button>
          <Button variant="outline" onClick={() => navigate('/tickets')}>
            View My Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your tickets have been successfully booked. Here are your ticket details:
          </p>
        </div>

        {/* Summary Card */}
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-center">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Event:</span>
              <span className="font-medium">{tickets[0]?.eventTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>Tickets:</span>
              <span className="font-medium">{tickets.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-medium text-green-600">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-lg">Seat {ticket.seatId}</CardTitle>
                <p className="text-sm text-gray-600">Ticket ID: {ticket.id}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code */}
                <div className="text-center">
                  <img 
                    src={ticket.qrCode} 
                    alt={`QR Code for ${ticket.seatId}`}
                    className="w-32 h-32 mx-auto border-2 border-gray-200 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">Scan for entry</p>
                </div>
                
                {/* Ticket Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-medium">{ticket.eventTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seat:</span>
                    <span className="font-medium">{ticket.seatId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium text-green-600">${ticket.purchasePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-600 capitalize">{ticket.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleDownloadTickets}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Tickets
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/tickets')}
            className="flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            View All Tickets
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Button>
        </div>
      </div>
    </div>
  );
};
