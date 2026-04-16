const primaryScale = [
  ["50", "var(--primary-50)"],
  ["100", "var(--primary-100)"],
  ["200", "var(--primary-200)"],
  ["300", "var(--primary-300)"],
  ["400", "var(--primary-400)"],
  ["500", "var(--primary-500)"],
  ["600", "var(--primary-600)"],
  ["700", "var(--primary-700)"],
  ["800", "var(--primary-800)"],
  ["900", "var(--primary-900)"],
  ["950", "var(--primary-950)"],
] as const;

const grayScale = [
  ["50", "var(--gray-50)"],
  ["100", "var(--gray-100)"],
  ["200", "var(--gray-200)"],
  ["300", "var(--gray-300)"],
  ["400", "var(--gray-400)"],
  ["500", "var(--gray-500)"],
  ["600", "var(--gray-600)"],
  ["700", "var(--gray-700)"],
  ["800", "var(--gray-800)"],
  ["900", "var(--gray-900)"],
  ["950", "var(--gray-950)"],
] as const;

const spacingScale = [
  4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80,
  84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144,
  148, 152,
];

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-12 w-16 rounded-md border"
        style={{ backgroundColor: color, borderColor: "var(--gray-300)" }}
      />
      <p
        className="sg-caption sg-w-m text-center"
        style={{ color: "var(--text-paragraph)" }}
      >
        {label}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main
      className="min-h-screen px-4 py-10 md:px-10"
      style={{ backgroundColor: "#101114" }}
    >
      <div
        className="mx-auto max-w-6xl overflow-hidden rounded-2xl border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--gray-200)",
        }}
      >
        <div
          className="px-6 py-8 text-center md:px-10"
          style={{
            background:
              "linear-gradient(120deg, var(--primary-700) 0%, var(--primary-500) 55%, #22d3ee 120%)",
          }}
        >
          <h1 className="sg-h1-small sg-w-m text-white">Style Guide</h1>
        </div>

        <section className="space-y-8 p-6 md:p-10">
          <div className="space-y-4">
            <h2 className="sg-h5 sg-w-sb">Primary Color</h2>
            <div className="flex flex-wrap gap-4">
              {primaryScale.map(([label, color]) => (
                <Swatch key={label} label={label} color={color} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="sg-h5 sg-w-sb">Gray Color</h2>
            <div className="flex flex-wrap gap-4">
              {grayScale.map(([label, color]) => (
                <Swatch key={label} label={label} color={color} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="sg-h5 sg-w-sb">Semantic Color</h2>
            <div className="flex flex-wrap gap-4">
              <Swatch label="Success" color="var(--success-500)" />
              <Swatch label="Danger" color="var(--danger-500)" />
              <Swatch label="Warning" color="var(--warning-500)" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="sg-h5 sg-w-sb">Text Color</h2>
            <div className="flex flex-wrap gap-4">
              <Swatch label="Title" color="var(--text-title)" />
              <Swatch label="Paragraph" color="var(--text-paragraph)" />
              <Swatch label="Black" color="var(--text-black)" />
              <Swatch label="White" color="var(--text-white)" />
            </div>
          </div>
        </section>

        <section
          className="space-y-4 border-t p-6 md:p-10"
          style={{ borderColor: "var(--gray-200)" }}
        >
          <h2 className="sg-h5 sg-w-sb">Typography</h2>
          <p className="sg-h1-big sg-w-r">H1-Big-72px-R-120%</p>
          <p className="sg-h1-small sg-w-m">H1-Small-56px-M-120%</p>
          <p className="sg-h2 sg-w-sb">H2-48px-S-120%</p>
          <p className="sg-h3 sg-w-b">H3-40px-B-120%</p>
          <p className="sg-h4 sg-w-m">H4-32px-M-120%</p>
          <p className="sg-h5 sg-w-r">H5-24px-R-120%</p>
          <p className="sg-h6 sg-w-sb">H6-20px-S-120%</p>
          <p
            className="sg-p-big sg-w-r"
            style={{ color: "var(--text-paragraph)" }}
          >
            Paragraph-Big-18px-R-150%
          </p>
          <p
            className="sg-p-default sg-w-m"
            style={{ color: "var(--text-paragraph)" }}
          >
            Default-16px-M-150%
          </p>
          <p
            className="sg-p-small sg-w-r"
            style={{ color: "var(--text-paragraph)" }}
          >
            Small-14px-R-150%
          </p>
          <p
            className="sg-caption sg-w-m"
            style={{ color: "var(--text-paragraph)" }}
          >
            Caption-12px-M-150%
          </p>
        </section>

        <section
          className="space-y-4 border-t p-6 md:p-10"
          style={{ borderColor: "var(--gray-200)" }}
        >
          <h2 className="sg-h5 sg-w-sb">Spacing</h2>
          <div className="space-y-2">
            {spacingScale.map((space) => (
              <div key={space} className="flex items-center gap-3">
                <span
                  className="sg-caption w-10"
                  style={{ color: "var(--text-paragraph)" }}
                >
                  {space}
                </span>
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${Math.max(space, 12)}px`,
                    backgroundColor: "#22d3ee",
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
