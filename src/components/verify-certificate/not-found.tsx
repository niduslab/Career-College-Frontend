"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchX, Search } from "lucide-react";

/** Shown when no certificate matches the identifier. Offers a retry box so a
 *  mistyped credential is one correction away, not a dead end. */
export function CertificateNotFound({ identifier }: { identifier: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = value.trim();
    if (next) router.push(`/verify/${encodeURIComponent(next)}`);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-(--gray-100) flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-6 h-6 text-(--gray-400)" />
      </div>
      <h1 className="text-[20px] md:text-[24px] font-semibold text-(--text-title)">
        Certificate not found
      </h1>
      <p className="text-[14px] text-(--gray-500) mt-2">
        No certificate matches{" "}
        <span className="font-mono text-(--text-title)">{identifier}</span>.
        Check the ID printed on the certificate and try again.
      </p>

      <form onSubmit={submit} className="flex gap-2 mt-6">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="CC-2026-NEXTJS-000123"
          className="flex-1 h-12 px-3 text-[14px] border border-(--gray-200) rounded-lg bg-white outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 h-12 px-5 rounded-lg bg-(--primary-700) hover:bg-(--primary-900) text-white text-[14px] font-medium transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Verify
        </button>
      </form>
    </div>
  );
}
