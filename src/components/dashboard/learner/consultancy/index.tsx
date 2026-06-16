"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  Check,
  Users,
  CalendarCheck,
  Clock,
  SlidersHorizontal,
  X,
} from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";

import type { Specialty, SessionType, SortOption, Booking } from "./types";
import {
  CONSULTANTS,
  MY_BOOKINGS,
  SPECIALTIES,
  SESSION_TYPES,
  SORT_OPTIONS,
  SESSION_ICON,
} from "./data";
import { BookModal } from "./book-modal";
import { ConsultantCard } from "./consultant-card";
import { BookingCard } from "./booking-card";
import type { Consultant } from "./types";

export default function ConsultancyPage() {
  const [specialty, setSpecialty] = useState<Specialty>("All");
  const [sessionTypeFilter, setSessionTypeFilter] =
    useState<SessionType>("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("Recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"find" | "bookings">("find");
  const [bookingTarget, setBookingTarget] = useState<Consultant | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(MY_BOOKINGS);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = CONSULTANTS.filter((c) => {
    const matchSpec = specialty === "All" || c.specialty === specialty;
    const matchType =
      sessionTypeFilter === "All" || c.sessionTypes.includes(sessionTypeFilter);
    const matchAvail = !availableOnly || c.availableToday;
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q));
    return matchSpec && matchType && matchAvail && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "Top Rated") return b.rating - a.rating;
    if (sortBy === "Price: Low–High") return a.pricePerHour - b.pricePerHour;
    if (sortBy === "Price: High–Low") return b.pricePerHour - a.pricePerHour;
    if (sortBy === "Most Booked") return b.totalSessions - a.totalSessions;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleBook = (
    slotId: string,
    topic: string,
    sessionType: SessionType,
  ) => {
    if (!bookingTarget) return;
    const slot = bookingTarget.slots.find((s) => s.id === slotId);
    const newBooking: Booking = {
      id: Date.now(),
      consultantId: bookingTarget.id,
      consultantName: bookingTarget.name,
      consultantAvatar: bookingTarget.avatar,
      date: "Jun 16, 2026",
      time: slot?.time ?? "",
      sessionType,
      topic,
      status: "upcoming",
      duration: 60,
    };
    setBookings((prev) => [newBooking, ...prev]);
    setBookingTarget(null);
    setActiveTab("bookings");
  };

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = Array.from(
      gridRef.current.querySelectorAll(".consultant-card, .booking-card"),
    );
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power3.out" },
    );
  }, [
    specialty,
    sessionTypeFilter,
    search,
    sortBy,
    availableOnly,
    currentPage,
    activeTab,
  ]);

  const upcomingCount = bookings.filter((b) => b.status === "upcoming").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerRef}
        className="opacity-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
            Consultancy
          </h1>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
            Book 1-on-1 sessions with expert mentors and accelerate your growth.
          </p>
        </div>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Available Experts", value: CONSULTANTS.filter(c => c.availableToday).length, iconBg: "bg-(--primary-100)", color: "text-(--primary-600)", Icon: Users,        badge: "available today"     },
          { label: "My Bookings",        value: bookings.length,                                   iconBg: "bg-emerald-100",   color: "text-emerald-600",    Icon: CalendarCheck, badge: "sessions booked"     },
          { label: "Upcoming",           value: upcomingCount,                                      iconBg: "bg-amber-100",     color: "text-amber-600",      Icon: Clock,         badge: "sessions scheduled"  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">{s.label}</p>
                <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-[6px_4px_6px_6px] ${s.iconBg} flex items-center justify-center shrink-0`}>
                <s.Icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <div className="border border-dashed border-(--gray-200)" />
            <p className="text-[12px] font-medium text-(--gray-400)">{s.badge}</p>
          </div>
        ))}
      </div> */}

      {/* Tabs */}
      <div className="flex gap-1 bg-(--gray-100) rounded-xl p-1 w-fit">
        {(["find", "bookings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-[14px]  transition-colors cursor-pointer capitalize ${activeTab === tab ? "bg-white text-(--text-title) shadow-sm font-medium" : "text-(--gray-500) hover:text-(--gray-700) font-normal"}`}
          >
            {tab === "find"
              ? "Find Experts"
              : `My Bookings${bookings.length > 0 ? ` (${bookings.length})` : ""}`}
          </button>
        ))}
      </div>

      {activeTab === "find" ? (
        <>
          {/* Filter row — 2 rows on <xl, 1 row on xl+ */}
          <div className="flex flex-col xl:flex-row xl:items-center gap-2">
            {/* Row 1: Specialty tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none xl:flex-1">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSpecialty(s);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${specialty === s ? "bg-(--primary-600) text-white border-(--primary-600) font-medium" : "bg-white text-(--gray-600) font-normal border-(--gray-200) hover:border-(--primary-300)"}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Row 2 (or right side on xl+): Search + Filters */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search — always visible */}
              <div className="relative w-full max-w-50 xl:w-44 xl:max-w-none xl:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search experts..."
                  className="w-full pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
                />
              </div>

              {/* Filters popover trigger */}
              <div className="relative shrink-0">
                {/* active filter count badge */}
                {(() => {
                  const count =
                    (sessionTypeFilter !== "All" ? 1 : 0) +
                    (availableOnly ? 1 : 0) +
                    (sortBy !== "Recommended" ? 1 : 0);
                  return (
                    <button
                      onClick={() => setFilterOpen((v) => !v)}
                      className={`relative flex items-center gap-2 h-11 px-3.5 rounded-md border text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap ${filterOpen || count > 0 ? "bg-(--primary-600) text-white border-(--primary-600)" : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300)"}`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Filters
                      {count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-white text-(--primary-600) text-[11px] font-bold flex items-center justify-center leading-none">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })()}

                {/* Popover */}
                {filterOpen && (
                  <>
                    {/* backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setFilterOpen(false)}
                    />
                    <div className="absolute right-0 top-13 z-20 bg-white border border-(--gray-200) rounded-2xl shadow-xl w-72 p-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-(--text-title)">
                          Filters
                        </p>
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--gray-100) text-(--gray-400) cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Session type */}
                      <div>
                        <p className="text-[12px] font-semibold text-(--gray-500) mb-2">
                          Session Type
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {SESSION_TYPES.filter((t) => t !== "All").map((t) => {
                            const Icon = SESSION_ICON[t];
                            return (
                              <button
                                key={t}
                                onClick={() => {
                                  setSessionTypeFilter(
                                    sessionTypeFilter === t ? "All" : t,
                                  );
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${sessionTypeFilter === t ? "bg-(--primary-600) text-white border-(--primary-600)" : "bg-white text-(--gray-600) border-(--gray-200) hover:border-(--primary-300)"}`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Available today */}
                      <button
                        onClick={() => {
                          setAvailableOnly((v) => !v);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between h-10 px-3 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${availableOnly ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-(--gray-600) border-(--gray-200) hover:border-emerald-300"}`}
                      >
                        <span>Available Today</span>
                        {availableOnly && <Check className="w-4 h-4" />}
                      </button>

                      {/* Sort */}
                      <div>
                        <p className="text-[12px] font-semibold text-(--gray-500) mb-2">
                          Sort By
                        </p>
                        <div className="relative">
                          <button
                            onClick={() => setSortOpen((v) => !v)}
                            className="w-full flex items-center justify-between h-10 px-3 rounded-lg border border-(--gray-200) bg-white text-[14px] text-(--gray-600) hover:border-(--primary-300) transition-colors cursor-pointer"
                          >
                            {sortBy}
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {sortOpen && (
                            <div className="absolute left-0 bottom-11 z-30 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1.5 w-full">
                              {SORT_OPTIONS.map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    setSortBy(opt);
                                    setSortOpen(false);
                                    setCurrentPage(1);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-[14px] hover:bg-(--gray-50) transition-colors cursor-pointer ${sortBy === opt ? "font-semibold text-(--primary-600)" : "text-(--text-title) font-normal"}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Clear all */}
                      {(sessionTypeFilter !== "All" ||
                        availableOnly ||
                        search ||
                        sortBy !== "Recommended") && (
                        <button
                          onClick={() => {
                            setSessionTypeFilter("All");
                            setAvailableOnly(false);
                            setSearch("");
                            setSortBy("Recommended");
                            setCurrentPage(1);
                          }}
                          className="w-full h-9 rounded-lg border border-(--gray-200) text-[13px] font-medium text-(--gray-500) hover:bg-(--gray-50) transition-colors cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* end Row 2 */}
          </div>
          {/* end Filter row */}

          {/* Results count */}
          <p className="text-[14px] text-(--gray-500)">
            Showing{" "}
            <span className="font-semibold text-(--text-title)">
              {filtered.length}
            </span>{" "}
            expert{filtered.length !== 1 ? "s" : ""}
            {specialty !== "All" && (
              <>
                {" "}
                in{" "}
                <span className="font-semibold text-(--primary-600)">
                  {specialty}
                </span>
              </>
            )}
          </p>

          {/* Grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          >
            {paginated.map((c) => (
              <ConsultantCard
                key={c.id}
                consultant={c}
                onBook={setBookingTarget}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-(--gray-400)">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-[16px] font-medium text-(--text-title)">
                  No experts found
                </p>
                <p className="text-[14px] mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        /* Bookings tab */
        <div ref={gridRef} className="space-y-3">
          {bookings.length === 0 ? (
            <div className="py-16 text-center text-(--gray-400)">
              <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-[16px] font-medium text-(--text-title)">
                No bookings yet
              </p>
              <p className="text-[14px] mt-1">
                Find an expert and book your first session
              </p>
            </div>
          ) : (
            bookings.map((b) => <BookingCard key={b.id} booking={b} />)
          )}
        </div>
      )}

      {bookingTarget && (
        <BookModal
          consultant={bookingTarget}
          onClose={() => setBookingTarget(null)}
          onBook={handleBook}
        />
      )}
    </div>
  );
}
