"use client";

import { useState } from "react";
import PayoutsStatsCards from "./stats-cards";
import PayoutsTable from "./payouts-table";
import PayoutAccountsTable from "./payout-accounts-table";

const TABS = ["Payouts", "Payout Accounts"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPayoutsContent() {
  const [tab, setTab] = useState<Tab>("Payouts");

  return (
    <div className="space-y-5">
      <PayoutsStatsCards />

      <div className="inline-flex p-1 rounded-full bg-white border border-(--gray-200)">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
              tab === t
                ? "bg-(--primary-600) text-white shadow-sm"
                : "text-(--gray-500) hover:bg-(--gray-100)"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Payouts" ? <PayoutsTable /> : <PayoutAccountsTable />}
    </div>
  );
}
