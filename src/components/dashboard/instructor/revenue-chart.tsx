"use client";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const dataPoints = [4200, 6800, 9500, 13500, 19000, 26000];
const yLabels = [0, 6500, 13000, 19500, 26000];

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const d = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");
  return d;
}

export default function RevenueChart() {
  const W = 560;
  const H = 180;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = 28000;

  const points = dataPoints.map((v, i) => ({
    x: padL + (i / (dataPoints.length - 1)) * chartW,
    y: padT + chartH - (v / maxVal) * chartH,
  }));

  const linePath = buildPath(points);

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;

  return (
    <div className="bg-white rounded-xl border border-(--gray-200) p-5 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-(--text-title)">
          Revenue Growth
        </h3>
        <button className="text-[12px] text-(--gray-500) border border-(--gray-200) rounded-lg px-3 py-1.5 flex items-center gap-1 hover:bg-(--gray-50)">
          Last 6 months
          <svg
            className="w-3 h-3 ml-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c27ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7c27ff" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Y grid lines */}
        {yLabels.map((val) => {
          const y = padT + chartH - (val / maxVal) * chartH;
          return (
            <g key={val}>
              <line
                x1={padL}
                y1={y}
                x2={padL + chartW}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text
                x={padL - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#99a1af"
              >
                {val === 0 ? "0" : `${val / 1000}k`}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#7c27ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="white"
            stroke="#7c27ff"
            strokeWidth="2.5"
          />
        ))}

        {/* X labels */}
        {months.map((m, i) => {
          const x = padL + (i / (months.length - 1)) * chartW;
          return (
            <text
              key={m}
              x={x}
              y={H - 4}
              textAnchor="middle"
              fontSize="10"
              fill="#99a1af"
            >
              {m}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
