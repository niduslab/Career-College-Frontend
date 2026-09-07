"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { User, Shield, Bell, ShieldCheck, Wallet } from "lucide-react";
import { ProfileTab } from "./profile-tab";
import { AccountTab } from "./account-tab";
import { NotificationsTab } from "./notifications-tab";
import { VerificationTab } from "./verification-tab";
import { PayoutTab } from "../../settings-shared/payout-tab";

type Tab = "profile" | "account" | "verification" | "payout" | "notifications";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & Security", icon: Shield },
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "payout", label: "Payout", icon: Wallet },
  { id: "notifications", label: "Notifications", icon: Bell },
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
    payout: PayoutTab,
    notifications: NotificationsTab,
  }[activeTab];

  return (
    <div className="space-y-5">
      {/* Tab bar — flat, independently-navigable sections (not a wizard),
          so tabs sit side by side with no sequence arrows between them. */}
      <div className="sticky top-14 lg:top-16 z-10 bg-white border border-(--gray-200) rounded-lg px-2 py-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-linear-to-br from-(--primary-500) to-(--primary-600) text-white shadow-sm"
                    : "text-(--gray-500) hover:bg-(--gray-50) hover:text-(--text-title)"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-(--gray-400)"}`}
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <ActiveContent />
    </div>
  );
}
