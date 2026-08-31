import type { Metadata } from "next";
import { BreadcrumbHero } from "@/components/common/breadcrumb-hero";
import { VerifyCertificate } from "@/components/verify-certificate";
import { CertificateNotFound } from "@/components/verify-certificate/not-found";
import { verifyCertificate } from "@/lib/certificates-api";
import { ApiError } from "@/lib/api";

export const metadata: Metadata = {
  title: "Verify Certificate | Career College",
  description: "Verify the authenticity of a Career College certificate.",
};

/**
 * Public certificate verification. No auth — anyone holding the printed
 * credential ID (or the UUID) can check it.
 *
 * An unknown identifier renders an in-page "not found" rather than Next's
 * notFound(), so a mistyped ID gets an explanation and a retry box instead of a
 * bare 404 screen. A *revoked* certificate is not an error — it resolves
 * normally and the component shows the revoked verdict.
 */
export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;

  let certificate;
  try {
    certificate = await verifyCertificate(identifier);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return (
        <div className="min-h-screen">
          <BreadcrumbHero
            title="Verify Certificate"
            items={[
              { label: "Home", href: "/" },
              { label: "Verify Certificate", active: true },
            ]}
          />
          <CertificateNotFound identifier={identifier} />
        </div>
      );
    }
    throw err;
  }

  return (
    <div className="min-h-screen">
      <BreadcrumbHero
        title="Verify Certificate"
        subtitle={certificate.certificate_id}
        items={[
          { label: "Home", href: "/" },
          { label: "Verify Certificate", active: true },
        ]}
      />
      <VerifyCertificate cert={certificate} />
    </div>
  );
}
