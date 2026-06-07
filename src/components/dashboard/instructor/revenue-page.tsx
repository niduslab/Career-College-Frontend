"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  TrendingUp,
  Download,
  Landmark,
  Wallet,
  CalendarDays,
  CircleDollarSign,
  BadgePercent,
} from "lucide-react";

// Types

type PayoutStatus = "Paid" | "Pending" | "Processing";

interface Payout {
  id: string;
  date: string;
  amount: number;
  method: string;
  last4: string;
  status: PayoutStatus;
}

// Seed Data

const MONTHLY_EARNINGS = [
  { month: "Jan", value: 7200 },
  { month: "Feb", value: 7800 },
  { month: "Mar", value: 9400 },
  { month: "Apr", value: 12600 },
  { month: "May", value: 18900 },
  { month: "Jun", value: 24802 },
];

const PAYOUTS: Payout[] = [
  {
    id: "p1",
    date: "Jun 1, 2026",
    amount: 8420,
    method: "Bank",
    last4: "4421",
    status: "Paid",
  },
  {
    id: "p2",
    date: "May 1, 2026",
    amount: 6210,
    method: "Bank",
    last4: "4421",
    status: "Paid",
  },
  {
    id: "p3",
    date: "Apr 1, 2026",
    amount: 5180,
    method: "Bank",
    last4: "4421",
    status: "Paid",
  },
  {
    id: "p4",
    date: "Jul 1, 2026",
    amount: 10450,
    method: "Bank",
    last4: "4421",
    status: "Pending",
  },
];

// KPI Cards Data

const KPI = [
  {
    label: "Available Balance",
    value: "$10,450.00",
    sub: "Next payout Jul 1",
    trendType: "neutral" as const,
    icon: Wallet,
  },
  {
    label: "Lifetime Earnings",
    value: "$148,920",
    sub: "since 2023",
    trendType: "neutral" as const,
    icon: CircleDollarSign,
  },
  {
    label: "This Month",
    value: "$24,802",
    sub: "+12.5% vs last month",
    trendType: "up" as const,
    icon: CalendarDays,
  },
  {
    label: "Platform Fees",
    value: "$3,720",
    sub: "15% commission this month",
    trendType: "neutral" as const,
    icon: BadgePercent,
  },
];

// SVG Area Chart

const PAD = { top: 24, right: 24, bottom: 40, left: 56 };

function EarningsChart() {
  const W = 900;
  const H = 260;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const maxVal = Math.max(...MONTHLY_EARNINGS.map((d) => d.value));
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const pts = MONTHLY_EARNINGS.map((d, i) => ({
    x: PAD.left + (i / (MONTHLY_EARNINGS.length - 1)) * innerW,
    y: PAD.top + innerH - ((d.value - minVal) / range) * innerH,
    ...d,
  }));

  // Catmull-Rom smooth path
  function smooth(points: { x: number; y: number }[]) {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  const linePath = smooth(pts);
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${PAD.top + innerH} L ${pts[0].x} ${PAD.top + innerH} Z`;

  const yTicks = [0, 6500, 13000, 19500, 26000];

  // Find nearest point on mousemove using SVG coordinates
  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Map screen X to SVG viewBox X
    const scaleX = W / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;
    let closest = 0;
    let minDist = Infinity;
    pts.forEach((pt, i) => {
      const dist = Math.abs(pt.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setHovered(closest);
  }

  const hp = hovered !== null ? pts[hovered] : null;
  // Tooltip box: clamp so it doesn't overflow left/right
  const TT_W = 110;
  const tooltipX = hp
    ? Math.min(Math.max(hp.x - TT_W / 2, PAD.left), PAD.left + innerW - TT_W)
    : 0;
  const tooltipY = hp ? Math.max(hp.y - 52, PAD.top) : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto cursor-crosshair"
      preserveAspectRatio="none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines + Y labels */}
      {yTicks.map((tick) => {
        const y = PAD.top + innerH - ((tick - minVal) / range) * innerH;
        return (
          <g key={tick}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + innerW}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="5 4"
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#9ca3af"
              fontFamily="inherit"
            >
              {tick === 0 ? "0" : `${tick / 1000}k`}
            </text>
          </g>
        );
      })}

      {/* X labels */}
      {pts.map((pt) => (
        <text
          key={pt.month}
          x={pt.x}
          y={H - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#9ca3af"
          fontFamily="inherit"
        >
          {pt.month}
        </text>
      ))}

      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#areaGrad)"
        style={{ animation: "areaFade 1s cubic-bezier(0.4,0,0.2,1) forwards" }}
      />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 1,
          animation: "lineDraw 1s cubic-bezier(0.4,0,0.2,1) forwards",
        }}
      />

      {/* Hover: vertical dashed line */}
      {hp && (
        <line
          x1={hp.x}
          y1={PAD.top}
          x2={hp.x}
          y2={PAD.top + innerH}
          stroke="#7c3aed"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.5"
        />
      )}

      {/* Hover dot */}
      {hp && (
        <circle
          cx={hp.x}
          cy={hp.y}
          r="5"
          fill="white"
          stroke="#7c3aed"
          strokeWidth="2"
        />
      )}

      {/* Static dots hidden when hovering, shown otherwise */}
      {hovered === null &&
        pts.map((pt) => (
          <circle
            key={pt.month}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill="#7c3aed"
            stroke="white"
            strokeWidth="2"
          />
        ))}

      {/* Tooltip box */}
      {hp && (
        <g
          transform={`translate(${
            tooltipX > PAD.left + innerW - TT_W ? tooltipX - TT_W - 8 : tooltipX
          }, ${tooltipY})`}
        >
          <rect x="0" y="0" width={TT_W} height="42" rx="8" fill="#1e1b4b" />
          <text x="10" y="16" fontSize="10" fill="#c4b5fd" fontFamily="inherit">
            {hp.month}
          </text>
          <text
            x="10"
            y="33"
            fontSize="13"
            fontWeight="600"
            fill="white"
            fontFamily="inherit"
          >
            ${hp.value.toLocaleString()}
          </text>
        </g>
      )}

      <style>{`
        @keyframes lineDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes areaFade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </svg>
  );
}

