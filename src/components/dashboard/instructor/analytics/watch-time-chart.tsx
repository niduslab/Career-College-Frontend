"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";

const WATCH_TIME_DATA = {
  "7 days":  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], values: [1100,1750,1600,2350,2900,3200,2500] },
  "30 days": { labels: ["W1","W2","W3","W4"],                      values: [8200,9800,11200,14500] },
  "6 months":{ labels: ["Jan","Feb","Mar","Apr","May","Jun"],       values: [28000,34000,41000,52000,47000,61000] },
};
type WatchFilter = keyof typeof WATCH_TIME_DATA;

export default function WatchTimeChart() {
  const [filter, setFilter] = useState<WatchFilter>("7 days");
  const [open, setOpen]     = useState(false);
  const barsRef = useRef<(SVGRectElement | null)[]>([]);
  const { labels, values } = WATCH_TIME_DATA[filter];
  const max  = Math.max(...values);
  const H    = 160;
  const W    = 480;
  const gap  = W / labels.length;
  const barW = Math.min(40, gap - 12);

  useEffect(() => {
    barsRef.current.forEach((el, i) => {
      if (!el) return;
      const targetH = (values[i] / max) * H;
      gsap.fromTo(el,
        { attr: { height: 0, y: H } },
        { attr: { height: targetH, y: H - targetH }, duration: 0.7, delay: i * 0.07, ease: "power3.out" },
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5 flex-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-(--text-title)">Watch Time</h3>
          <p className="text-[12px] text-(--gray-500) mt-0.5">Total hours watched</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[12px] text-(--gray-500) border border-(--gray-200) rounded-lg px-3 py-1.5 hover:bg-(--gray-50) transition-colors cursor-pointer"
          >
            {filter}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-10 py-1 min-w-28">
              {(Object.keys(WATCH_TIME_DATA) as WatchFilter[]).map((f) => (
                <button key={f} onClick={() => { setFilter(f); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-[12px] cursor-pointer transition-colors ${f === filter ? "bg-(--primary-50) text-(--primary-600) font-semibold" : "text-(--gray-600) hover:bg-(--gray-50)"}`}>
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 28}`} preserveAspectRatio="xMidYMid meet">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={0} y1={H - t * H} x2={W} y2={H - t * H} stroke="#f3f4f6" strokeWidth={1} />
            <text x={0} y={H - t * H - 3} fontSize="9" fill="#9ca3af">{Math.round(t * max).toLocaleString()}</text>
          </g>
        ))}
        {labels.map((label, i) => {
          const x = i * gap + (gap - barW) / 2;
          return (
            <g key={`${filter}-${i}`}>
              <rect ref={(el) => { barsRef.current[i] = el; }}
                x={x} y={H} width={barW} height={0} rx={6} fill="#7c3aed" opacity="0.85" />
              <text x={x + barW / 2} y={H + 18} textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="inherit">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
