"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const TRAFFIC_DATA = [
  { source: "Direct",   pct: 42, color: "#7c3aed" },
  { source: "Search",   pct: 28, color: "#22c55e" },
  { source: "Referral", pct: 18, color: "#3b82f6" },
  { source: "Social",   pct: 12, color: "#f59e0b" },
];

const R = 60; const CX = 90; const CY = 80;
const SLICES = (() => {
  const total = TRAFFIC_DATA.reduce((s, d) => s + d.pct, 0);
  let cum = 0;
  return TRAFFIC_DATA.map((d) => {
    const start = (cum / total) * 360;
    cum += d.pct;
    const end  = (cum / total) * 360;
    const sRad = ((start - 90) * Math.PI) / 180;
    const eRad = ((end   - 90) * Math.PI) / 180;
    const x1 = CX + R * Math.cos(sRad); const y1 = CY + R * Math.sin(sRad);
    const x2 = CX + R * Math.cos(eRad); const y2 = CY + R * Math.sin(eRad);
    return { ...d, path: `M ${x1} ${y1} A ${R} ${R} 0 ${end - start > 180 ? 1 : 0} 1 ${x2} ${y2}` };
  });
})();

export default function TrafficDonut() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    pathRefs.current.forEach((el, i) => {
      if (!el) return;
      const len = el.getTotalLength();
      gsap.fromTo(el,
        { strokeDasharray: `0 ${len}` },
        { strokeDasharray: `${len} 0`, duration: 0.8, delay: i * 0.15, ease: "power2.out" },
      );
    });
  }, []);

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5 w-full xl:w-72 shrink-0">
      <h3 className="text-[15px] font-semibold text-(--text-title)">Traffic Sources</h3>
      <p className="text-[12px] text-(--gray-500) mt-0.5 mb-4">Where students come from</p>
      <div className="flex items-center gap-4">
        <svg width="180" height="160" viewBox="0 0 180 160">
          {SLICES.map((s, i) => (
            <path key={s.source} ref={(el) => { pathRefs.current[i] = el; }}
              d={s.path} fill="none" stroke={s.color} strokeWidth={22} strokeLinecap="butt" />
          ))}
          <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="11" fill="#6b7280" fontFamily="inherit">Total</text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize="16" fontWeight="700" fill="#111827" fontFamily="inherit">100%</text>
        </svg>
        <div className="space-y-2.5 flex-1">
          {TRAFFIC_DATA.map((d) => (
            <div key={d.source} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[12px] text-(--gray-600)">{d.source}</span>
              </div>
              <span className="text-[13px] font-semibold text-(--text-title)">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
