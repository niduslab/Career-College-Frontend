"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const COMPLETION_DATA = [
  { label: "M1", value: 98 },
  { label: "M2", value: 84 },
  { label: "M3", value: 67 },
  { label: "M4", value: 41 },
  { label: "M5", value: 52 },
];

export default function CompletionFunnel() {
  const W = 560; const H = 160; const PAD_X = 32;
  const innerW = W - PAD_X * 2;

  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  const points = COMPLETION_DATA.map((d, i) => ({
    ...d,
    x: PAD_X + (i / (COMPLETION_DATA.length - 1)) * innerW,
    y: H - (d.value / 100) * H,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  const lineRef = useRef<SVGPathElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    if (lineRef.current) {
      const len = lineRef.current.getTotalLength();
      gsap.fromTo(lineRef.current,
        { strokeDasharray: `0 ${len}` },
        { strokeDasharray: `${len} 0`, duration: 1.2, ease: "power2.out" },
      );
    }
    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, scale: 0, transformOrigin: "center" },
        { opacity: 1, scale: 1, duration: 0.4, delay: 0.8 + i * 0.1, ease: "back.out(2)" },
      );
    });
  }, []);

  return (
    <div className="bg-white border border-(--gray-200) rounded-2xl p-5">
      <h3 className="text-[15px] font-semibold text-(--text-title)">Module Completion Funnel</h3>
      <p className="text-[12px] text-(--gray-500) mt-0.5 mb-4">How students progress through modules</p>
      <div className="relative">
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none bg-(--gray-950) text-white px-3 py-2 rounded-xl shadow-lg whitespace-nowrap"
            style={{ left: `${(tooltip.x / W) * 100}%`, top: tooltip.y - 52, transform: "translateX(-50%)" }}
          >
            <p className="text-[11px] text-gray-400 mb-0.5">{tooltip.label}</p>
            <p className="text-[14px] font-bold">{tooltip.value}% completed</p>
          </div>
        )}
        <svg width="100%" viewBox={`0 0 ${W} ${H + 32}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={() => setTooltip(null)}>
          {[0, 25, 50, 75, 100].map((pct) => (
            <g key={pct}>
              <line x1={0} y1={H - (pct / 100) * H} x2={W} y2={H - (pct / 100) * H} stroke="#f3f4f6" strokeWidth={1} strokeDasharray="4 4" />
              <text x={0} y={H - (pct / 100) * H - 3} fontSize="9" fill="#9ca3af">{pct}%</text>
            </g>
          ))}
          <path d={areaD} fill="#7c3aed" fillOpacity="0.08" />
          <path ref={lineRef} d={pathD} fill="none" stroke="#7c3aed" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={p.label}>
              <circle ref={(el) => { dotRefs.current[i] = el; }}
                cx={p.x} cy={p.y} r={5} fill="white" stroke="#7c3aed" strokeWidth={2.5} opacity={0} />
              <circle cx={p.x} cy={p.y} r={16} fill="transparent" style={{ cursor: "pointer" }}
                onMouseEnter={() => setTooltip({ x: p.x, y: p.y, label: p.label, value: p.value })}
                onMouseLeave={() => setTooltip(null)} />
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="#7c3aed" fontFamily="inherit">{p.value}%</text>
              <text x={p.x} y={H + 18}   textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="inherit">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
