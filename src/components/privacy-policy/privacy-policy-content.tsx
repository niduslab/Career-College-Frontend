"use client";

import { useEffect, useRef } from "react";
import { gsap, prepareGsap } from "@/lib/gsap";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us when you register for an account, enroll in a course, make a purchase, or contact us for support. This includes:

• **Personal identifiers** – name, email address, phone number, and billing address.
• **Account credentials** – username and encrypted password.
• **Payment information** – processed securely via third-party payment providers; we do not store full card details.
• **Usage data** – pages visited, courses viewed, lesson progress, quiz results, and time spent on the platform.
• **Device and technical data** – IP address, browser type, operating system, and referring URLs collected automatically via cookies and similar technologies.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `Career College uses the information we collect to:

• Provide, operate, and improve our platform and course offerings.
• Process transactions and send related information, including purchase confirmations and invoices.
• Send administrative messages, updates, security alerts, and support notifications.
• Personalise your learning experience and recommend relevant courses.
• Analyse usage patterns to improve platform performance and content quality.
• Comply with legal obligations and enforce our Terms & Conditions.`,
  },
  {
    title: "3. Sharing of Information",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share information with:

• **Service providers** – trusted vendors who assist us in operating the platform (e.g., payment processors, email services, cloud hosting), bound by confidentiality agreements.
• **Instructors** – limited enrolment data (e.g., number of students) shared with course instructors; no personally identifiable information is shared without consent.
• **Legal authorities** – when required by law, regulation, or valid legal process.
• **Business transfers** – in connection with a merger, acquisition, or sale of assets, where your information may be transferred as a business asset.`,
  },
  {
    title: "4. Cookies & Tracking Technologies",
    content: `We use cookies and similar technologies to enhance your experience. Types of cookies we use:

• **Essential cookies** – required for the platform to function (e.g., session management, authentication).
• **Analytics cookies** – help us understand how learners interact with our platform (e.g., Google Analytics).
• **Preference cookies** – remember your settings such as language and display preferences.

You can control cookie settings through your browser. Disabling certain cookies may affect platform functionality.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide services. Specifically:

• Account data is retained for the duration of your account and up to 2 years after closure.
• Transaction records are retained for 7 years to comply with financial regulations.
• Course progress and certificates are retained indefinitely to allow you to access your credentials.

You may request deletion of your data at any time (subject to legal retention requirements) by contacting us at info@niduslab.com.`,
  },
  {
    title: "6. Data Security",
    content: `We implement industry-standard technical and organisational measures to protect your personal information, including:

• TLS/SSL encryption for all data transmitted between your browser and our servers.
• Encrypted storage of sensitive data including passwords (bcrypt hashing).
• Regular security audits and vulnerability assessments.
• Access controls limiting employee access to personal data on a need-to-know basis.

While we strive to protect your data, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password for your account.`,
  },
  {
    title: "7. Your Rights",
    content: `Depending on your location, you may have the following rights regarding your personal data:

• **Access** – request a copy of the personal data we hold about you.
• **Correction** – request correction of inaccurate or incomplete data.
• **Deletion** – request erasure of your personal data ("right to be forgotten").
• **Portability** – receive your data in a structured, machine-readable format.
• **Objection** – object to processing of your data for direct marketing purposes.
• **Withdrawal of consent** – withdraw consent at any time where processing is based on consent.

To exercise any of these rights, please contact us at info@niduslab.com.`,
  },
  {
    title: "8. Children's Privacy",
    content: `Career College is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected such information, we will take steps to delete it promptly. Parents or guardians who believe their child has provided us with personal information should contact us immediately.`,
  },
  {
    title: "9. Third-Party Links",
    content: `Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third parties. We encourage you to review the privacy policies of any third-party sites you visit.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on this page with a revised "Last Updated" date. Your continued use of the platform after any changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "11. Contact Us",
    content: `If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact us:

• **Email:** info@niduslab.com
• **Phone:** +1347-400-0135
• **Address:** Crescent Street, Long Island City, NY 11106, United States`,
  },
];

export function PrivacyPolicyContent() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    prepareGsap();

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      gsap.fromTo(
        "[data-policy-section]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: "[data-policy-section]",
            start: "top 78%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-(--gray-50) py-12 md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <div
          ref={headingRef}
          className="rounded-2xl border border-(--gray-200) bg-(--text-white) p-6 md:p-8 lg:p-10 mb-6 lg:mb-8"
        >
          <p className="sg-p-small text-(--text-paragraph)">
            <span className="font-semibold text-(--text-title)">
              Last Updated:
            </span>{" "}
            May 21, 2026
          </p>
          <p className="mt-3 sg-p-default text-(--text-paragraph)">
            Career College (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
            &ldquo;us&rdquo;) is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, share, and safeguard
            your personal information when you use our platform at{" "}
            <span className="font-medium text-(--primary-700)">
              careercollege.com
            </span>{" "}
            and related services. By using our platform, you agree to the
            collection and use of information in accordance with this policy.
          </p>
        </div>

        <div className="grid gap-4 lg:gap-5">
          {SECTIONS.map(({ title, content }) => (
            <article
              key={title}
              data-policy-section
              className="rounded-2xl border border-(--gray-200) bg-(--text-white) p-6 md:p-8 lg:p-10"
            >
              <h2 className="text-[18px] font-semibold leading-[1.2] tracking-[-0.015em] text-(--text-title) md:text-[20px] lg:text-[22px]">
                {title}
              </h2>
              <div className="mt-4 space-y-2">
                {content.split("\n").map((line, i) => {
                  if (line.trim() === "") return null;
                  const isBullet = line.trim().startsWith("•");
                  const formatted = line
                    .trim()
                    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                  return (
                    <p
                      key={i}
                      className={`sg-p-small lg:sg-p-default font-normal text-(--text-paragraph) ${isBullet ? "pl-4" : ""}`}
                      dangerouslySetInnerHTML={{ __html: formatted }}
                    />
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
