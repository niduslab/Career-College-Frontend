import { Building2, Gem, Cloud, TrendingUp, Boxes } from "lucide-react";

const INDUSTRY_ITEMS = [
  { label: "company", Icon: Building2 },
  { label: "business", Icon: Gem },
  { label: "application", Icon: Cloud },
  { label: "startup", Icon: TrendingUp },
  { label: "application", Icon: Cloud },
  { label: "venture", Icon: Boxes },
];

export function IndustryStrip() {
  const loopItems = [...INDUSTRY_ITEMS, ...INDUSTRY_ITEMS];

  return (
    <section className="w-full lg:mt-25 mt-10">
      <div className=" px-4 md:px-6 lg:px-8">
        <h2 className=" text-center text-[24px] lg:leading-12 font-semibold tracking-[-0.4px] text-(--text-title) md:text-[40px] lg:text-[40px]">
          Where Leading Industries
          <br />
          Come Together
        </h2>

        <div className="relative mt-10 overflow-hidden md:mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14  md:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14  md:w-24" />

          <div className="industry-marquee">
            {loopItems.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="flex items-center gap-3 text-[#a5abb5]"
              >
                <item.Icon size={30} strokeWidth={2.2} />
                <span className="text-[30px] leading-none font-semibold tracking-[-0.012em]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
