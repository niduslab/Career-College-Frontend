"use client";

import { useEffect, useState } from "react";
import PartnershipDashboard from "@/components/dashboard/partnership/dashboard";
import PageHeader from "@/components/dashboard/common/page-header";
import { fetchMe } from "@/lib/auth-api";

export default function PartnershipDashboardPage() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    fetchMe().then((user) => setName(user?.full_name ?? null));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={name ? `Welcome back, ${name}.` : "Welcome back."}
        subtitle="Your courses, webinars, and roster at a glance."
      />

      <PartnershipDashboard />
    </div>
  );
}
