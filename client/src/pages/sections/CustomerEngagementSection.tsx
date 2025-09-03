import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";

interface Event {
  _id: string;
  title: string;
  currentBookings: number;
  capacity: number;
}

export const CustomerEngagementSection = (): JSX.Element => {
  // Fetch all events
  const { data: eventsData } = useQuery({
    queryKey: ["/events/admin/all"],
    queryFn: async () => {
      const response = await apiRequest("/events/admin/all");
      return response.json();
    },
  });

  // Calculate real engagement data
  const calculateEngagement = () => {
    if (!eventsData?.events) return [];

    const events = eventsData.events as Event[];
    
    // Sort events by engagement (bookings)
    const engagementData = events
      .map(event => ({
        name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
        value: event.currentBookings,
        percentage: 0, // Will calculate below
        color: getRandomColor()
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 events

    // Calculate percentages
    const totalBookings = engagementData.reduce((sum, event) => sum + event.value, 0);
    engagementData.forEach(event => {
      event.percentage = totalBookings > 0 ? ((event.value / totalBookings) * 100).toFixed(1) : "0";
    });

    return engagementData;
  };

  const getRandomColor = () => {
    const colors = ["#7124f2", "#2d44ec", "#fba700", "#ff371e", "#0cf38a"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const chartData = calculateEngagement();

  const chartImages = [
    {
      src: "/figmaAssets/ellipse-3.svg",
      className: "w-[55px] h-[46px] top-5 left-[115px]",
    },
    {
      src: "/figmaAssets/ellipse.svg",
      className: "w-[52px] h-[91px] top-10 left-[148px]",
    },
    {
      src: "/figmaAssets/ellipse-1.svg",
      className: "w-[103px] h-[69px] top-[120px] left-[93px]",
    },
    {
      src: "/figmaAssets/ellipse-4.svg",
      className: "w-[72px] h-[125px] top-[61px] left-[30px]",
    },
    {
      src: "/figmaAssets/ellipse-2.svg",
      className: "w-[73px] h-[58px] top-5 left-[42px]",
    },
  ];

  const legendItems = chartData.map((event, index) => ({
    color: `bg-[${event.color}]`,
    label: `Event- ${String.fromCharCode(65 + index)}`,
    position: `top-[${319 + (index * 31)}px] left-[47px]`,
    textPosition: `top-[${319 + (index * 31)}px] left-[${index < 2 ? 16 : 63}]`,
  }));

  return (
    <div className="w-full relative">
      <Card className="w-64 h-[401px] bg-white rounded-[15px] relative">
        <CardContent className="p-0 relative h-full">
          <div className="absolute top-4 left-[62px] [font-family:'Poppins',Helvetica] font-bold text-black text-xl text-center tracking-[0] leading-[normal]">
            Customer
            <br />
            Engagement
          </div>

          {/* Dynamic Chart */}
          <div className="absolute top-20 left-0 right-0 px-4">
            <div className="relative w-48 h-48 mx-auto">
              {/* Donut Chart */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {chartData.map((event, index) => {
                  const total = chartData.reduce((sum, e) => sum + e.value, 0);
                  const percentage = (event.value / total) * 100;
                  const startAngle = chartData
                    .slice(0, index)
                    .reduce((sum, e) => sum + (e.value / total) * 360, 0);
                  const endAngle = startAngle + (event.value / total) * 360;
                  
                  const x1 = 50 + 35 * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 50 + 35 * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 50 + 35 * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 50 + 35 * Math.sin((endAngle - 90) * Math.PI / 180);
                  
                  const largeArcFlag = percentage > 50 ? 1 : 0;
                  
                  return (
                    <path
                      key={index}
                      d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={event.color}
                    />
                  );
                })}
                <circle cx="50" cy="50" r="20" fill="white" />
              </svg>

              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-lg font-bold">
                  {chartData.reduce((sum, event) => sum + event.value, 0)}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-0 right-0 px-4">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                <span className="text-xs text-gray-600">{item.label}</span>
                <span className="text-xs font-medium ml-auto">
                  {chartData[index]?.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
