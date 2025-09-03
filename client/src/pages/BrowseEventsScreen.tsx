import { useState } from "react";
import { Link } from "wouter";
import { CalendarIcon, FilterIcon, GridIcon, PlusIcon, Users2Icon, ClockIcon, MapPinIcon, DollarSignIcon, UsersIcon, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { NavigationSidebarSection } from "./sections/NavigationSidebarSection";
import { HeaderSection } from "./sections/HeaderSection";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import type { CreateEventRequest } from "../../../shared/schema";

// Event interface based on your backend model
interface BackendEvent {
	_id: string; // MongoDB uses _id
	title: string;
	description: string;
	location: string;
	date: string;
	time?: string;
	capacity: number;
	price: number;
	category: string;
	status: 'draft' | 'published' | 'cancelled' | 'completed' | 'sold_out';
	createdBy?: string;
	bookingDeadline?: string;
	refundPolicy?: string;
	currentBookings?: number;
	seatingLayout?: {
		type: string;
		rows: number;
		seatsPerRow: number;
	};
}

// Transformed event for frontend display
interface Event extends BackendEvent {
	id: string; // Frontend-friendly id
	name: string; // Alias for title
	venue: string; // Alias for location
	revenue: string;
	sold: string;
	total: string;
	displayStatus: string; // Frontend display status
}

export const BrowseEventsScreen = (): JSX.Element => {

	
	const [activeTab, setActiveTab] = useState("published");
	const [sortBy, setSortBy] = useState("date");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch events from backend
	const { data: eventsData, isLoading, error } = useQuery({
		queryKey: ["/events/browse", { search: searchQuery, category: selectedCategory }],
		queryFn: async () => {
			try {

				const params = new URLSearchParams();
				if (searchQuery) params.append("search", searchQuery);
				if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
				
				const response = await apiRequest(`/events/browse?${params.toString()}`);
				const data = await response.json();

				return data;
			} catch (error) {
				console.error('Error fetching events:', error);
				throw error;
			}
		},
		retry: 1,
		refetchOnWindowFocus: false,
	});





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

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "published":
				return <Badge className="bg-green-500 text-white">●</Badge>;
			case "draft":
				return <Badge className="bg-orange-500 text-white">●</Badge>;
			case "cancelled":
			case "completed":
			case "sold_out":
				return <Badge className="bg-red-500 text-white">●</Badge>;
			default:
				return <Badge className="bg-gray-500 text-white">●</Badge>;
		}
	};

	// Transform backend data to match frontend display format
	const transformEvents = (events: BackendEvent[]) => {
		return events.map((event) => ({
			...event,
			id: event._id, // Add id field for compatibility with existing code
			name: event.title,
			venue: event.location,
			revenue: `$${(event.price * event.capacity).toLocaleString()}`,
			sold: (event.currentBookings || 0).toString(),
			total: event.capacity.toString(),
			// Map backend status to frontend display status
			displayStatus: event.status === 'published' ? 'upcoming' : 
					event.status === 'draft' ? 'pending' : 
					event.status === 'cancelled' || event.status === 'completed' || event.status === 'sold_out' ? 'closed' : 'pending',
		}));
	};

	// Filter events based on active tab
	const getFilteredEvents = () => {
		if (!eventsData?.events || !Array.isArray(eventsData.events)) return [];
		
		try {
			const events = transformEvents(eventsData.events);
			
			if (activeTab === "upcoming") return events.filter(event => event.displayStatus === "upcoming");
			if (activeTab === "pending") return events.filter(event => event.displayStatus === "pending");
			if (activeTab === "closed") return events.filter(event => event.displayStatus === "closed");
			return events;
		} catch (error) {
			console.error('Error filtering events:', error);
			return [];
		}
	};

	const filteredEvents = getFilteredEvents();

	// Handle search
	const handleSearch = (value: string) => {
		setSearchQuery(value);
	};

	// Handle category filter
	const handleCategoryFilter = (value: string) => {
		setSelectedCategory(value);
	};

	if (error) {
		return (
			<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
				<NavigationSidebarSection onQuickAddEvent={() => setShowCreateForm(true)} />
				<div className="flex-1 flex flex-col">
					<HeaderSection />
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-6 min-h-[calc(100vh-140px)]">
							<div className="text-center py-8">
								<div className="text-red-600 text-xl font-semibold mb-4">
									Error loading events
								</div>
								<div className="text-gray-600 mb-4">
									{error.message || 'Unknown error occurred'}
								</div>
								<div className="text-sm text-gray-500 mb-6">
									Please check if your backend server is running on port 5000
								</div>
								<Button 
									onClick={() => window.location.reload()}
									className="bg-blue-600 hover:bg-blue-700"
								>
									Retry
								</Button>
							</div>
						</div>
					</main>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
			<div className="bg-[#f0f0f0] w-full min-h-screen flex">
				{/* Left Sidebar */}
				<NavigationSidebarSection onQuickAddEvent={() => setShowCreateForm(true)} />

				{/* Main Content Area */}
				<div className="flex-1 flex flex-col">
					{/* Header */}
					<HeaderSection />

					{/* Browse Events Content */}
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-6 min-h-[calc(100vh-140px)]">
							{/* Page Header */}
							<div className="flex items-center justify-between mb-6">
								<h1 className="[font-family:'Poppins',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[normal]">
									Event Management Section
								</h1>

								<div className="flex items-center gap-4">
									<Select value={selectedCategory} onValueChange={handleCategoryFilter}>
										<SelectTrigger className="w-32">
											<FilterIcon className="w-4 h-4 mr-2" />
											<SelectValue placeholder="Category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All Categories</SelectItem>
											<SelectItem value="conference">Conference</SelectItem>
											<SelectItem value="workshop">Workshop</SelectItem>
											<SelectItem value="seminar">Seminar</SelectItem>
											<SelectItem value="concert">Concert</SelectItem>
											<SelectItem value="sports">Sports</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>

									<div className="relative">
										<Input
											type="text"
											placeholder="Search events..."
											value={searchQuery}
											onChange={(e) => handleSearch(e.target.value)}
											className="pl-10 pr-4 py-2 w-64 rounded-[10px] border border-gray-300"
										/>
										<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<svg
												className="w-4 h-4 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
												/>
											</svg>
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center gap-4 mb-6">
								<Button 
									className="bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2"
									onClick={() => setShowCreateForm(true)}
								>
									<PlusIcon className="w-4 h-4 mr-2" />
									New Event
								</Button>

								<Button
									variant="outline"
									className="border-gray-300 text-gray-700 rounded-[10px] px-4 py-2"
								>
									<Users2Icon className="w-4 h-4 mr-2" />
									Attendee Insights
								</Button>

								<div className="flex items-center gap-2 ml-auto">
									<span className="text-sm text-gray-600">Sort By:</span>
									<Select value={sortBy} onValueChange={setSortBy}>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="date">Date</SelectItem>
											<SelectItem value="price">Price</SelectItem>
											<SelectItem value="capacity">Capacity</SelectItem>
										</SelectContent>
									</Select>

									<Button
										variant="outline"
										size="icon"
										className="rounded-[8px]"
									>
										<GridIcon className="w-4 h-4" />
									</Button>

									<Button
										variant="outline"
										className="rounded-[8px] px-3 py-2"
									>
										<CalendarIcon className="w-4 h-4 mr-2" />
										Pick Date
									</Button>
								</div>
							</div>

							{/* Event Creation Form Modal */}
							{showCreateForm && (
								<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
									<div className="bg-white rounded-[15px] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
										<div className="flex items-center justify-between mb-6">
											<h2 className="text-2xl font-bold">Create New Event</h2>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setShowCreateForm(false)}
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
										
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
													<Label htmlFor="bookingDeadline">Booking Deadline</Label>
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
											
											<div className="flex gap-4 pt-4">
												<Button 
													type="submit" 
													disabled={createEventMutation.isPending}
													className="flex-1"
												>
													{createEventMutation.isPending ? "Creating..." : "Create Event"}
												</Button>
												<Button 
													type="button"
													variant="outline"
													onClick={() => setShowCreateForm(false)}
													className="flex-1"
												>
													Cancel
												</Button>
											</div>
										</form>
									</div>
								</div>
							)}

							{/* Status Tabs */}
							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className="w-full"
							>
								<TabsList className="grid w-full grid-cols-3 mb-6">
									<TabsTrigger
										value="upcoming"
										className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
									>
										<Badge className="bg-green-500 text-white mr-2">●</Badge>
										Published Events
									</TabsTrigger>
									<TabsTrigger
										value="pending"
										className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
									>
										<Badge className="bg-orange-500 text-white mr-2">●</Badge>
										Draft Events
									</TabsTrigger>
									<TabsTrigger
										value="closed"
										className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
									>
										<Badge className="bg-red-500 text-white mr-2">●</Badge>
										Closed Events
									</TabsTrigger>
								</TabsList>

								<TabsContent value={activeTab}>
									{/* Loading State */}
									{isLoading && (
										<div className="text-center py-8">
											<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
											<p className="mt-4 text-gray-600">Loading events...</p>
										</div>
									)}

									{/* No Events State */}
									{!isLoading && (!eventsData?.events || filteredEvents.length === 0) && (
										<div className="text-center py-8">
											<div className="text-gray-400 mb-4">
												<svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
											</div>
											<p className="text-gray-600 text-lg mb-2">No events found</p>
											<p className="text-gray-500 mb-6">
												{eventsData?.events ? 'No events match your current filters.' : 'No events available yet.'}
											</p>
											{!eventsData?.events && (
												<div className="space-y-2 text-sm text-gray-500">
													<p>This could mean:</p>
													<ul className="list-disc list-inside space-y-1">
														<li>Your backend server is not running</li>
														<li>No events have been created yet</li>
														<li>There's an issue with the database connection</li>
													</ul>
												</div>
											)}
										</div>
									)}

									{/* Events Grid */}
									{!isLoading && eventsData?.events && filteredEvents.length > 0 && (
										<div className="grid grid-cols-3 gap-6">
											{filteredEvents.map((event) => (
												<Card
													key={event.id}
													className="bg-white border border-gray-200 rounded-[15px] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
												>
													<CardContent className="p-4">
														<div className="flex items-start justify-between mb-3">
															<h3 className="[font-family:'Poppins',Helvetica] font-semibold text-black text-lg tracking-[0] leading-[normal]">
																{event.name}
															</h3>
															<button className="text-gray-400 hover:text-gray-600">
																<svg
																	className="w-5 h-5"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
																</svg>
															</button>
														</div>

														<div className="space-y-2 mb-4">
															<div className="flex items-center gap-2 text-sm text-gray-600">
																<DollarSignIcon className="w-4 h-4 text-green-500" />
																<span>{event.revenue}</span>

																<UsersIcon className="w-4 h-4 text-red-500 ml-4" />
																<span>{event.sold}</span>

																<UsersIcon className="w-4 h-4 text-blue-500 ml-4" />
																<span>{event.total}</span>
															</div>
														</div>

														<div className="space-y-1 text-sm text-gray-600 mb-4">
															<div className="flex items-center gap-2">
																<MapPinIcon className="w-4 h-4" />
																<span>Venue: {event.venue}</span>
															</div>
															<div className="flex items-center gap-2">
																<CalendarIcon className="w-4 h-4" />
																<span>Date: {new Date(event.date).toLocaleDateString()}</span>
															</div>
															{event.time && (
																<div className="flex items-center gap-2">
																	<ClockIcon className="w-4 h-4" />
																	<span>Time: {event.time}</span>
																</div>
															)}
														</div>

														<div className="flex justify-end">
															<Link href={`/events/${event.id}`}>
																<Button
																	variant="outline"
																	size="icon"
																	className="rounded-full"
																>
																	<svg
																		className="w-4 h-4"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M9 5l7 7-7 7"
																		/>
																	</svg>
																</Button>
															</Link>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									)}

									{/* Pagination Info */}
									{eventsData?.pagination && (
										<div className="mt-6 text-center text-sm text-gray-600">
											Page {eventsData.pagination.currentPage} of {eventsData.pagination.totalPages} 
											({eventsData.pagination.totalEvents} total events)
										</div>
									)}
								</TabsContent>
							</Tabs>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
};