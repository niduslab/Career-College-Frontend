"use client";

import Image from "next/image";
import { Calendar, Star, BadgeCheck } from "lucide-react";
import type { Consultant } from "./types";
import { SESSION_ICON } from "./data";

interface ConsultantCardProps {
  consultant: Consultant;
  onBook: (c: Consultant) => void;
}

export function ConsultantCard({ consultant, onBook }: ConsultantCardProps) {
  return (
    <div className="consultant-card opacity-0 bg-white rounded-2xl border border-(--gray-200) p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      {/* Top */}
      <div className="flex items-start gap-3">
        <div className="relative w-14 h-14 shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden">
            <Image
              src={consultant.avatar}
              alt={consultant.name}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
          {consultant.availableToday && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[16px] font-semibold text-(--text-title) truncate">
              {consultant.name}
            </h3>
            <BadgeCheck className="w-4 h-4 text-(--primary-600) shrink-0" />
          </div>
          <p className="text-[12px] text-(--gray-500) truncate">
            {consultant.title}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-[14px] font-semibold text-(--text-title)">
              {consultant.rating}
            </span>
            <span className="text-[12px] text-(--gray-400)">
              ({consultant.reviewCount})
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[16px] font-semibold text-(--primary-600)">
            ${consultant.pricePerHour}
          </p>
          <p className="text-[12px] text-(--gray-400)">/ hour</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-[12px] text-(--gray-500) leading-relaxed line-clamp-2">
        {consultant.bio}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {consultant.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-(--gray-100) text-(--gray-500)"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Session types */}
      <div className="flex items-center gap-2 flex-wrap">
        {consultant.sessionTypes.map((type) => {
          const Icon = SESSION_ICON[type];
          return (
            <span
              key={type}
              className="flex items-center gap-1 text-[12px] text-(--gray-500) bg-(--gray-50) border border-(--gray-200) px-2.5 py-1 rounded-full"
            >
              <Icon className="w-4 h-4" />
              {type}
            </span>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-(--gray-100)">
        <div className="text-center">
          <p className="text-[14px] font-semibold text-(--text-title)">
            {consultant.totalSessions}
          </p>
          <p className="text-[12px] text-(--gray-400)">Sessions</p>
        </div>
        <div className="text-center border-x border-(--gray-100)">
          <p className="text-[14px] font-semibold text-(--text-title)">
            {consultant.responseTime}
          </p>
          <p className="text-[12px] text-(--gray-400)">Response</p>
        </div>
        <div className="text-center">
          <p
            className={`text-[14px] font-semibold ${consultant.availableToday ? "text-emerald-600" : "text-(--gray-400)"}`}
          >
            {consultant.availableToday ? "Today" : "Not Today"}
          </p>
          <p className="text-[12px] text-(--gray-400)">Availability</p>
        </div>
      </div>

      {/* Book button */}
      <button
        onClick={() => onBook(consultant)}
        className="mt-auto w-full h-11 rounded-lg bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Book Session
      </button>
    </div>
  );
}
