import { ChevronDownIcon, FilterIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";

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

export const SalesOverviewSection = (): JSX.Element => {
  const [timeFilter, setTimeFilter] = useState<"weekly" | "monthly" | "yearly">("weekly");

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

  // Calculate real metrics
  const calculateMetrics = () => {
    if (!eventsData?.events || !bookingsData?.bookings) {
      return {
        totalRevenue: 0,
        totalTickets: 0,
        totalEvents: 0,
        chartData: []
      };
    }

    const events = eventsData.events as Event[];
    const bookings = bookingsData.bookings as Booking[];

    // Calculate totals
    const totalRevenue = bookings
      .filter(booking => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    const totalTickets = bookings
      .filter(booking => booking.status === "confirmed")
      .reduce((sum, booking) => sum + booking.numberOfTickets, 0);

    const totalEvents = events.length;

    // Calculate weekly revenue data for chart
    const now = new Date();
    const weekStart = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(weekStart.getTime() + (i * 24 * 60 * 60 * 1000));
      const dayEnd = new Date(dayStart.getTime() + (24 * 60 * 60 * 1000));
      
      const dayRevenue = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.bookingDate);
          return bookingDate >= dayStart && bookingDate < dayEnd && booking.paymentStatus === "paid";
        })
        .reduce((sum, booking) => sum + booking.totalAmount, 0);
      
      weeklyData.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
        percentage: totalRevenue > 0 ? ((dayRevenue / totalRevenue) * 100).toFixed(1) : "0"
      });
    }

    return {
      totalRevenue,
      totalTickets,
      totalEvents,
      chartData: weeklyData
    };
  };

  const metrics = calculateMetrics();

  const metricsData = [
    {
      label: "Total Revenue",
      value: `${metrics.totalRevenue.toLocaleString()} LKR`,
    },
    {
      label: "Total Tickets",
      value: `${metrics.totalTickets.toLocaleString()} Tickets`,
    },
    {
      label: "Total Events",
      value: `${metrics.totalEvents} Events`,
    },
  ];

  // Generate dynamic chart data points
  const generateChartDataPoints = () => {
    if (!metrics.chartData.length) return [];
    
    const maxRevenue = Math.max(...metrics.chartData.map(d => d.revenue));
    const chartWidth = 320; // Chart width within container
    const chartHeight = 160; // Chart height within container
    
    return metrics.chartData.map((data, index) => {
      const left = (index / (metrics.chartData.length - 1)) * chartWidth;
      const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * chartHeight : 0;
      const top = chartHeight - height;
      
      return {
        value: data.revenue.toLocaleString(),
        percentage: `${data.percentage}%`,
        x: left,
        y: top,
        day: data.day
      };
    });
  };

  const chartDataPoints = generateChartDataPoints();

  return (
    <div className="w-full relative">
      <Card className="w-full bg-white rounded-[15px] border-0 shadow-sm">
        <CardContent className="relative p-6 h-[401px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[normal] flex items-center gap-2">
              NET SALES
              <ChevronDownIcon className="w-[22px] h-[13px]" />
            </h2>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => {
                const filters = ["weekly", "monthly", "yearly"];
                const currentIndex = filters.indexOf(timeFilter);
                const nextIndex = (currentIndex + 1) % filters.length;
                setTimeFilter(filters[nextIndex] as any);
              }}
            >
              <FilterIcon className="w-4 h-4 mr-2" />
              Filter: {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}
            </Button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {metricsData.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-red-600 font-bold text-xl">{metric.value}</div>
                <div className="text-gray-600 text-sm">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Chart Area - Fixed positioning */}
          <div className="relative h-48 border-l border-b border-gray-300 ml-8">
            {/* Y-axis labels - Now properly positioned */}
            <div className="absolute -left-8 top-0 w-8 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>50,000</span>
              <span>40,000</span>
              <span>30,000</span>
              <span>20,000</span>
              <span>10,000</span>
              <span>0</span>
            </div>

            {/* Chart SVG - Properly contained */}
            <svg className="w-full h-full" viewBox="0 0 320 160" preserveAspectRatio="none">
              {/* Chart line */}
              <polyline
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                points={chartDataPoints.map((point, index) => {
                  const x = point.x;
                  const y = 160 - point.y;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {chartDataPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={160 - point.y}
                  r="4"
                  fill="#dc2626"
                />
              ))}
            </svg>

            {/* X-axis labels (days) */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
              {chartDataPoints.map((point, index) => (
                <span key={index} className="text-center">
                  {point.day}
                </span>
              ))}
            </div>

            {/* Data point labels - Positioned above points */}
            {chartDataPoints.map((point, index) => (
              <div
                key={index}
                className="absolute text-xs text-gray-600 text-center"
                style={{
                  left: `${point.x}px`,
                  top: `${Math.max(0, point.y - 30)}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="font-medium">{point.value}</div>
                <div className="text-gray-500">{point.percentage}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
