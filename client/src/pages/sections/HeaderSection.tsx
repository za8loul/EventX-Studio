import React from "react";
import { SearchIcon, BellIcon, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../../hooks/useAuth";

export const HeaderSection = (): JSX.Element => {
  const { user } = useAuth();
  
  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return "U";
  };

  // Get user's full name
  const getUserFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || "User";
  };

  // Get user's role
  const getUserRole = () => {
    if (user?.role === "ADMIN") {
      return "System Administrator";
    } else if (user?.role === "USER") {
      return "User";
    }
    return "Guest";
  };

  return (
    <header className="flex items-center justify-between p-4 bg-[#f2f2f2] border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/figmaAssets/mask-group.png" alt="User" />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="[font-family:'Poppins',Helvetica] font-semibold text-black text-lg tracking-[0] leading-[normal]">
              Welcome {getUserFullName()}
            </h1>
            <p className="[font-family:'Poppins',Helvetica] font-normal text-[#00000078] text-sm tracking-[0] leading-[normal]">
              {getUserRole()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 rounded-[10px] border border-gray-300 bg-white"
          />
        </div>
        
        <Button variant="outline" size="icon" className="rounded-full bg-white border-gray-300">
          <BellIcon className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" size="icon" className="rounded-full bg-white border-gray-300">
          <CalendarIcon className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};