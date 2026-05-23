"use client";

import { Bell, Menu } from "lucide-react";

export default function InstructorTopbar() {
  const handleMenuClick = () => {
    window.dispatchEvent(new Event("toggleSidebar"));
  };

  return (
    <header className="h-14 lg:h-16 bg-white border-b border-(--gray-200) px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0">
      <button
        onClick={handleMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-(--gray-100) transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-(--gray-600)" />
      </button>

      <div className="hidden lg:block flex-1" />

      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-(--gray-100) transition-colors">
          <Bell className="w-5 h-5 text-(--gray-500)" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-(--primary-600) rounded-full" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-(--primary-100) flex items-center justify-center shrink-0">
            <span className="text-(--primary-600) font-semibold text-sm">E</span>
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-[13px] font-semibold text-(--text-title)">Elena</span>
            <span className="text-[11px] text-(--gray-400)">Pro Instructor</span>
          </div>
        </div>
      </div>
    </header>
  );
}
