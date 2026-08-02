"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import { Search, ChevronDown, Video, Loader2, Plus } from "lucide-react";
import type { Webinar, WebinarStatus } from "./types";
import WebinarStatusBadge from "./status-badge";
import WebinarActionMenu from "./action-menu";
import { STATUS_OPTIONS, STATUS_LABEL } from "./data";
import { archiveWebinar, reworkWebinar } from "@/lib/webinar-api";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";

const AddWebinarDrawer = dynamic(() => import("./add-drawer"), { ssr: false });

const COLS = "grid-cols-[minmax(0,2fr)_minmax(0,1fr)_1fr_90px_100px_40px]";

interface TableProps {
  webinars: Webinar[];
  loading: boolean;
  onRefresh: () => void;
}

export default function WebinarsTable({ webinars, loading, onRefresh }: TableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | WebinarStatus>("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.35, delay: i * 0.05, ease: "power2.out" },
      );
    });
  }, [search, statusFilter, webinars]);

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

  const filtered = webinars.filter((w) => {
    const matchSearch = w.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const goToDetail = (w: Webinar) =>
    router.push(`/dashboard/partnership/webinars/${w.id}`);

  const handleArchive = async (w: Webinar) => {
    setBusyId(w.id);
    setOpenMenuId(null);
    try {
      await archiveWebinar(w.id);
      notify.success("Webinar archived.");
      onRefresh();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to archive webinar.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRework = async (w: Webinar) => {
    setBusyId(w.id);
    setOpenMenuId(null);
    try {
      await reworkWebinar(w.id);
      notify.success("Webinar moved back to draft.");
      onRefresh();
    } catch (err) {
      notify.error(err instanceof ApiError ? err.message : "Failed to rework webinar.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
          All Webinars
          <span className="ml-2 text-[12px] font-normal text-(--gray-500)">({filtered.length})</span>
        </p>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-(--primary-700) text-white text-[13px] font-medium hover:bg-(--primary-600) cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Webinar
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:flex-1 lg:flex-none lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
          />
        </div>

        <div className="relative md:ml-auto">
          <button
            type="button"
            onClick={() => setStatusOpen((v) => !v)}
            className="flex items-center gap-1.5 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[13px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
          >
            <span className="flex-1 text-left truncate">{STATUS_LABEL[statusFilter]}</span>
            <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${statusOpen ? "rotate-180" : ""}`} />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-40">
              {STATUS_OPTIONS.map((st) => (
                <button key={st} type="button"
                  onClick={() => { setStatusFilter(st); setStatusOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[12px] cursor-pointer transition-colors ${st === statusFilter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}
                >
                  {STATUS_LABEL[st]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-180">
          <div className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}>
            {["Webinar", "Host", "Scheduled", "Capacity", "Status"].map((h) => (
              <p key={h} className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                {h}
              </p>
            ))}
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase text-center">
              Action
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-(--gray-400) mx-auto mb-2 animate-spin" />
              <p className="text-[14px] text-(--gray-500)">Loading webinars…</p>
            </div>
          ) : filtered.length === 0 ? (
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
                  className={`opacity-0 grid ${COLS} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors cursor-pointer`}
                  onClick={() => goToDetail(w)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-(--gray-100) flex items-center justify-center">
                      {w.thumbnail ? (
                        <Image src={w.thumbnail} alt={w.title} width={40} height={40} unoptimized className="w-full h-full object-cover" />
                      ) : (
                        <Video className="w-5 h-5 text-(--gray-400)" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate leading-snug">{w.title}</p>
                      <p className="text-[11px] text-(--gray-400)">{w.duration_minutes} min</p>
                    </div>
                  </div>

                  <p className="text-[12px] text-(--gray-600) truncate">
                    {w.host_expert?.full_name ?? "Unassigned"}
                  </p>

                  <div>
                    <p className="text-[12px] font-medium text-(--text-title)">
                      {new Date(w.scheduled_at).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-(--gray-400)">
                      {new Date(w.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <p className="text-[13px] font-semibold text-(--text-title)">
                    {w.max_capacity ?? "Unlimited"}
                  </p>

                  <WebinarStatusBadge status={w.status} />

                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <WebinarActionMenu
                      open={openMenuId === w.id}
                      onToggle={() => setOpenMenuId(openMenuId === w.id ? null : w.id)}
                      setRef={(el) => menuRefs.current.set(w.id, el)}
                      status={w.status}
                      busy={busyId === w.id}
                      onView={() => goToDetail(w)}
                      onArchive={() => handleArchive(w)}
                      onRework={() => handleRework(w)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <AddWebinarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={onRefresh}
      />
    </div>
  );
}
