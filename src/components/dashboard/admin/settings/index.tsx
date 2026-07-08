"use client";

import React, { useState } from "react";
import { User, Shield, Bell, Settings2, ChevronRight } from "lucide-react";
import { ProfileTab } from "./profile-tab";
import { AccountTab } from "./account-tab";
import { NotificationsTab } from "./notifications-tab";
import { PlatformTab } from "./platform-tab";

type Tab = "profile" | "account" | "notifications" | "platform";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "platform", label: "Platform", icon: Settings2 },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const ActiveContent = {
    profile: ProfileTab,
    account: AccountTab,
    notifications: NotificationsTab,
    platform: PlatformTab,
  }[activeTab];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="bg-white border border-(--gray-200) rounded-lg px-4 py-3">
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
