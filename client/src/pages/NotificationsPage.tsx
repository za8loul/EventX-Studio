import React, { useState, useEffect } from "react";
import { BellIcon, CheckIcon, Trash2Icon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { NavigationSidebarSection } from "./sections/NavigationSidebarSection";
import { HeaderSection } from "./sections/HeaderSection";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

// Notification interface
interface Notification {
	_id: string;
	type: string;
	title: string;
	message: string;
	eventId?: string;
	eventTitle?: string;
	priority: string;
	actionUrl?: string;
	isRead: boolean;
	createdAt: string;
}

export const NotificationsPage = (): JSX.Element => {
	const [filterType, setFilterType] = useState("all");
	const [showRead, setShowRead] = useState(true);
	const queryClient = useQueryClient();
	const { toast } = useToast();

	// Fetch user notifications
	const { data: notificationsData, isLoading, error } = useQuery({
		queryKey: ["/notifications"],
		queryFn: async () => {
			const response = await apiRequest("/notifications");
			return response.json();
		},
	});

	// Fetch unread count
	const { data: unreadData } = useQuery({
		queryKey: ["/notifications/unread-count"],
		queryFn: async () => {
			const response = await apiRequest("/notifications/unread-count");
			return response.json();
		},
	});

	const notifications = notificationsData?.notifications || [];
	const unreadCount = unreadData?.unreadCount || 0;

	// Mark notification as read
	const markAsReadMutation = useMutation({
		mutationFn: async (notificationId: string) => {
			return await apiRequest(`/notifications/${notificationId}/read`, "PATCH");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["/notifications"] });
			queryClient.invalidateQueries({ queryKey: ["/notifications/unread-count"] });
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: "Failed to mark notification as read",
				variant: "destructive",
			});
		},
	});

	// Mark all notifications as read
	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			return await apiRequest("/notifications/mark-all-read", "PATCH");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["/notifications"] });
			queryClient.invalidateQueries({ queryKey: ["/notifications/unread-count"] });
			toast({
				title: "Success",
				description: "All notifications marked as read",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: "Failed to mark all notifications as read",
				variant: "destructive",
			});
		},
	});

	// Filter notifications based on current filters
	const filteredNotifications = notifications.filter((notification: Notification) => {
		const matchesType = filterType === "all" || notification.type === filterType;
		const matchesReadStatus = showRead || !notification.isRead;
		return matchesType && matchesReadStatus;
	});

	// Get priority color
	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "bg-red-100 text-red-800 border-red-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "low":
				return "bg-blue-100 text-blue-800 border-blue-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	// Get type icon
	const getTypeIcon = (type: string) => {
		switch (type) {
			case "event_created":
				return "🎉";
			case "event_updated":
				return "✏️";
			case "event_deleted":
				return "❌";
			case "event_cancelled":
				return "🚫";
			case "booking_confirmed":
				return "✅";
			case "booking_cancelled":
				return "❌";
			default:
				return "🔔";
		}
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
		
		if (diffInHours < 1) return "Just now";
		if (diffInHours < 24) return `${diffInHours}h ago`;
		if (diffInHours < 48) return "Yesterday";
		return date.toLocaleDateString();
	};

	// Handle notification click
	const handleNotificationClick = (notification: Notification) => {
		if (!notification.isRead) {
			markAsReadMutation.mutate(notification._id);
		}
		
		if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}
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
								<p className="mt-4 text-gray-600">Loading notifications...</p>
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
								<h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Notifications</h1>
								<p className="text-gray-600">There was an error loading your notifications.</p>
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

					{/* Notifications Content */}
					<main className="flex-1 p-6 bg-[#f2f2f2]">
						<div className="bg-white rounded-[15px] p-8 min-h-[calc(100vh-140px)]">
							{/* Page Header */}
							<div className="flex items-center justify-between mb-8">
								<div className="flex items-center gap-4">
									<div className="relative">
										<BellIcon className="w-8 h-8 text-blue-600" />
										{unreadCount > 0 && (
											<Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
												{unreadCount > 99 ? "99+" : unreadCount}
											</Badge>
										)}
									</div>
									<h1 className="[font-family:'Poppins',Helvetica] font-bold text-black text-3xl tracking-[0] leading-[normal]">
										Notifications
									</h1>
								</div>
								<div className="flex items-center gap-3">
									<Button
										variant="outline"
										onClick={() => markAllAsReadMutation.mutate()}
										disabled={markAllAsReadMutation.isPending || unreadCount === 0}
										className="flex items-center gap-2"
									>
										<CheckIcon className="w-4 h-4" />
										{markAllAsReadMutation.isPending ? "Marking..." : "Mark All Read"}
									</Button>
								</div>
							</div>

							{/* Filters */}
							<div className="flex items-center gap-4 mb-6">
								<select
									value={filterType}
									onChange={(e) => setFilterType(e.target.value)}
									className="px-3 py-2 border border-gray-300 rounded-[8px] text-sm"
								>
									<option value="all">All Types</option>
									<option value="event_created">Event Created</option>
									<option value="event_updated">Event Updated</option>
									<option value="event_deleted">Event Deleted</option>
									<option value="event_cancelled">Event Cancelled</option>
									<option value="booking_confirmed">Booking Confirmed</option>
									<option value="booking_cancelled">Booking Cancelled</option>
									<option value="general">General</option>
								</select>
								
								<Button
									variant="outline"
									onClick={() => setShowRead(!showRead)}
									className="flex items-center gap-2"
								>
									{showRead ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
									{showRead ? "Hide Read" : "Show Read"}
								</Button>
							</div>

							{/* Notifications List */}
							{filteredNotifications.length > 0 ? (
								<div className="space-y-4">
									{filteredNotifications.map((notification: Notification) => (
										<div
											key={notification._id}
											onClick={() => handleNotificationClick(notification)}
											className={`p-4 border rounded-[8px] cursor-pointer transition-all duration-200 hover:shadow-md ${
												notification.isRead 
													? "bg-gray-50 border-gray-200" 
													: "bg-blue-50 border-blue-200"
											}`}
										>
											<div className="flex items-start gap-4">
												<div className="text-2xl">
													{getTypeIcon(notification.type)}
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<h3 className={`font-semibold ${
															notification.isRead ? "text-gray-700" : "text-black"
														}`}>
															{notification.title}
														</h3>
														<Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
															{notification.priority}
														</Badge>
														{!notification.isRead && (
															<Badge className="bg-blue-500 text-white text-xs">
																New
															</Badge>
														)}
													</div>
													<p className={`text-sm mb-2 ${
														notification.isRead ? "text-gray-600" : "text-gray-800"
													}`}>
														{notification.message}
													</p>
													{notification.eventTitle && (
														<p className="text-xs text-blue-600 font-medium">
															Event: {notification.eventTitle}
														</p>
													)}
													<div className="flex items-center justify-between mt-3">
														<span className="text-xs text-gray-500">
															{formatDate(notification.createdAt)}
														</span>
														{notification.actionUrl && (
															<Button
																variant="ghost"
																size="sm"
																className="text-xs text-blue-600 hover:text-blue-800"
															>
																View Details →
															</Button>
														)}
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
									<h3 className="text-xl font-semibold text-gray-600 mb-2">No Notifications</h3>
									<p className="text-gray-500">
										{filterType === "all" 
											? "You don't have any notifications yet."
											: `No ${filterType.replace("_", " ")} notifications found.`
										}
									</p>
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
};
