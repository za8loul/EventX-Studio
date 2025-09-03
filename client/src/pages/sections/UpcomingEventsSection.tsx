import React from "react";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  image?: string;
}

export const UpcomingEventsSection = (): JSX.Element => {
  // Fetch all events from backend
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ["/events/browse"],
    queryFn: async () => {
      const response = await apiRequest("/events/browse");
      return response.json();
    },
  });

  // Process events to get upcoming ones
  const getUpcomingEvents = (): Event[] => {
    if (!eventsData?.events) return [];
    
    const now = new Date();
    const upcomingEvents = eventsData.events
      .filter((event: Event) => {
        const eventDate = new Date(event.date);
        return eventDate > now; // Only future events
      })
      .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
      .slice(0, 5); // Limit to 5 events
    
    return upcomingEvents;
  };

  const upcomingEvents = getUpcomingEvents();

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get default image based on category
  const getDefaultImage = (category: string): string => {
    const categoryImages: { [key: string]: string } = {
      'seminar': '/figmaAssets/mask-group-1.png',
      'conference': '/figmaAssets/mask-group-2.png',
      'workshop': '/figmaAssets/mask-group-3.png',
      'concert': '/figmaAssets/mask-group-4.png',
      'festival': '/figmaAssets/image.png',
      'default': '/figmaAssets/mask-group-1.png'
    };
    return categoryImages[category.toLowerCase()] || categoryImages.default;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[270px] relative">
        <Card className="w-full bg-white rounded-[15px] border-0 shadow-none">
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="[font-family:'Poppins',Helvetica] font-extrabold text-[#4f4f4f] text-sm tracking-[0] leading-[normal]">
                UPCOMING EVENTS
              </div>
            </div>
            <div className="flex flex-col gap-[15px]">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="w-full h-14 rounded-[10px] border border-solid border-[#eeeeee] shadow-[0px_2px_2px_#00000040] relative animate-pulse">
                  <div className="absolute top-[11px] left-[55px] space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="absolute w-[38px] h-[38px] top-[9px] left-[9px] bg-gray-200 rounded-[19px]"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || upcomingEvents.length === 0) {
    return (
      <div className="w-full max-w-[270px] relative">
        <Card className="w-full bg-white rounded-[15px] border-0 shadow-none">
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="[font-family:'Poppins',Helvetica] font-extrabold text-[#4f4f4f] text-sm tracking-[0] leading-[normal]">
                UPCOMING EVENTS
              </div>
            </div>
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No upcoming events</p>
                <p className="text-xs text-gray-400">Check back later</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[270px] relative">
      <Card className="w-full bg-white rounded-[15px] border-0 shadow-none">
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="[font-family:'Poppins',Helvetica] font-extrabold text-[#4f4f4f] text-sm tracking-[0] leading-[normal]">
              UPCOMING EVENTS
            </div>
            <img
              className="w-[51px] h-[15px]"
              alt="Arrow"
              src="/figmaAssets/arrow-13.svg"
            />
          </div>

          <div className="flex flex-col gap-[15px]">
            {upcomingEvents.map((event, index) => (
              <Link key={event._id} href={`/events/${event._id}`}>
                <a className="block w-full h-14 rounded-[10px] border border-solid border-[#eeeeee] shadow-[0px_2px_2px_#00000040] relative hover:shadow-[0px_4px_8px_#00000060] transition-shadow cursor-pointer">
                  <div className="absolute top-[11px] left-[55px] [font-family:'Poppins',Helvetica] font-medium text-black text-xs tracking-[0] leading-[normal]">
                    Event :&nbsp;&nbsp;{event.title}
                    <br />
                    Date&nbsp;&nbsp;: {formatDate(event.date)}
                  </div>

                  <div className="absolute w-[38px] h-[38px] top-[9px] left-[9px] bg-black rounded-[19px]">
                    <Avatar className="w-9 h-9 absolute top-px left-px">
                      <AvatarImage
                        src={event.image || getDefaultImage(event.category)}
                        alt={`${event.title} avatar`}
                        className="object-cover"
                      />
                    </Avatar>
                  </div>
                </a>
              </Link>
            ))}
          </div>

          <div className="mt-4 text-right">
            <Button
              variant="link"
              className="h-auto p-0 [font-family:'Poppins',Helvetica] font-medium text-black text-xs tracking-[0] leading-[normal] underline"
              onClick={() => window.location.href = '/events'}
            >
              See All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
