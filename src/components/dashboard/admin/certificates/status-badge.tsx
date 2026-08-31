import type { CertificateStatus } from "@/lib/certificates-api";

const STYLE: Record<CertificateStatus, string> = {
  valid: "text-emerald-600 bg-emerald-50",
  revoked: "text-red-500 bg-red-50",
};

const LABEL: Record<CertificateStatus, string> = {
  valid: "Valid",
  revoked: "Revoked",
};

export default function StatusBadge({ status }: { status: CertificateStatus }) {
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STYLE[status]}`}
    >
      {LABEL[status]}
    </span>
  );
}