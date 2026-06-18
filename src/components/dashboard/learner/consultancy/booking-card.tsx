"use client";

import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import type { Booking } from "./types";
import { SESSION_ICON, STATUS_STYLE } from "./data";

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const Icon = SESSION_ICON[booking.sessionType];
  return (
    <div className="booking-card opacity-0 bg-white rounded-xl border border-(--gray-200) p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
        <Image
          src={booking.consultantAvatar}
          alt={booking.consultantName}
          width={40}
          height={40}
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold text-(--text-title) truncate">
          {booking.consultantName}
        </h3>
        <p className="text-[12px] text-(--gray-500) truncate">
          {booking.topic}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Calendar className="w-4 h-4" />
            {booking.date}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Clock className="w-4 h-4" />
            {booking.time}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-(--gray-400)">
            <Icon className="w-4 h-4" />
            {booking.sessionType}
          </span>
        </div>
      </div>
      <span
        className={`text-[12px] font-semibold px-2.5 py-1 rounded-full shrink-0 capitalize ${STATUS_STYLE[booking.status]}`}
      >
        {booking.status}
      </span>
    </div>
  );
}
