import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeftIcon, SearchIcon, FilterIcon, UsersIcon, HeartIcon, MessageCircleIcon, ShareIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { NavigationSidebarSection } from "./sections/NavigationSidebarSection";
import { HeaderSection } from "./sections/HeaderSection";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Interfaces for the data
interface User {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	age: number;
	gender: string;
}

interface EventBooking {
	_id: string;
	user: User;
	numberOfTickets: number;
	totalAmount: number;
	status: string;
	paymentStatus: string;
	paymentMethod: string;
	bookingDate: string;
}

interface Event {
	_id: string;
	title: string;
	date: string;
	location: string;
	capacity: number;
}

interface AttendeeInsights {
	ageDistribution: Array<{ ageRange: string; percentage: number; color: string; count: number }>;
	genderDistribution: Array<{ gender: string; percentage: number; color: string; count: number }>;
	locations: Array<{ location: string; count: number; percentage: number }>;
	paymentMethods: Array<{ method: string; count: number; percentage: number }>;
	bookingStatus: Array<{ status: string; count: number; percentage: number }>;
	totalRevenue: number;
	totalBookings: number;
	averageTicketsPerBooking: number;
}

export const AttendeeInsightsScreen = (): JSX.Element => {
	const [, params] = useRoute("/events/:id/insights");
	const eventId = params?.id || "";

	// Fetch event data
	const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery({
		queryKey: ["/events", eventId],
		queryFn: async () => {
			const response = await apiRequest(`/events/${eventId}`);
			return response.json();
		},
		enabled: !!eventId,
	});

	// Fetch event bookings
	const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useQuery({
		queryKey: ["/events/admin/all-bookings"],
		queryFn: async () => {
			const response = await apiRequest(`/events/admin/all-bookings`);
			return response.json();
		},
		enabled: !!eventId,
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");

	// Extract data
	const event = eventData?.event;
	const allBookings = bookingsData?.bookings || [];
	
	// Filter bookings for the current event
	const bookings = allBookings.filter(booking => booking.event._id === eventId);

	// Calculate insights from real data
	const calculateInsights = (): AttendeeInsights => {
		if (!bookings || bookings.length === 0) {
			return {
				ageDistribution: [],
				genderDistribution: [],
				locations: [],
				paymentMethods: [],
				bookingStatus: [],
				totalRevenue: 0,
				totalBookings: 0,
				averageTicketsPerBooking: 0,
			};
		}

		// Debug: Log the first booking to see the structure
		console.log("First booking structure:", bookings[0]);
		console.log("All bookings for this event:", bookings);

		// Age distribution
		const ageGroups = { "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 };
		bookings.forEach(booking => {
			const age = booking.user?.age;
			console.log(`Booking ${booking._id}: age = ${age}, user =`, booking.user);
			
			if (age && typeof age === 'number') {
				if (age >= 18 && age <= 24) ageGroups["18-24"]++;
				else if (age >= 25 && age <= 34) ageGroups["25-34"]++;
				else if (age >= 35 && age <= 44) ageGroups["35-44"]++;
				else if (age >= 45) ageGroups["45+"]++;
			}
		});

		const ageDistribution = Object.entries(ageGroups).map(([range, count]) => ({
			ageRange: range,
			count,
			percentage: Math.round((count / bookings.length) * 100),
			color: range === "18-24" ? "#10b981" : range === "25-34" ? "#3b82f6" : range === "35-44" ? "#f59e0b" : "#ef4444"
		}));

		// Gender distribution
		const genderCounts = { male: 0, female: 0 };
		bookings.forEach(booking => {
			const gender = booking.user?.gender;
			console.log(`Booking ${booking._id}: gender = ${gender}`);
			
			if (gender && typeof gender === 'string') {
				const genderKey = gender.toLowerCase();
				if (genderKey === 'male' || genderKey === 'female') {
					genderCounts[genderKey as keyof typeof genderCounts]++;
				}
			}
		});

		const genderDistribution = Object.entries(genderCounts).map(([gender, count]) => ({
			gender: gender === "male" ? "Male" : "Female",
			count,
			percentage: Math.round((count / bookings.length) * 100),
			color: gender === "male" ? "#3b82f6" : "#ec4899"
		}));

		// Payment methods
		const paymentCounts: Record<string, number> = {};
		bookings.forEach(booking => {
			paymentCounts[booking.paymentMethod] = (paymentCounts[booking.paymentMethod] || 0) + 1;
		});

		const paymentMethods = Object.entries(paymentCounts).map(([method, count]) => ({
			method: method.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
			count,
			percentage: Math.round((count / bookings.length) * 100)
		}));

		// Booking status
		const statusCounts: Record<string, number> = {};
		bookings.forEach(booking => {
			statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
		});

		const bookingStatus = Object.entries(statusCounts).map(([status, count]) => ({
			status: status.charAt(0).toUpperCase() + status.slice(1),
			count,
			percentage: Math.round((count / bookings.length) * 100)
		}));

		// Total revenue and tickets
		const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
		const totalTickets = bookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);
		const averageTicketsPerBooking = totalTickets / bookings.length;

		return {
			ageDistribution,
			genderDistribution,
			locations: [], // We don't have location data for users in the current model
			paymentMethods,
			bookingStatus,
			totalRevenue,
			totalBookings: bookings.length,
			averageTicketsPerBooking: Math.round(averageTicketsPerBooking * 100) / 100,
		};
	};

	const insights = calculateInsights();

	// Filter bookings based on search and status
	const filteredBookings = bookings.filter(booking => {
		const matchesSearch = 
			booking.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			booking.user.email.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
		
		return matchesSearch && matchesStatus;
	});

	if (eventLoading || bookingsLoading) {
		return (
			<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
				<NavigationSidebarSection />
				<div className="flex-1 flex flex-col">
					<HeaderSection />
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-8 min-h-[calc(100vh-140px)]">
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
								<p className="mt-4 text-gray-600">Loading attendee insights...</p>
							</div>
						</div>
					</main>
				</div>
			</div>
		);
	}

	if (eventError || bookingsError) {
		return (
			<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
				<NavigationSidebarSection />
				<div className="flex-1 flex flex-col">
					<HeaderSection />
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-8 min-h-[calc(100vh-140px)]">
							<div className="text-center py-8">
								<div className="text-red-500 text-6xl mb-4">⚠️</div>
								<h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Insights</h1>
								<p className="text-gray-600">There was an error loading the attendee insights.</p>
								<Button 
									onClick={() => window.location.href = "/events"}
									className="mt-4"
								>
									Back to Events
								</Button>
							</div>
						</div>
					</main>
				</div>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
				<NavigationSidebarSection />
				<div className="flex-1 flex flex-col">
					<HeaderSection />
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-8 min-h-[calc(100vh-140px)]">
							<div className="text-center py-8">
								<div className="text-gray-400 text-6xl mb-4">🔍</div>
								<h1 className="text-2xl font-bold text-gray-600 mb-2">Event Not Found</h1>
								<p className="text-gray-500">The event you're looking for doesn't exist.</p>
								<Button 
									onClick={() => window.location.href = "/events"}
									className="mt-4"
								>
									Back to Events
								</Button>
							</div>
						</div>
					</main>
				</div>
			</div>
		);
	}

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	return (
		<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
			<div className="bg-[#f0f0f0] w-full min-h-screen flex">
				{/* Left Sidebar */}
				<NavigationSidebarSection />

				{/* Main Content Area */}
				<div className="flex-1 flex flex-col">
					{/* Header */}
					<HeaderSection />

					{/* Attendee Insights Content */}
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-8 min-h-[calc(100vh-140px)]">
							{/* Page Header */}
							<div className="flex items-center justify-between mb-8">
								<div className="flex items-center gap-4">
									<Link href={`/events/${eventId}`} data-testid="link-back-event">
										<Button variant="outline" size="icon" className="rounded-[8px]">
											<ArrowLeftIcon className="w-4 h-4" />
										</Button>
									</Link>
									<h1 className="[font-family:'Poppins',Helvetica] font-bold text-black text-3xl tracking-[0] leading-[normal]">
										Attendee Insights - {event.title}
									</h1>
								</div>
								<div className="flex items-center gap-3">
									<div className="relative">
										<Input
											type="text"
											placeholder="Search attendees..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 pr-4 py-2 w-64 rounded-[8px] border border-gray-300"
											data-testid="input-search-insights"
										/>
										<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
									</div>
									<select
										value={filterStatus}
										onChange={(e) => setFilterStatus(e.target.value)}
										className="px-3 py-2 border border-gray-300 rounded-[8px] text-sm"
									>
										<option value="all">All Status</option>
										<option value="pending">Pending</option>
										<option value="confirmed">Confirmed</option>
										<option value="cancelled">Cancelled</option>
										<option value="completed">Completed</option>
									</select>
								</div>
							</div>

							{/* Event Details */}
							<div className="mb-8 p-4 bg-gray-50 rounded-[8px]">
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<span className="w-2 h-2 bg-blue-600 rounded-full"></span>
										<span className="text-gray-600">Event Venue:</span>
										<span className="font-medium" data-testid="text-venue">{event.location}</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="w-2 h-2 bg-blue-600 rounded-full"></span>
										<span className="text-gray-600">Event Date:</span>
										<span className="font-medium" data-testid="text-date">{formatDate(event.date)}</span>
									</div>
								</div>
								<div className="mt-4 flex items-center gap-4">
									<div className="flex items-center gap-2">
										<UsersIcon className="w-4 h-4 text-blue-600" />
										<span className="text-sm text-gray-600">Total Bookings:</span>
										<Badge variant="secondary" data-testid="badge-attendee-count">{insights.totalBookings}</Badge>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-gray-600">Total Revenue:</span>
										<Badge variant="secondary" className="bg-green-100 text-green-800">${insights.totalRevenue.toLocaleString()}</Badge>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-gray-600">Avg Tickets/Booking:</span>
										<Badge variant="secondary" className="bg-blue-100 text-blue-800">{insights.averageTicketsPerBooking}</Badge>
									</div>
								</div>
							</div>

							{/* Data Availability Notice */}
							{insights.totalBookings > 0 && (insights.ageDistribution.length === 0 || insights.genderDistribution.length === 0) && (
								<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-[8px]">
									<div className="flex items-start gap-3">
										<div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
											<span className="text-yellow-800 text-xs font-bold">!</span>
										</div>
										<div className="text-sm text-yellow-800">
											<p className="font-medium mb-1">Limited Demographic Data</p>
											<p className="text-yellow-700">
												Some attendee information (age, gender) is not available. This may be because:
											</p>
											<ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
												<li>Users haven't provided this information during registration</li>
												<li>The data collection fields are not enabled</li>
												<li>This is a legacy booking without demographic data</li>
											</ul>
										</div>
									</div>
								</div>
							)}

							{/* Main Content Grid */}
							<div className="grid grid-cols-2 gap-8">
								{/* Left Column */}
								<div className="space-y-8">
									{/* Attendee Age Distribution */}
									{insights.ageDistribution.length > 0 ? (
										<div>
											<h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-xl mb-6">
												ATTENDEE AGE DISTRIBUTION
											</h2>
											<div className="h-64 w-full">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart
														data={insights.ageDistribution}
														margin={{
															top: 20,
															right: 30,
															left: 20,
															bottom: 5,
														}}
													>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis 
															dataKey="ageRange" 
															tick={{ fontSize: 12 }}
														/>
														<YAxis 
															tick={{ fontSize: 12 }}
															allowDecimals={false}
														/>
														<Tooltip 
															formatter={(value, name) => [
																`${value} attendees`,
																'Count'
															]}
															labelFormatter={(label) => `Age: ${label}`}
														/>
														<Bar 
															dataKey="count" 
															fill="#3b82f6"
															radius={[4, 4, 0, 0]}
														/>
													</BarChart>
												</ResponsiveContainer>
											</div>
										</div>
									) : (
										<div>
											<h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-xl mb-6">
												ATTENDEE AGE DISTRIBUTION
											</h2>
											<div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
												<div className="text-center text-gray-500">
													<UsersIcon className="w-12 h-12 mx-auto mb-2" />
													<p className="text-sm">No age data available</p>
													<p className="text-xs">Age information is not collected for attendees</p>
												</div>
											</div>
										</div>
									)}

									{/* Gender Distribution */}
									{insights.genderDistribution.length > 0 ? (
										<div>
											<h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-xl mb-6">
												GENDER DISTRIBUTION
											</h2>
											<div className="h-64 w-full">
												<ResponsiveContainer width="100%" height="100%">
													<PieChart>
														<Pie
															data={insights.genderDistribution}
															cx="50%"
															cy="50%"
															labelLine={false}
															label={({ gender, percentage }) => `${gender}: ${percentage}%`}
															outerRadius={80}
															fill="#8884d8"
															dataKey="count"
														>
															{insights.genderDistribution.map((entry, index) => (
																<Cell key={`cell-${index}`} fill={entry.color} />
															))}
														</Pie>
														<Tooltip 
															formatter={(value, name) => [
																`${value} attendees`,
																'Count'
															]}
														/>
													</PieChart>
												</ResponsiveContainer>
											</div>
										</div>
									) : (
										<div>
											<h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-xl mb-6">
												GENDER DISTRIBUTION
											</h2>
											<div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
												<div className="text-center text-gray-500">
													<UsersIcon className="w-12 h-12 mx-auto mb-2" />
													<p className="text-sm">No gender data available</p>
													<p className="text-xs">Gender information is not collected for attendees</p>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* Right Column */}
								<div className="space-y-8">
									{/* Payment Methods */}
									{insights.paymentMethods.length > 0 && (
										<div>
											<h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-xl mb-6">
												PAYMENT METHODS
											</h2>
											<div className="h-64 w-full">
												<ResponsiveContainer width="100%" height="100%">
													<PieChart>
														<Pie
															data={insights.paymentMethods}
															cx="50%"
															cy="50%"
															labelLine={false}
															label={({ method, percentage }) => `${method}: ${percentage}%`}
															outerRadius={80}
															fill="#8884d8"
															dataKey="count"
														>
															{insights.paymentMethods.map((entry, index) => (
																<Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
															))}
														</Pie>
														<Tooltip 
															formatter={(value, name) => [
																`${value} bookings`,
																'Count'
															]}
														/>
													</PieChart>
												</ResponsiveContainer>
											</div>
										</div>
									)}

									{/* Booking Status */}
									{insights.bookingStatus.length > 0 && (
										<div>
											<h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-xl mb-6">
												BOOKING STATUS
											</h2>
											<div className="space-y-3">
												{insights.bookingStatus.map((status) => (
													<div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-[8px]">
														<span className="text-sm font-medium">{status.status}</span>
														<div className="text-right">
															<span className="text-lg font-bold">{status.percentage}%</span>
															<div className="text-xs text-gray-500">({status.count})</div>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Attendees List */}
							{filteredBookings.length > 0 && (
								<div className="mt-8">
									<h2 className="[font-family:'Poppins',Helvetica] font-bold text-black text-xl mb-6">
										ATTENDEES LIST
									</h2>
									<div className="bg-gray-50 rounded-[8px] p-4">
										<div className="grid grid-cols-6 gap-4 mb-4 font-medium text-sm text-gray-600">
											<div>Name</div>
											<div>Email</div>
											<div>Age</div>
											<div>Gender</div>
											<div>Tickets</div>
											<div>Status</div>
										</div>
										{filteredBookings.map((booking) => (
											<div key={booking._id} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-200 last:border-b-0">
												<div className="font-medium">
													{booking.user.firstName} {booking.user.lastName}
												</div>
												<div className="text-sm text-gray-600">{booking.user.email}</div>
												<div>{booking.user.age || 'N/A'}</div>
												<div className="capitalize">{booking.user.gender || 'N/A'}</div>
												<div>{booking.numberOfTickets}</div>
												<div>
													<Badge 
														variant={booking.status === 'confirmed' ? 'default' : 
																booking.status === 'pending' ? 'secondary' : 
																booking.status === 'cancelled' ? 'destructive' : 'outline'}
													>
														{booking.status}
													</Badge>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* No Data State */}
							{insights.totalBookings === 0 && (
								<div className="text-center py-12">
									<UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
									<h3 className="text-xl font-semibold text-gray-600 mb-2">No Attendees Yet</h3>
									<p className="text-gray-500">This event doesn't have any bookings yet.</p>
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
};