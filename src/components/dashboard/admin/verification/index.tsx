"use client";

import { useState } from "react";
import { GraduationCap, Building2 } from "lucide-react";
import IdentityVerificationTable from "./identity-table";
import InstitutionVerificationTable from "./institution-table";

type Tab = "instructor" | "institution";

export default function AdminVerificationContent() {
  const [tab, setTab] = useState<Tab>("instructor");

  return (
    <div className="space-y-4">
      <div className="bg-white border border-(--gray-200) rounded-lg px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab("instructor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-normal transition-colors cursor-pointer whitespace-nowrap ${
              tab === "instructor"
                ? "bg-(--primary-600) text-white"
                : "text-(--gray-500) hover:text-(--text-title)"
            }`}
          >
            <GraduationCap className={`w-4 h-4 shrink-0 ${tab === "instructor" ? "text-white" : "text-(--gray-400)"}`} />
            Instructor Identity
          </button>
          <button
            onClick={() => setTab("institution")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-normal transition-colors cursor-pointer whitespace-nowrap ${
              tab === "institution"
                ? "bg-(--primary-600) text-white"
                : "text-(--gray-500) hover:text-(--text-title)"
            }`}
          >
            <Building2 className={`w-4 h-4 shrink-0 ${tab === "institution" ? "text-white" : "text-(--gray-400)"}`} />
            Partner Institution
          </button>
        </div>
      </div>

      {tab === "instructor" ? <IdentityVerificationTable /> : <InstitutionVerificationTable />}
    </div>
  );
}
