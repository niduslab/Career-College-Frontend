"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Search, ChevronDown, Video } from "lucide-react";
import { WEBINARS, TOPICS, STATUSES } from "./data";
import { WebinarStatus, WebinarTopic } from "./types";
import WebinarStatusBadge from "./status-badge";
import WebinarActionMenu from "./action-menu";

const COLS = "grid-cols-[2fr_1fr_1fr_90px_100px_110px_40px]";

export default function WebinarsTable() {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<"All" | WebinarTopic>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | WebinarStatus>("All");
  const [topicOpen, setTopicOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.35, delay: i * 0.05, ease: "power2.out" },
      );
    });
  }, [search, topicFilter, statusFilter]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenuId === null) return;
      const target = e.target as Node;
      const el = menuRefs.current.get(openMenuId);
      const insideWrapper = el?.contains(target) ?? false;
      const insidePortal = !!(target as HTMLElement).closest?.("[data-action-portal]");
      if (!insideWrapper && !insidePortal) setOpenMenuId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  const closeAllFilters = () => {
    setTopicOpen(false);
    setStatusOpen(false);
  };

  const filtered = WEBINARS.filter((w) => {
    const matchSearch =
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.host.toLowerCase().includes(search.toLowerCase());
    const matchTopic = topicFilter === "All" || w.topic === topicFilter;
    const matchStatus = statusFilter === "All" || w.status === statusFilter;
    return matchSearch && matchTopic && matchStatus;
  });

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
        All Webinars
        <span className="ml-2 text-[12px] font-normal text-(--gray-500)">({filtered.length})</span>
      </p>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:flex-1 lg:flex-none lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or host..."
            className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
          />
        </div>

        <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:ml-auto">
          {/* Topic */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setTopicOpen((v) => !v); setStatusOpen(false); }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left truncate">{topicFilter === "All" ? "Topic" : topicFilter}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${topicOpen ? "rotate-180" : ""}`} />
            </button>
            {topicOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-44">
                {TOPICS.map((t) => (
                  <button key={t} type="button"
                    onClick={() => { setTopicFilter(t); closeAllFilters(); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${t === topicFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {t === "All" ? "All Topics" : t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setStatusOpen((v) => !v); setTopicOpen(false); }}
              className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left">{statusFilter === "All" ? "Status" : statusFilter}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-36">
                {STATUSES.map((st) => (
                  <button key={st} type="button"
                    onClick={() => { setStatusFilter(st); closeAllFilters(); }}
                    className={`w-full text-left px-4 py-2 text-[12px] cursor-pointer transition-colors ${st === statusFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                  >
                    {st === "All" ? "All Statuses" : st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-200">
          {/* Header */}
          <div className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}>
            {["Webinar", "Topic", "Host", "Date", "Registered", "Status"].map((h) => (
              <p key={h} className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                {h}
              </p>
            ))}
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-center">
              Action
            </p>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Video className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
              <p className="text-[14px] text-(--gray-500)">No webinars match your filters.</p>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filtered.map((w, i) => (
                <div
                  key={w.id}
                  ref={(el) => { rowsRef.current[i] = el; }}
                  className={`opacity-0 grid ${COLS} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
                >
                  {/* Title + thumbnail + time */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image src={w.thumbnail} alt={w.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate leading-snug">{w.title}</p>
                      <p className="text-[11px] text-(--gray-400)">{w.duration}</p>
                    </div>
                  </div>

                  {/* Topic */}
                  <p className="text-[12px] text-(--gray-600) truncate">{w.topic}</p>

                  {/* Host */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                      <Image src={w.hostAvatar} alt={w.host} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[12px] text-(--gray-600) truncate">{w.host}</p>
                  </div>

                  {/* Date + time */}
                  <div>
                    <p className="text-[12px] font-medium text-(--text-title)">{w.date}</p>
                    <p className="text-[11px] text-(--gray-400)">{w.time}</p>
                  </div>

                  {/* Registered */}
                  <div>
                    <p className="text-[13px] font-semibold text-(--text-title)">{w.registered.toLocaleString()}</p>
                    {w.attended > 0 && (
                      <p className="text-[11px] text-(--gray-400)">{w.attended} attended</p>
                    )}
                  </div>

                  {/* Status */}
                  <WebinarStatusBadge status={w.status} />

                  {/* Action */}
                  <div className="flex justify-center">
                    <WebinarActionMenu
                      open={openMenuId === w.id}
                      onToggle={() => setOpenMenuId(openMenuId === w.id ? null : w.id)}
                      setRef={(el) => menuRefs.current.set(w.id, el)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
