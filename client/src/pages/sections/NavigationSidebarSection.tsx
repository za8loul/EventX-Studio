import { ChevronDownIcon, PlusIcon } from "lucide-react";
import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../../hooks/useAuth";

const navigationSections = [
  {
    title: "Main Navigation",
    items: [
      { icon: "/figmaAssets/event-accepted-1.png", text: "Dashboard", href: "/" },
      { icon: "/figmaAssets/control-panel.png", text: "Manage Events", href: "/events" },
      { icon: "/figmaAssets/new-ticket.png", text: "Booking & Tickets", href: "/tickets" },
      {
        icon: "/figmaAssets/collaborating-in-circle.png",
        text: "Attendee Insights",
        href: "/insights"
      },
      { icon: "/figmaAssets/statistics.png", text: "Analytics & Reports", href: "/analytics" },
    ],
  },
  {
    title: "Support & Management",
    items: [
      { icon: "/figmaAssets/customer-support.png", text: "Contact Support", href: "/support" },
      { icon: "/figmaAssets/add-reminder.png", text: "Notifications", href: "/notifications" },
      { icon: "/figmaAssets/settings-1.png", text: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Additional Features",
    items: [
      { icon: "/figmaAssets/speaker.png", text: "Marketing", href: "/marketing" },
      { icon: "/figmaAssets/opened-folder.png", text: "Event Categories", href: "/categories" },
    ],
  },
  {
    title: "Account Management",
    items: [
      { icon: "/figmaAssets/add-user-male.png", text: "Manage Users", href: "/users" },
      { icon: "/figmaAssets/logout-1.png", text: "Logout", href: "/logout" },
    ],
  },
];

interface NavigationSidebarSectionProps {
  onQuickAddEvent?: () => void;
}

export const NavigationSidebarSection = ({ onQuickAddEvent }: NavigationSidebarSectionProps): JSX.Element => {
  const { isAdmin } = useAuth();

  // Remove admin-only links for non-admin users while preserving the sidebar layout
  const adminOnlyHrefs = new Set(["/insights", "/analytics", "/marketing", "/categories", "/users", "/events"]);
  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: isAdmin ? section.items : section.items.filter(item => !adminOnlyHrefs.has(item.href || ""))
  })).filter(section => section.items.length > 0);

  return (
    <nav className="w-[252px] h-full bg-black text-white p-3">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#d9d9d9] rounded-[20px] flex items-center justify-center">
          <img
            className="w-[39px] h-[39px]"
            alt="Mask group"
            src="/figmaAssets/mask-group-5.png"
          />
        </div>

        <div className="flex flex-col">
          <div className="[font-family:'Poppins',Helvetica] font-extrabold text-white text-2xl tracking-[0] leading-[normal]">
            EventX
          </div>
          <div className="[font-family:'Reenie_Beanie',Helvetica] font-normal text-white text-2xl tracking-[0] leading-[normal] whitespace-nowrap">
            studio
          </div>
        </div>
      </div>

      {isAdmin && (
        <Button 
          className="w-full bg-[#282828] hover:bg-[#3a3a3a] rounded-[10px] p-3 h-auto mb-6 justify-start"
          onClick={onQuickAddEvent}
        >
          <div className="w-9 h-9 bg-[#c1ff72] rounded-[10px] flex items-center justify-center mr-3">
            <PlusIcon className="w-4 text-black" />
          </div>
          <div className="flex flex-col items-start">
            <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[15px] tracking-[0] leading-[normal]">
              Add Quick Event
            </div>
            <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[10px] tracking-[0] leading-[normal]">
              Events
            </div>
          </div>
        </Button>
      )}

      <div className="space-y-4">
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm">
                  {section.title}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-white" />
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2 space-y-2">
                {section.items.map((item, itemIndex) => (
                  <Link key={`${section.title}-${itemIndex}`} href={item.href || "#"}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-[#282828] h-auto p-2"
                    >
                      <img
                        className="w-[25px] h-[25px] mr-3"
                        alt={item.text}
                        src={item.icon}
                      />
                      <span className="[font-family:'Poppins',Helvetica] font-medium text-[13px]">
                        {item.text}
                      </span>
                    </Button>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {sectionIndex < filteredSections.length - 1 && (
              <Separator className="my-4 bg-gray-600" />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};
