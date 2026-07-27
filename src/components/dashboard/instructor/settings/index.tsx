"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { ProfileTab } from "./profile-tab";
import { AccountTab } from "./account-tab";
import { NotificationsTab } from "./notifications-tab";
import { BillingTab } from "./billing-tab";
import { VerificationTab } from "./verification-tab";

type Tab = "profile" | "account" | "verification" | "notifications" | "billing";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & Security", icon: Shield },
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
];

function isTab(value: string | null): value is Tab {
  return TABS.some((t) => t.id === value);
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    isTab(initialTab) ? initialTab : "profile",
  );

  const ActiveContent = {
    profile: ProfileTab,
    account: AccountTab,
    verification: VerificationTab,
    notifications: NotificationsTab,
    billing: BillingTab,
  }[activeTab];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="sticky top-14 lg:top-16 z-10 bg-white border border-(--gray-200) rounded-lg px-4 py-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }, i) => {
            const active = activeTab === id;
            return (
              <React.Fragment key={id}>
                {i > 0 && (
                  <ChevronRight className="w-4 h-4 text-(--gray-500) shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-normal transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-(--primary-600) text-white"
                      : "text-(--gray-500) hover:text-(--text-title)"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-(--gray-400)"}`}
                  />
                  {label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <ActiveContent />
    </div>
  );
}
