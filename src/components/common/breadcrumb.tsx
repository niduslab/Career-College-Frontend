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
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-(--gray-200)"
        aria-label="Breadcrumb"
      >
        {items.map((item, idx) => (
          <span key={`${item.label}-${idx}`} className="flex items-center gap-2 whitespace-nowrap">
            {item.href && !item.active ? (
              <a
                href={item.href}
                className="hover:underline font-normal sg-p-default  text-white flex items-center gap-2"
              >
                {idx === 0 && (
                  <House size={16} className="inline-block mr-1 align-middle" />
                )}
                {item.label}
              </a>
            ) : (
              <span
                className={
                  item.active
                    ? "font-semibold sg-p-default text-(--primary-500)"
                    : undefined
                }
              >
                {idx === 0 && (
                  <House size={16} className="inline-block mr-1 align-middle" />
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
      <h1 className="text-[30px] lg:max-w-190  lg:mt-10 mt-6  md:text-[40px] lg:text-[40px] font-semibold text-(--text-white) mb-2 leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="sg-p-default  lg:max-w-160.25 lg:mt-4 mt-3 text-(--gray-200)  mb-2">
          {subtitle}
        </p>
      )}
      {children}
    </>
  );
}
