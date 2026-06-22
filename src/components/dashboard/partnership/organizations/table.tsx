"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Search, ChevronDown, Building2, MapPin } from "lucide-react";
import { ORGANIZATIONS, INDUSTRIES, STATUSES } from "./data";
import { OrgStatus, OrgIndustry } from "./types";
import OrgStatusBadge from "./status-badge";
import OrgActionMenu from "./action-menu";

const COLS = "grid-cols-[2fr_1fr_1fr_80px_120px_40px]";

export default function OrganizationsTable() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState<"All" | OrgIndustry>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | OrgStatus>("All");
  const [industryOpen, setIndustryOpen] = useState(false);
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
  }, [search, industryFilter, statusFilter]);

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

  const filtered = ORGANIZATIONS.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.contact.toLowerCase().includes(search.toLowerCase()) ||
      o.country.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industryFilter === "All" || o.industry === industryFilter;
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchIndustry && matchStatus;
  });

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4 space-y-4">
      <p className="text-[14px] lg:text-[16px] font-medium text-(--text-title)">
        All Organizations
        <span className="ml-2 text-[12px] font-normal text-(--gray-500)">({filtered.length})</span>
      </p>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:flex-1 lg:flex-none lg:w-75">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-500)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, contact or country..."
            className="w-full h-10 pl-9 pr-4 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-500) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
          />
        </div>

        <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:ml-auto">
          {/* Industry filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setIndustryOpen((v) => !v); setStatusOpen(false); }}
              className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <Building2 className="w-4 h-4 text-(--gray-500) shrink-0" />
              <span className="flex-1 text-left truncate">
                {industryFilter === "All" ? "All Industries" : industryFilter}
              </span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform shrink-0 ${industryOpen ? "rotate-180" : ""}`} />
            </button>
            {industryOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-44">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => { setIndustryFilter(ind); setIndustryOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                      ind === industryFilter
                        ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                        : "text-(--gray-600) hover:bg-(--gray-50)"
                    }`}
                  >
                    {ind === "All" ? "All Industries" : ind}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setStatusOpen((v) => !v); setIndustryOpen(false); }}
              className="flex items-center gap-2 w-full h-10 px-3 border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
            >
              <span className="flex-1 text-left">{statusFilter}</span>
              <ChevronDown className={`w-4 h-4 text-(--gray-500) transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1 min-w-32">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => { setStatusFilter(st); setStatusOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[12px] cursor-pointer transition-colors ${
                      st === statusFilter
                        ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                        : "text-(--gray-600) hover:bg-(--gray-50)"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-160">
          {/* Header */}
          <div className={`grid ${COLS} px-3 pb-2 border-b border-(--gray-100)`}>
            {["Organization", "Industry", "Country", "Partners", "Status"].map((h) => (
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
              <Building2 className="w-8 h-8 text-(--gray-300) mx-auto mb-2" />
              <p className="text-[14px] text-(--gray-500)">No organizations match your filters.</p>
            </div>
          ) : (
            <div className="space-y-1 pt-1">
              {filtered.map((org, i) => (
                <div
                  key={org.id}
                  ref={(el) => { rowsRef.current[i] = el; }}
                  className={`opacity-0 grid ${COLS} items-center px-3 py-3 rounded-xl hover:bg-(--gray-50) transition-colors`}
                >
                  {/* Organization */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-(--text-title) truncate">{org.name}</p>
                      <p className="text-[12px] text-(--gray-500) truncate">{org.email}</p>
                    </div>
                  </div>

                  {/* Industry */}
                  <p className="text-[12px] text-(--gray-600) truncate">{org.industry}</p>

                  {/* Country */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3 h-3 text-(--gray-400) shrink-0" />
                    <p className="text-[12px] text-(--gray-600) truncate">{org.country}</p>
                  </div>

                  {/* Active Partners */}
                  <p className="text-[13px] font-semibold text-(--text-title)">{org.activePartners}</p>

                  {/* Status */}
                  <OrgStatusBadge status={org.status} />

                  {/* Action */}
                  <div className="flex justify-center">
                    <OrgActionMenu
                      open={openMenuId === org.id}
                      onToggle={() => setOpenMenuId(openMenuId === org.id ? null : org.id)}
                      setRef={(el) => menuRefs.current.set(org.id, el)}
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
