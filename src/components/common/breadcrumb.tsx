import { ChevronRight, House } from "lucide-react";
import React from "react";

interface BreadcrumbProps {
  title: string;
  subtitle?: string;
  items: Array<{ label: string; href?: string; active?: boolean }>;
  children?: React.ReactNode;
}

export function Breadcrumb({
  title,
  subtitle,
  items,
  children,
}: BreadcrumbProps) {
  return (
    <>
      {/* Breadcrumb */}
      <nav
        className="mb-6 flex items-center gap-2 text-sm text-(--gray-200)"
        aria-label="Breadcrumb"
      >
        {items.map((item, idx) => (
          <span key={item.label} className="flex items-center gap-2">
            {item.href && !item.active ? (
              <a
                href={item.href}
                className="hover:underline text-(--gray-200) flex items-center gap-1"
              >
                {idx === 0 && (
                  <House
                    size={16}
                    className="inline-block mr-1 align-middle"
                  />
                )}
                {item.label}
              </a>
            ) : (
              <span
                className={
                  item.active
                    ? "font-semibold text-(--primary-200)"
                    : undefined
                }
              >
                {idx === 0 && (
                  <House
                    size={16}
                    className="inline-block mr-1 align-middle"
                  />
                )}
                {item.label}
              </span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-1">
                <ChevronRight size={14} />
              </span>
            )}
          </span>
        ))}
      </nav>
      {/* Title & Subtitle */}
      <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-(--text-white) mb-2 leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-(--gray-200) max-w-xl mb-2">
          {subtitle}
        </p>
      )}
      {children}
    </>
  );
}
