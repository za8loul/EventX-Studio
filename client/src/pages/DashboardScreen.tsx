// import React from "react";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { CustomerEngagementSection } from "./sections/CustomerEngagementSection";
import { EventSeatingSection } from "./sections/EventSeatingSection";
import { HeaderSection } from "./sections/HeaderSection";
import { NavigationSidebarSection } from "./sections/NavigationSidebarSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { SalesOverviewSection } from "./sections/SalesOverviewSection";
import { UpcomingEventsSection } from "./sections/UpcomingEventsSection";
import type { CreateEventRequest } from "../../../shared/schema";

interface Event {
  _id: string;
  title: string;
  date: string;
  price: number;
  capacity: number;
  currentBookings: number;
}

interface Booking {
  _id: string;
  event: string;
  numberOfTickets: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  bookingDate: string;
}

export const DashboardScreen = (): JSX.Element => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all events
  const { data: eventsData } = useQuery({
    queryKey: ["/events/admin/all"],
    queryFn: async () => {
      const response = await apiRequest("/events/admin/all");
      return response.json();
    },
  });

  // Fetch all bookings
  const { data: bookingsData } = useQuery({
    queryKey: ["/events/admin/all-bookings"],
    queryFn: async () => {
      const response = await apiRequest("/events/admin/all-bookings");
      return response.json();
    },
  });

  // Calculate dynamic dashboard metrics
  const calculateDashboardMetrics = () => {
    if (!eventsData?.events || !bookingsData?.bookings) {
      return [
        {
          label: "EVENTS",
          value: "0 Events",
          color: "#1968af",
          icon: "/figmaAssets/dancing.png",
          bgColor: "bg-[#e6f3ff]",
        },
        {
          label: "BOOKINGS",
          value: "0",
          color: "#f29d38",
          icon: "/figmaAssets/movie-ticket-1.png",
          bgColor: "bg-[#fff3e6]",
        },
        {
          label: "REVENUE",
          value: "0 LKR",
          color: "#197920",
          icon: "/figmaAssets/transaction-1.png",
          bgColor: "bg-[#e6ffe6]",
        },
      ];
    }

    const events = eventsData.events as Event[];
    const bookings = bookingsData.bookings as Booking[];

    // Calculate totals
    const totalEvents = events.length;
    
    const totalBookings = bookings
      .filter(booking => booking.status === "confirmed")
      .reduce((sum, booking) => sum + booking.numberOfTickets, 0);
    
    const totalRevenue = bookings
      .filter(booking => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    return [
      {
        label: "EVENTS",
        value: `${totalEvents} Events`,
        color: "#1968af",
        icon: "/figmaAssets/dancing.png",
        bgColor: "bg-[#e6f3ff]",
      },
      {
        label: "BOOKINGS",
        value: totalBookings.toLocaleString(),
        color: "#f29d38",
        icon: "/figmaAssets/movie-ticket-1.png",
        bgColor: "bg-[#fff3e6]",
      },
      {
        label: "REVENUE",
        value: `${totalRevenue.toLocaleString()} LKR`,
        color: "#197920",
        icon: "/figmaAssets/transaction-1.png",
        bgColor: "bg-[#e6ffe6]",
      },
    ];
  };

  const dashboardMetrics = calculateDashboardMetrics();

  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateEventRequest) => {
      return await apiRequest("/events", "POST", eventData);
    },
    onSuccess: () => {
      toast({
        title: "Event Created!",
        description: "Your event has been created successfully.",
      });
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["/events"] });
      queryClient.invalidateQueries({ queryKey: ["/events/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/events/admin/all-bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Event Creation Failed",
        description: "There was an error creating your event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = (formData: FormData) => {
    const eventData: CreateEventRequest = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: new Date(formData.get("date") as string),
      location: formData.get("location") as string,
      capacity: parseInt(formData.get("capacity") as string),
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as any,
      bookingDeadline: new Date(formData.get("bookingDeadline") as string),
      refundPolicy: formData.get("refundPolicy") as string || undefined,
      seatingLayout: {
        type: formData.get("seatingType") as any,
        rows: parseInt(formData.get("rows") as string),
        seatsPerRow: parseInt(formData.get("seatsPerRow") as string),
      },
    };

    createEventMutation.mutate(eventData);
  };

  const handleQuickAddEvent = () => {
    setShowCreateForm(true);
  };

  return (
    <div className="bg-[#f0f0f0] flex w-screen min-h-screen">
      <div className="bg-[#f0f0f0] w-full min-h-screen flex">
        {/* Left Sidebar */}
        <NavigationSidebarSection onQuickAddEvent={handleQuickAddEvent} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <HeaderSection />

          {/* Main Dashboard Content */}
          <div className="flex-1 flex">
            {/* Left Main Content */}
            <main className="flex-1 p-6 bg-[#f2f2f2]">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {dashboardMetrics.map((metric, index) => (
                  <Card
                    key={index}
                    className={`${metric.bgColor} rounded-[15px] border-0 shadow-sm`}
                  >
                    <CardContent className="flex items-center p-4">
                      <div className="w-12 h-12 rounded-[10px] flex items-center justify-center mr-4" style={{ backgroundColor: metric.color + '20' }}>
                        <img
                          className="w-6 h-6"
                          alt={metric.label}
                          src={metric.icon}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="[font-family:'Poppins',Helvetica] font-medium text-xs tracking-[0] leading-[normal]" style={{ color: metric.color }}>
                          {metric.label}
                        </div>
                        <div
                          className="[font-family:'Poppins',Helvetica] font-bold text-lg tracking-[0] leading-[normal]"
                          style={{ color: metric.color }}
                        >
                          {metric.value}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Create Event Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Event Management</span>
                    <Button 
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      variant={showCreateForm ? "outline" : "default"}
                    >
                      {showCreateForm ? "Cancel" : "Create New Event"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                {showCreateForm && (
                  <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreateEvent(new FormData(e.currentTarget)); }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Event Title</Label>
                          <Input id="title" name="title" required />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select name="category" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="seminar">Seminar</SelectItem>
                              <SelectItem value="concert">Concert</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" required />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Event Date</Label>
                          <Input id="date" name="date" type="datetime-local" required />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" name="location" required />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input id="capacity" name="capacity" type="number" min="1" required />
                        </div>
                        <div>
                          <Label htmlFor="price">Price ($)</Label>
                          <Input id="price" name="price" type="number" min="0" step="0.01" required />
                        </div>
                        <div>
                          <Label htmlFor="location">Booking Deadline</Label>
                          <Input id="bookingDeadline" name="bookingDeadline" type="datetime-local" required />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="seatingType">Seating Type</Label>
                          <Select name="seatingType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="theater">Theater</SelectItem>
                              <SelectItem value="stadium">Stadium</SelectItem>
                              <SelectItem value="banquet">Banquet</SelectItem>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="rows">Rows</Label>
                          <Input id="rows" name="rows" type="number" min="1" required />
                        </div>
                        <div>
                          <Label htmlFor="seatsPerRow">Seats per Row</Label>
                          <Input id="seatsPerRow" name="seatsPerRow" type="number" min="1" required />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="refundPolicy">Refund Policy (Optional)</Label>
                        <Textarea id="refundPolicy" name="refundPolicy" />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={createEventMutation.isPending}
                        className="w-full"
                      >
                        {createEventMutation.isPending ? "Creating..." : "Create Event"}
                      </Button>
                    </form>
                  </CardContent>
                )}
              </Card>

              {/* Charts Section */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="col-span-2">
                  <SalesOverviewSection />
                </div>
                <div>
                  <CustomerEngagementSection />
                </div>
              </div>

              {/* Latest Event Section */}
              <div className="w-full">
                <EventSeatingSection />
              </div>
            </main>

            {/* Right Sidebar */}
            <aside className="w-80 bg-[#f2f2f2] p-6 border-l border-gray-200">
              <div className="space-y-6">
                <UpcomingEventsSection />
                <NotificationsSection />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
