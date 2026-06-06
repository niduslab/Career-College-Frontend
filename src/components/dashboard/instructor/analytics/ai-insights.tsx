"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Sparkles } from "lucide-react";

const AI_INSIGHTS = [
  { value: "38%",  desc: "Drop-off occurs at Module 4. Consider adding a check-in quiz." },
  { value: "+24m", desc: "Saturday is your peak watch day. Schedule live session at 5 PM." },
  { value: "92%",  desc: "Sentiment positive on Module 1 — promote it on social." },
];

export default function AiInsights() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out" },
    );
  }, []);

  return (
    <div ref={ref} className="opacity-0 bg-(--gray-950) rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-yellow-400" />
        <p className="text-[11px] font-semibold tracking-widest text-yellow-400 uppercase">AI Insights</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {AI_INSIGHTS.map((ins) => (
          <div key={ins.value} className="space-y-1.5">
            <p className="text-[28px] font-bold leading-none text-yellow-400">{ins.value}</p>
            <p className="text-[12px] text-gray-400 leading-relaxed">{ins.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
