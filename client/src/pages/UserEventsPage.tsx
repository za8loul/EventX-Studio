import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Link } from "wouter";
import { Calendar, MapPin, Users, DollarSign, LogOut, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useState } from "react";
import { apiRequest } from "../lib/queryClient";
import { UpcomingEventsSection } from "./sections/UpcomingEventsSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { NavigationSidebarSection } from "./sections/NavigationSidebarSection";

// Backend event interface
interface BackendEvent {
	_id: string;
	title: string;
	description: string;
	date: string;
	location: string;
	capacity: number;
	price: number;
	category: string;
	status: string;
	createdBy: string;
	currentBookings: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	availableSeats?: number;
}

// Frontend event interface
interface Event {
	id: string;
	title: string;
	description: string;
	date: string;
	location: string;
	capacity: number;
	price: number;
	category: string;
	status: string;
	availableSeats: number;
	displayStatus: string;
}

export function UserEventsPage() {
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	// Fetch events from backend
	const { data: eventsData, isLoading, error } = useQuery({
		queryKey: ["/events/browse", searchQuery, selectedCategory],
		queryFn: async () => {
			let url = "/events/browse";
			const params = new URLSearchParams();
			
			if (searchQuery) {
				params.append("search", searchQuery);
			}
			
			if (selectedCategory && selectedCategory !== "all") {
				params.append("category", selectedCategory);
			}
			
			if (params.toString()) {
				url += `?${params.toString()}`;
			}
			
			const response = await apiRequest(url);
			return response.json();
		},
	});

	// Transform backend events to frontend format
	const transformEvents = (events: BackendEvent[]): Event[] => {
		return events.map((event) => ({
			id: event._id,
			title: event.title,
			description: event.description,
			date: event.date,
			location: event.location,
			capacity: event.capacity,
			price: event.price,
			category: event.category,
			status: event.status,
			availableSeats: event.availableSeats || (event.capacity - event.currentBookings),
			displayStatus: event.status === "published" ? "upcoming" : 
								  event.status === "draft" ? "pending" : "closed"
		}));
	};

	const events = eventsData?.events ? transformEvents(eventsData.events) : [];

	// Filter events based on search and category
	const getFilteredEvents = () => {
		let filtered = events;

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(event =>
				event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				event.location.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Filter by category
		if (selectedCategory !== "all") {
			filtered = filtered.filter(event => event.category === selectedCategory);
		}

		// Only show published events for users
		filtered = filtered.filter(event => event.status === "published");

		return filtered;
	};

	const filteredEvents = getFilteredEvents();

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading events...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 text-6xl mb-4">⚠️</div>
					<h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Events</h1>
					<p className="text-gray-600">There was an error loading the events. Please try again later.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
			{/* Sidebar */}
			<NavigationSidebarSection />

			{/* Main area */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<header className="bg-white shadow-sm border-b">
					<div className="px-6 py-4">
						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-3">
								<Calendar className="h-8 w-8 text-blue-600" />
								<div>
									<h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">EventManager</h1>
									<p className="text-sm text-gray-600" data-testid="text-welcome">Welcome, {user?.firstName || user?.email}</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<Link href="/tickets">
									<Button variant="outline" data-testid="button-my-tickets">
										My Tickets
									</Button>
								</Link>
								<Button 
									variant="ghost" 
									onClick={async () => {
										const token = (() => { try { return localStorage.getItem("accessToken"); } catch { return null; } })();
										await fetch("/api/users/logout", {
											method: "POST",
											credentials: "include",
											headers: {
												...(token ? { accesstoken: token } : {}),
											},
										});
										try { localStorage.removeItem("accessToken"); } catch {}
										window.location.href = "/";
									}}
									data-testid="button-logout"
								>
									<LogOut className="h-4 w-4 mr-2" />
									Sign Out
								</Button>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content with Sidebar Layout */}
				<main className="px-6 py-8">
					<div className="mb-8">
						<h2 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-events-title">Upcoming Events</h2>
						<p className="text-gray-600" data-testid="text-events-description">
							Discover and book tickets for amazing events
						</p>
					</div>

					{/* Search and Filter Section */}
					<div className="mb-6 flex flex-col sm:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search events..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex gap-2">
							<Select value={selectedCategory} onValueChange={setSelectedCategory}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="All Categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									<SelectItem value="music">Music</SelectItem>
									<SelectItem value="sports">Sports</SelectItem>
									<SelectItem value="technology">Technology</SelectItem>
									<SelectItem value="business">Business</SelectItem>
									<SelectItem value="education">Education</SelectItem>
									<SelectItem value="entertainment">Entertainment</SelectItem>
									<SelectItem value="workshop">Workshop</SelectItem>
									<SelectItem value="conference">Conference</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Main Content with Sidebar Layout */}
					<div className="flex gap-8">
						{/* Left Column - Events Grid */}
						<div className="flex-1">
							{/* Events Grid */}
							{filteredEvents.length > 0 ? (
								<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{filteredEvents.map((event) => (
										<Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-event-${event.id}`}>
											<Link href={`/events/${event.id}`}>
												<CardHeader className="pb-3">
													<CardTitle className="text-xl" data-testid={`text-event-title-${event.id}`}>
														{event.title}
													</CardTitle>
													<CardDescription data-testid={`text-event-description-${event.id}`}>
														{event.description}
													</CardDescription>
												</CardHeader>
												<CardContent className="space-y-3">
													<div className="flex items-center text-sm text-gray-600">
														<Calendar className="h-4 w-4 mr-2" />
														<span data-testid={`text-event-date-${event.id}`}>
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
														<span data-testid={`text-event-location-${event.id}`}>{event.location}</span>
													</div>
													
													<div className="flex items-center text-sm text-gray-600">
														<Users className="h-4 w-4 mr-2" />
														<span data-testid={`text-event-capacity-${event.id}`}>
															{event.availableSeats} of {event.capacity} seats available
														</span>
													</div>
													
													<div className="flex items-center justify-between pt-2">
														<div className="flex items-center">
															<DollarSign className="h-4 w-4 mr-1 text-green-600" />
															<span className="text-lg font-semibold text-green-600" data-testid={`text-event-price-${event.id}`}>
																${event.price}
															</span>
														</div>
														<Badge 
															variant={event.availableSeats > 0 ? "default" : "secondary"}
															data-testid={`badge-event-available-${event.id}`}
														>
															{event.availableSeats > 0 ? "Available" : "Sold Out"}
														</Badge>
													</div>
												</CardContent>
											</Link>
										</Card>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2" data-testid="text-no-events">
										{searchQuery || selectedCategory !== "all" ? "No events found" : "No events available"}
									</h3>
									<p className="text-gray-600" data-testid="text-no-events-description">
										{searchQuery || selectedCategory !== "all" 
											? "Try adjusting your search or filter criteria."
											: "Check back later for upcoming events to book."
										}
									</p>
								</div>
							)}
						</div>

						{/* Right Sidebar - Upcoming Events and Notifications */}
						<div className="w-80 space-y-6">
							<UpcomingEventsSection />
							<NotificationsSection />
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}