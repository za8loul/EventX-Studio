import { Building2Icon, ClockIcon, CreditCardIcon, BellIcon } from "lucide-react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Link } from "wouter";

export const NotificationsSection = (): JSX.Element => {
	// Fetch unread notification count
	const { data: unreadData } = useQuery({
		queryKey: ["/notifications/unread-count"],
		queryFn: async () => {
			const response = await apiRequest("/notifications/unread-count");
			return response.json();
		},
	});

	// Fetch recent notifications
	const { data: notificationsData } = useQuery({
		queryKey: ["/notifications"],
		queryFn: async () => {
			const response = await apiRequest("/notifications");
			return response.json();
		},
	});

	const unreadCount = unreadData?.unreadCount || 0;
	const notifications = notificationsData?.notifications || [];

	// Get notification icon based on type
	const getNotificationIcon = (type: string) => {
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
		return date.toLocaleDateString();
	};

	return (
		<div className="w-[270px]">
			<Card className="w-64 h-[335px] bg-white rounded-[15px] shadow-sm">
				<CardContent className="p-0 relative h-full">
					<div className="flex items-center justify-between pt-[22px] px-[18px] pb-4">
						<div className="flex items-center gap-2">
							<div className="relative">
								<BellIcon className="w-5 h-5 text-[#4f4f4f]" />
								{unreadCount > 0 && (
									<Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
										{unreadCount > 99 ? "99+" : unreadCount}
									</Badge>
								)}
							</div>
							<h3 className="[font-family:'Poppins',Helvetica] font-extrabold text-[#4f4f4f] text-sm tracking-[0] leading-[normal]">
								Notifications
							</h3>
						</div>
						<Link href="/notifications">
							<img
								className="w-[51px] h-[15px] cursor-pointer"
								alt="Arrow"
								src="/figmaAssets/arrow-13.svg"
							/>
						</Link>
					</div>

					<Separator className="mx-[21px] w-[214px]" />

					<div className="flex flex-col">
						{notifications.length > 0 ? (
							notifications.slice(0, 4).map((notification: any, index: number) => (
								<Link key={notification._id} href="/notifications">
									<div className="flex items-start gap-3 px-[18px] py-3 hover:bg-gray-50 cursor-pointer">
										<div className="text-lg mt-1">
											{getNotificationIcon(notification.type)}
										</div>
										<div className="flex-1">
											<p className={`[font-family:'Poppins',Helvetica] font-medium text-black text-xs tracking-[0] leading-[normal] ${
												!notification.isRead ? 'font-semibold' : ''
											}`}>{notification.title}</p>
											<p className="text-xs text-gray-500 mt-1">
												{formatDate(notification.createdAt)}
											</p>
										</div>
										{!notification.isRead && (
											<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
										)}
									</div>
									{index < Math.min(notifications.length - 1, 3) && (
										<Separator className="mx-[21px] w-[214px]" />
									)}
								</Link>
							))
						) : (
							<div className="px-[18px] py-6 text-center">
								<p className="text-xs text-gray-500">No notifications yet</p>
							</div>
						)}
					</div>

					<div className="absolute bottom-[23px] right-[18px]">
						<Link href="/notifications">
							<button className="[font-family:'Poppins',Helvetica] font-medium text-black text-xs tracking-[0] leading-[normal] underline cursor-pointer">
								See All
							</button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