// Status Badge

function StatusBadge({ status }: { status: PayoutStatus }) {
  const styles: Record<PayoutStatus, string> = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex w-15 items-center justify-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// Main Component

export default function RevenuePage() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const [period, setPeriod] = useState<"3M" | "6M" | "1Y">("6M");

  useEffect(() => {
    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.05 + i * 0.08,
          ease: "power2.out",
        },
      );
    });
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out" },
      );
    }
    rowsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          delay: 0.55 + i * 0.07,
          ease: "power2.out",
        },
      );
    });
  }, []);

  function exportCSV() {
    const header = "Date,Amount,Method,Status";
    const rows = PAYOUTS.map(
      (p) =>
        `${p.date},$${p.amount.toLocaleString()},${p.method} ****${p.last4},${p.status}`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payout-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="opacity-0 bg-white border border-(--gray-200) rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                    {k.label}
                  </p>
                  <p className="text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                    {k.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[6px_4px_6px_6px] bg-(--primary-50) flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-(--primary-600)" />
                </div>
              </div>
              <div className="border border-dashed border-(--gray-200)" />
              <p
                className={`text-[12px] font-medium flex items-center gap-1 ${k.trendType === "up" ? "text-(--success-500)" : "text-(--gray-500)"}`}
              >
                {k.trendType === "up" && (
                  <TrendingUp className="w-4 h-4 shrink-0" />
                )}
                {k.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Earnings Trend Chart ── */}
      <div
        ref={chartRef}
        className="opacity-0 bg-white border border-(--gray-200) rounded-2xl px-5 py-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-(--primary-700)" />
            <p className="text-[16px] font-semibold text-(--text-title)">
              Earnings Trend
            </p>
          </div>
          <div className="flex gap-1">
            {(["3M", "6M", "1Y"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`h-7 px-3 text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${
                  period === p
                    ? "bg-(--primary-700) text-white"
                    : "text-(--gray-500) hover:bg-(--gray-100)"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <EarningsChart />
      </div>

      {/* ── Payout History Table ── */}
      <div className="bg-white border border-(--gray-200) rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[16px] font-semibold text-(--text-title)">
            Payout History
          </p>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium text-(--primary-700) border border-(--primary-200) rounded-lg hover:bg-(--primary-50) transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Scrollable on mobile */}
        <div className="overflow-x-auto -mx-5 px-5">
          <div className="min-w-160">
            {/* Table header */}
            <div className="grid grid-cols-[minmax(120px,1fr)_minmax(100px,1fr)_minmax(160px,1fr)_100px_80px] gap-4 px-3 pb-2 border-b border-(--gray-100)">
              {(["DATE", "AMOUNT", "METHOD", "STATUS", ""] as const).map(
                (h, i) => (
                  <p
                    key={h || i}
                    className={`text-[10px] font-semibold tracking-widest text-(--gray-400) uppercase ${i === 3 ? "text-center" : ""}`}
                  >
                    {h}
                  </p>
                ),
              )}
            </div>

            {/* Rows */}
            <div className="divide-y divide-(--gray-100)">
              {PAYOUTS.map((p, i) => (
                <div
                  key={p.id}
                  ref={(el) => {
                    rowsRef.current[i] = el;
                  }}
                  className="opacity-0 grid grid-cols-[minmax(120px,1fr)_minmax(100px,1fr)_minmax(160px,1fr)_100px_80px] gap-4 items-center px-3 py-4"
                >
                  <p
                    className={`text-[13px] font-medium ${p.status === "Pending" ? "text-(--primary-700)" : "text-(--gray-500)"}`}
                  >
                    {p.date}
                  </p>
                  <p className="text-[14px] font-bold text-(--text-title)">
                    ${p.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-(--gray-400) shrink-0" />
                    <span className="text-[13px] text-(--gray-600)">
                      {p.method} &bull;&bull;&bull;&bull;{p.last4}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <StatusBadge status={p.status} />
                  </div>
                  <button className="text-[13px] text-(--gray-400) hover:text-(--primary-700) transition-colors cursor-pointer text-right">
                    Receipt
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
