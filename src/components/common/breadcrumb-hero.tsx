import { Breadcrumb } from "@/components/common/breadcrumb";
import React from "react";

interface BreadcrumbHeroProps {
  title: string;
  subtitle?: string;
  items: Array<{ label: string; href?: string; active?: boolean }>;
  children?: React.ReactNode;
  overflow?: "hidden" | "visible";
  cardSlot?: React.ReactNode;
}

export function BreadcrumbHero({
  title,
  subtitle,
  items,
  children,
  overflow = "hidden",
  cardSlot,
}: BreadcrumbHeroProps) {
  return (
    <div className={`relative bg-(--gray-950) overflow-${overflow}`}>
      {/* Gradient blob clipped independently so overflow-visible pages don't bleed it */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute right-0 top-0"
          style={{
            width: "791px",
            height: "403px",
            transform: "translateX(50%)",
            borderRadius: "791px",
            background: "#4508A9",
            filter: "blur(275px)",
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10 md:py-12 lg:py-16 relative z-10">
        <div className="lg:pr-96">
          <Breadcrumb title={title} subtitle={subtitle} items={items}>
            {children}
          </Breadcrumb>
        </div>
        {cardSlot}
      </div>
    </div>
  );
}
