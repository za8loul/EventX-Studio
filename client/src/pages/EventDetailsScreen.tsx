import React, { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { CalendarIcon, MapPinIcon, EditIcon, UsersIcon, TagIcon, SaveIcon, Trash2Icon, PlusIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { NavigationSidebarSection } from "./sections/NavigationSidebarSection";
import { HeaderSection } from "./sections/HeaderSection";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

// Event interface matching backend data
interface Event {
	_id: string;
	title: string;
	description: string;
	location: string;
	date: string;
	capacity: number;
	price: number;
	category: string;
	status: string;
	currentBookings?: number;
	seatingLayout?: {
		rows: number;
		seatsPerRow: number;
	};
}

export const EventDetailsScreen = (): JSX.Element => {
	const [, params] = useRoute("/events/:id");
	const eventId = params?.id || "";
	
	// Fetch event data from backend
	const { data: responseData, isLoading, error } = useQuery({
		queryKey: ["/events", eventId],
		queryFn: async () => {
			const response = await apiRequest(`/events/${eventId}`);
			return response.json();
		},
		enabled: !!eventId,
	});

	// Extract event from response data
	const event = responseData?.event;

	const [isEditing, setIsEditing] = useState(false);
	const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Initialize editedEvent when event data loads
	useEffect(() => {
		if (event) {
			console.log('Event data loaded:', event);
			setEditedEvent({ ...event });
		}
	}, [event]);

	const updateEventMutation = useMutation({
		mutationFn: async (eventData: Partial<Event>) => {
			return await apiRequest(`/events/${eventId}`, "PUT", eventData);
		},
		onSuccess: () => {
			toast({
				title: "Event Updated!",
				description: "Your event has been updated successfully.",
			});
			setIsEditing(false);
			queryClient.invalidateQueries({ queryKey: ["/events"] });
		},
		onError: (error) => {
			toast({
				title: "Event Update Failed",
				description: "There was an error updating your event. Please try again.",
				variant: "destructive",
			});
		},
	});

	const deleteEventMutation = useMutation({
		mutationFn: async () => {
			console.log('Delete event mutation called for event ID:', eventId); // Debug log
			
			if (!eventId) {
				throw new Error("Event ID is not available");
			}
			
			const response = await apiRequest(`/events/${eventId}`, "DELETE");
			
			console.log('Delete response status:', response.status); // Debug log
			
			if (!response.ok) {
				const errorData = await response.json();
				console.error('Delete error response:', errorData); // Debug log
				throw new Error(errorData.message || `Failed to delete event (${response.status})`);
			}
			
			const result = await response.json();
			console.log('Delete success response:', result); // Debug log
			return result;
		},
		onSuccess: (data) => {
			console.log('Event deleted successfully:', data); // Debug log
			toast({
				title: "Event Deleted!",
				description: "Your event has been deleted successfully.",
			});
			// Redirect to events list
			window.location.href = "/events";
		},
		onError: (error) => {
			console.error('Delete event error:', error); // Debug log
			toast({
				title: "Event Deletion Failed",
				description: error.message || "There was an error deleting your event. Please try again.",
				variant: "destructive",
			});
		},
	});

	// Add seat generation mutation with better error handling
	const generateSeatsMutation = useMutation({
		mutationFn: async () => {
			console.log('Generating seats for event:', eventId); // Debug log
			console.log('Event data:', event); // Debug log
			
			if (!eventId) {
				throw new Error("Event ID is not available");
			}
			
			if (!event?.seatingLayout) {
				throw new Error("Event doesn't have seating layout configured");
			}
			
			if (!event?.price) {
				throw new Error("Event price is not set");
			}
			
			const requestBody = {
				rows: event.seatingLayout.rows,
				seatsPerRow: event.seatingLayout.seatsPerRow,
				basePrice: event.price, // Added basePrice field
				finalPrice: event.price,
				category: "standard"
			};
			
			console.log('Request body:', requestBody); // Debug log
			console.log('API endpoint:', `/events/${eventId}/seats/generate`); // Debug log
			
			const response = await apiRequest(`/events/${eventId}/seats/generate`, "POST", requestBody);
			
			console.log('Response status:', response.status); // Debug log
			
			if (!response.ok) {
				const errorData = await response.json();
				console.error('Error response:', errorData); // Debug log
				throw new Error(errorData.message || `Failed to generate seats (${response.status})`);
			}
			
			const result = await response.json();
			console.log('Success response:', result); // Debug log
			return result;
		},
		onSuccess: (data) => {
			toast({
				title: "Seats Generated!",
				description: `${data.seats} seats have been generated for this event.`,
			});
			
			// Refresh the event data to show updated information
			queryClient.invalidateQueries({ queryKey: ["/events", eventId] });
		},
		onError: (error) => {
			console.error('Seat generation error:', error); // Debug log
			toast({
				title: "Failed to Generate Seats",
				description: error.message || "There was an error generating seats.",
				variant: "destructive",
			});
		},
	});

	// Add seat generation mutation for existing events
	const generateMissingSeatsMutation = useMutation({
		mutationFn: async () => {
			console.log('Generating missing seats for event:', eventId); // Debug log
			console.log('Event data:', event); // Debug log
			
			if (!eventId) {
				throw new Error("Event ID is not available");
			}
			
			if (!event?.seatingLayout?.rows || !event?.seatingLayout?.seatsPerRow) {
				throw new Error("Event doesn't have seating layout configured");
			}
			
			if (!event?.price) {
				throw new Error("Event price is not set");
			}
			
			const requestBody = {
				rows: event.seatingLayout.rows,
				seatsPerRow: event.seatingLayout.seatsPerRow,
				basePrice: event.price, // Added basePrice field
				finalPrice: event.price,
				category: "standard"
			};
			
			console.log('Request body:', requestBody); // Debug log
			console.log('API endpoint:', `/events/${eventId}/seats/generate`); // Debug log
			
			const response = await apiRequest(`/events/${eventId}/seats/generate`, "POST", requestBody);
			
			console.log('Response status:', response.status); // Debug log
			
			if (!response.ok) {
				const errorData = await response.json();
				console.error('Error response:', errorData); // Debug log
				throw new Error(errorData.message || `Failed to generate seats (${response.status})`);
			}
			
			const result = await response.json();
			console.log('Success response:', result); // Debug log
			return result;
		},
		onSuccess: (data) => {
			toast({
				title: "Seats Generated!",
				description: `${data.seats} seats have been generated for this event.`,
			});
			
			// Refresh the event data to show updated information
			queryClient.invalidateQueries({ queryKey: ["/events", eventId] });
		},
		onError: (error) => {
			console.error('Seat generation error:', error); // Debug log
			toast({
				title: "Failed to Generate Seats",
				description: error.message || "There was an error generating seats.",
				variant: "destructive",
			});
		},
	});

	const handleSave = () => {
		const updateData = {
			title: editedEvent.title || "",
			description: editedEvent.description || "",
			location: editedEvent.location || "",
			price: editedEvent.price || 0,
			capacity: editedEvent.capacity || 0,
		};
		
		updateEventMutation.mutate(updateData);
	};

	const handleCancel = () => {
		setEditedEvent({ ...event });
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
			deleteEventMutation.mutate();
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setEditedEvent(prev => ({ ...prev, [field]: value }));
	};

	if (isLoading) {
		return (
			<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
				<NavigationSidebarSection />
				<div className="flex-1 flex flex-col">
					<HeaderSection />
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-8 min-h-[calc(100vh-140px)]">
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
								<p className="mt-4 text-gray-600">Loading event details...</p>
							</div>
						</div>
					</main>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
				<NavigationSidebarSection />
				<div className="flex-1 flex flex-col">
					<HeaderSection />
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-8 min-h-[calc(100vh-140px)]">
							<div className="text-center py-8">
								<div className="text-red-500 text-6xl mb-4">⚠️</div>
								<h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Event</h1>
								<p className="text-gray-600">There was an error loading the event details.</p>
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

	return (
		<div className="bg-[#f0f0f0] flex w-screen min-h-screen">
			<div className="bg-[#f0f0f0] w-full min-h-screen flex">
				{/* Left Sidebar */}
				<NavigationSidebarSection />

				{/* Main Content Area */}
				<div className="flex-1 flex flex-col">
					{/* Header */}
					<HeaderSection />

					{/* Event Details Content */}
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-8 min-h-[calc(100vh-140px)]">
							{/* Page Header */}
							<div className="text-center mb-8">
								<h1 className="[font-family:'Poppins',Helvetica] font-bold text-black text-3xl tracking-[0] leading-[normal]">
									Event Details
								</h1>
							</div>

							{/* Row 1: Event Name and Event Date */}
							<div className="grid grid-cols-2 gap-6 mb-6">
								<div>
									<label className="block [font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-2">
										Event Name
									</label>
									<div className="flex items-center gap-2">
										<Input
											value={editedEvent.title || ""}
											onChange={(e) => handleInputChange("title", e.target.value)}
											readOnly={!isEditing}
											className={`flex-1 border border-gray-300 rounded-[8px] px-3 py-2 ${!isEditing ? 'bg-gray-50' : ''}`}
										/>
										{isEditing ? (
											<Button size="icon" variant="outline" className="rounded-[8px] bg-green-100 hover:bg-green-200">
												<SaveIcon className="w-4 h-4 text-green-600" />
											</Button>
										) : (
											<Button size="icon" variant="outline" className="rounded-[8px]">
												<EditIcon className="w-4 h-4" />
											</Button>
										)}
									</div>
								</div>
								<div>
									<label className="block [font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-2">
										Event Date
									</label>
									<div className="flex items-center gap-2">
										<Input
											value={editedEvent.date || ""}
											onChange={(e) => handleInputChange("date", e.target.value)}
											readOnly={!isEditing}
											className={`flex-1 border border-gray-300 rounded-[8px] px-3 py-2 ${!isEditing ? 'bg-gray-50' : ''}`}
										/>
										<Button size="icon" variant="outline" className="rounded-[8px]">
											<CalendarIcon className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>

							{/* Row 2: Event Venue and Category */}
							<div className="grid grid-cols-2 gap-6 mb-6">
								<div>
									<label className="block [font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-2">
										Event Venue
									</label>
									<div className="flex items-center gap-2">
										<Input
											value={editedEvent.location || ""}
											onChange={(e) => handleInputChange("location", e.target.value)}
											readOnly={!isEditing}
											className={`flex-1 border border-gray-300 rounded-[8px] px-3 py-2 ${!isEditing ? 'bg-gray-50' : ''}`}
										/>
										<Button size="icon" variant="outline" className="rounded-[8px]">
											<MapPinIcon className="w-4 h-4" />
										</Button>
									</div>
								</div>
								<div>
									<label className="block [font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-2">
										Category
									</label>
									<div className="flex items-center gap-2">
										<Input
											value={editedEvent.category || ""}
											onChange={(e) => handleInputChange("category", e.target.value)}
											readOnly={!isEditing}
											className={`flex-1 border border-gray-300 rounded-[8px] px-3 py-2 ${!isEditing ? 'bg-gray-50' : ''}`}
										/>
										<Button size="icon" variant="outline" className="rounded-[8px]">
											<TagIcon className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>

							{/* Row 3: Event Description (Full Width) */}
							<div className="mb-6">
								<label className="block [font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-2">
									Event Description
								</label>
								<Textarea
									value={editedEvent.description || ""}
									onChange={(e) => handleInputChange("description", e.target.value)}
									readOnly={!isEditing}
									className={`w-full h-32 border border-gray-300 rounded-[8px] px-3 py-2 resize-none ${!isEditing ? 'bg-gray-50' : ''}`}
								/>
							</div>

							{/* Row 4: Pricing Information (3 columns) */}
							<div className="grid grid-cols-3 gap-4 mb-8">
								<div>
									<label className="block [font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-2">
										Ticket Price ($)
									</label>
									<div className="flex items-center gap-2">
										<Input
											value={editedEvent.price?.toString() || ""}
											onChange={(e) => handleInputChange("price", e.target.value)}
											readOnly={!isEditing}
											className={`border border-gray-300 rounded-[8px] px-3 py-2 ${!isEditing ? 'bg-gray-50' : ''}`}
										/>
										{isEditing ? (
											<Button size="icon" variant="outline" className="rounded-[8px] bg-green-100 hover:bg-green-200">
												<SaveIcon className="w-4 h-4 text-green-600" />
											</Button>
										) : (
											<Button size="icon" variant="outline" className="rounded-[8px]">
												<EditIcon className="w-4 h-4" />
											</Button>
										)}
									</div>
								</div>
								<div>
									<label className="block [font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-2">
										Capacity
									</label>
									<div className="flex items-center gap-2">
										<Input
											value={editedEvent.capacity?.toString() || ""}
											onChange={(e) => handleInputChange("capacity", e.target.value)}
											readOnly={!isEditing}
											className={`border border-gray-300 rounded-[8px] px-3 py-2 ${!isEditing ? 'bg-gray-50' : ''}`}
										/>
										{isEditing ? (
											<Button size="icon" variant="outline" className="rounded-[8px] bg-green-100 hover:bg-green-200">
												<SaveIcon className="w-4 h-4 text-green-600" />
											</Button>
										) : (
											<Button size="icon" variant="outline" className="rounded-[8px]">
												<EditIcon className="w-4 h-4" />
											</Button>
										)}
									</div>
								</div>
								<div>
									<label className="block [font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-2">
										Status
									</label>
									<div className="flex items-center gap-2">
										<Input
											value={editedEvent.status || ""}
											onChange={(e) => handleInputChange("status", e.target.value)}
											readOnly={!isEditing}
											className={`border border-gray-300 rounded-[8px] px-3 py-2 ${!isEditing ? 'bg-gray-50' : ''}`}
										/>
										<Button size="icon" variant="outline" className="rounded-[8px]">
											<UsersIcon className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>

							{/* Row 5: Action Buttons */}
							<div className="flex gap-4 justify-center">
								{isEditing ? (
									<>
										<Button 
											className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-[8px] [font-family:'Poppins',Helvetica] font-medium"
											onClick={handleSave}
											disabled={updateEventMutation.isPending}
										>
											{updateEventMutation.isPending ? "Saving..." : "SAVE"}
										</Button>
										<Button 
											className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-[8px] [font-family:'Poppins',Helvetica] font-medium"
											onClick={handleCancel}
										>
											CANCEL
										</Button>
									</>
								) : (
									<>
										<Button 
											className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-[8px] [font-family:'Poppins',Helvetica] font-medium" 
											data-testid="button-edit"
											onClick={() => setIsEditing(true)}
										>
											EDIT
										</Button>
										<Button 
											className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-[8px] [font-family:'Poppins',Helvetica] font-medium"
											onClick={handleDelete}
											disabled={deleteEventMutation.isPending}
										>
											{deleteEventMutation.isPending ? "Deleting..." : "DELETE"}
										</Button>
									</>
								)}
								<Link href={`/events/${eventId}/insights`} data-testid="link-attendee-insights">
									<Button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] [font-family:'Poppins',Helvetica] font-medium">
										Attendee Insights
									</Button>
								</Link>
							</div>
						</div>
					</main>

					{/* Add seat generation section for admins */}
					{event?.seatingLayout && (
						<div className="mt-8 p-6 bg-white rounded-lg shadow">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<PlusIcon className="h-5 w-5 mr-2" />
								Seat Management
							</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Seating Layout
									</label>
									<div className="text-sm text-gray-600">
										<p><strong>Rows:</strong> {event.seatingLayout.rows}</p>
										<p><strong>Seats per Row:</strong> {event.seatingLayout.seatsPerRow}</p>
										<p><strong>Total Capacity:</strong> {event.seatingLayout.rows * event.seatingLayout.seatsPerRow} seats</p>
									</div>
								</div>
								
								<div className="flex items-end">
									<Button
										onClick={() => generateMissingSeatsMutation.mutate()}
										disabled={generateMissingSeatsMutation.isPending}
										variant="outline"
										className="w-full"
									>
										{generateMissingSeatsMutation.isPending ? (
											"Generating Seats..."
										) : (
											<>
												<PlusIcon className="h-4 w-4 mr-2" />
												Generate Missing Seats
											</>
										)}
									</Button>
								</div>
							</div>
							
							<p className="text-sm text-gray-500">
								Generate seats based on the configured seating layout. This will create individual seat records 
								that users can select when booking tickets.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};