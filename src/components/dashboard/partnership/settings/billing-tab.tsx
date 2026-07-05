"use client";

import { CreditCard } from "lucide-react";
import { SectionCard } from "../../settings-shared/ui";

export function BillingTab() {
  const invoices = [
    {
      id: "INV-2026-006",
      date: "Jun 1, 2026",
      amount: "$99.00",
      status: "Paid",
    },
    {
      id: "INV-2026-005",
      date: "May 1, 2026",
      amount: "$99.00",
      status: "Paid",
    },
    {
      id: "INV-2026-004",
      date: "Apr 1, 2026",
      amount: "$99.00",
      status: "Paid",
    },
    {
      id: "INV-2026-003",
      date: "Mar 1, 2026",
      amount: "$99.00",
      status: "Paid",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Current plan */}
      <SectionCard title="Current Plan">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-semibold text-(--text-title)">
                Partnership Pro
              </p>
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-(--primary-50) text-(--primary-600) border border-(--primary-200)">
                Active
              </span>
            </div>
            <p className="text-[12px] text-(--gray-500) mt-1">
              $99/month · Renews Jul 1, 2026
            </p>
          </div>
          <button
            type="button"
            className="h-9 px-4 rounded-md border border-(--gray-200) text-[12px] lg:text-[14px] font-medium text-(--gray-500) hover:bg-(--gray-50) transition-colors cursor-pointer"
          >
            Change Plan
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {[
            { label: "Partners", value: "Unlimited" },
            { label: "Proposals", value: "Unlimited" },
            { label: "Commission", value: "15%" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-(--gray-50) rounded-xl px-4 py-3 text-center"
            >
              <p className="text-[14px] font-semibold text-(--text-title)">
                {value}
              </p>
              <p className="text-[12px] text-(--gray-500) mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Payment method */}
      <SectionCard title="Payment Method">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded-lg bg-(--gray-100) flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-(--gray-500)" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-(--text-title)">
                Visa ending in 4242
              </p>
              <p className="text-[12px] text-(--gray-400)">Expires 08 / 2028</p>
            </div>
          </div>
          <button
            type="button"
            className="text-[14px] font-medium text-(--primary-600) hover:underline cursor-pointer"
          >
            Update
          </button>
        </div>
      </SectionCard>

      {/* Invoice history */}
      <SectionCard title="Invoice History">
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 px-3 pb-2 border-b border-(--gray-100)">
            {["Invoice", "Date", "Amount", "Action"].map((h) => (
              <p
                key={h}
                className="text-[12px] font-semibold tracking-widest text-(--gray-400) uppercase"
              >
                {h}
              </p>
            ))}
          </div>
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-[1fr_1fr_80px_80px] gap-3 items-center px-3 py-2.5 rounded-xl hover:bg-(--gray-50) transition-colors"
            >
              <p className="text-[14px] md:text-[14px] lg:text-[16px] truncate  font-medium text-(--text-title)">
                {inv.id}
              </p>
              <p className="text-[14px] md:text-[14px] lg:text-[16px] truncate font-normal text-(--gray-500)">
                {inv.date}
              </p>
              <p className="text-[14px] md:text-[14px] lg:text-[16px]   font-semibold text-(--text-title)">
                {inv.amount}
              </p>
              <button
                type="button"
                className="text-[14px] md:text-[14px] lg:text-[16px] font-medium text-(--primary-600) hover:underline cursor-pointer text-left whitespace-nowrap"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

