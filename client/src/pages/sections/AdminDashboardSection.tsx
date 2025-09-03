import { BellIcon, CalendarIcon, SearchIcon } from "lucide-react";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminDashboardSection = (): JSX.Element => {
  return (
    <header className="w-full shadow-[0px_4px_4px_#00000040]">
      <div className="w-full h-[91px] bg-[#111111] rounded-[20px] flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/figmaAssets/mask-group.png" alt="User avatar" />
            <AvatarFallback>RD</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <h1 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-2xl tracking-[0] leading-[normal]">
              Welcome Rusiru De Silva
            </h1>
            <p className="[font-family:'Poppins',Helvetica] font-normal text-white text-[13px] tracking-[0] leading-[normal]">
              System Administrator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-[291px]">
            <SearchIcon className="absolute w-[25px] h-[25px] top-1/2 left-3.5 transform -translate-y-1/2 text-[#000000c7]" />
            <Input
              className="w-full h-[42px] bg-white rounded-[10px] pl-[52px] pr-4 [font-family:'Poppins',Helvetica] font-normal text-[#000000c7] text-[13px] border-0"
              placeholder="SearchIcon ..."
            />
          </div>

          <Button
            size="icon"
            className="w-[42px] h-[42px] bg-white rounded-[21px] hover:bg-gray-100"
          >
            <BellIcon className="w-[25px] h-[25px] text-black" />
          </Button>

          <Button
            size="icon"
            className="w-[42px] h-[42px] bg-white rounded-[21px] hover:bg-gray-100"
          >
            <CalendarIcon className="w-[25px] h-[25px] text-black" />
          </Button>
        </div>
      </div>
    </header>
  );
};
