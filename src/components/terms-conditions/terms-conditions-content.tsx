"use client";

import { useEffect, useRef } from "react";
import { gsap, prepareGsap } from "@/lib/gsap";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using the Career College platform (&ldquo;Platform&rdquo;), you confirm that you are at least 13 years of age and agree to be bound by these Terms &amp; Conditions (&ldquo;Terms&rdquo;). If you are accessing the Platform on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.

If you do not agree to these Terms, please discontinue use of the Platform immediately.`,
  },
  {
    title: "2. Account Registration",
    content: `To access certain features of the Platform, you must create an account. You agree to:

• Provide accurate, current, and complete information during registration.
• Maintain and promptly update your account information.
• Keep your password confidential and not share it with any third party.
• Notify us immediately at info@niduslab.com if you suspect unauthorised access to your account.
• Accept responsibility for all activities that occur under your account.

Career College reserves the right to suspend or terminate accounts that violate these Terms or that have been inactive for an extended period.`,
  },
  {
    title: "3. Course Enrolment & Access",
    content: `Upon successful payment and enrolment in a course, you are granted a limited, non-exclusive, non-transferable licence to access and view the course content for personal, non-commercial purposes.

• Course access is provided for the duration specified at the time of purchase (typically lifetime access unless stated otherwise).
• You may not share, redistribute, or resell access to any course.
• Career College reserves the right to update, modify, or remove course content at any time to maintain quality and accuracy.
• Certificate issuance is conditional on meeting assessment and attendance requirements as specified within each course.`,
  },
  {
    title: "4. Payments & Refunds",
    content: `All course fees are displayed in USD and are inclusive of applicable taxes where required by law.

• Payments are processed securely via third-party payment providers. By completing a purchase, you authorise Career College to charge the stated amount to your selected payment method.
• **Refund Policy:** You may request a full refund within 7 days of purchase, provided you have not completed more than 20% of the course content. Refund requests should be submitted to info@niduslab.com.
• Career College reserves the right to change pricing at any time. Price changes will not affect previously completed purchases.
• Promotional discounts and coupon codes cannot be applied retroactively to completed purchases.`,
  },
  {
    title: "5. Intellectual Property",
    content: `All content on the Platform — including but not limited to course videos, text, graphics, logos, quizzes, and assessments — is the intellectual property of Career College or its content partners and is protected by applicable copyright, trademark, and intellectual property laws.

You agree not to:

• Copy, reproduce, distribute, or publicly display any course content without prior written permission.
• Modify, create derivative works from, or reverse-engineer any part of the Platform.
• Use any Career College trademarks, logos, or branding without express written consent.

User-generated content (e.g., forum posts, reviews) remains your property, but you grant Career College a worldwide, royalty-free licence to use, display, and distribute such content in connection with the Platform.`,
  },
  {
    title: "6. Prohibited Conduct",
    content: `You agree not to use the Platform to:

• Violate any applicable local, national, or international law or regulation.
• Transmit unsolicited commercial communications (spam).
• Upload or distribute malware, viruses, or any code designed to harm or interfere with the Platform.
• Attempt to gain unauthorised access to any part of the Platform or its infrastructure.
• Harass, abuse, or harm other users or instructors.
• Circumvent or manipulate any enrolment, payment, or access control systems.
• Misrepresent your identity or impersonate any person or entity.

Violations may result in immediate account suspension or termination and, where applicable, referral to law enforcement authorities.`,
  },
  {
    title: "7. Third-Party Services",
    content: `The Platform may integrate with or link to third-party services (e.g., payment processors, video hosting providers, analytics tools). Career College is not responsible for the practices, policies, or content of these third-party services.

Your use of any third-party service is governed by that service's own terms and privacy policy. We encourage you to review those policies before using such services.`,
  },
  {
    title: "8. Disclaimers",
    content: `The Platform and all content are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, either express or implied, including but not limited to:

• Warranties of merchantability or fitness for a particular purpose.
• Guarantees of uninterrupted or error-free access.
• Guarantees regarding the accuracy, completeness, or timeliness of course content.

Career College does not guarantee employment or specific career outcomes as a result of completing any course.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the fullest extent permitted by applicable law, Career College and its officers, directors, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform, including but not limited to loss of profits, data, or goodwill.

In no event shall Career College's total liability to you for all claims arising from these Terms or your use of the Platform exceed the amount you paid to Career College in the twelve (12) months preceding the event giving rise to the claim.`,
  },
  {
    title: "10. Indemnification",
    content: `You agree to indemnify, defend, and hold harmless Career College and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:

• Your access to or use of the Platform.
• Your violation of these Terms.
• Your infringement of any intellectual property or other rights of any third party.`,
  },
  {
    title: "11. Termination",
    content: `Career College reserves the right to suspend or terminate your access to the Platform at any time, with or without notice, for any reason, including but not limited to a breach of these Terms.

Upon termination:

• Your right to access course content will cease immediately (subject to applicable refund provisions).
• Provisions of these Terms that by their nature should survive termination shall remain in effect, including intellectual property rights, disclaimers, and limitations of liability.`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in New York County, New York.`,
  },
  {
    title: "13. Changes to These Terms",
    content: `Career College reserves the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page with a revised &ldquo;Last Updated&rdquo; date. Your continued use of the Platform after any changes constitutes your acceptance of the updated Terms.

We encourage you to review these Terms periodically.`,
  },
  {
    title: "14. Contact Us",
    content: `If you have questions or concerns about these Terms &amp; Conditions, please contact us:

• **Email:** info@niduslab.com
• **Phone:** +1347-400-0135
• **Address:** Crescent Street, Long Island City, NY 11106, United States`,
  },
];

export function TermsConditionsContent() {
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
        "[data-terms-section]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: "[data-terms-section]",
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
            Please read these Terms &amp; Conditions carefully before using the
            Career College platform. These Terms govern your access to and use
            of our website, courses, and related services operated by{" "}
            <span className="font-medium text-(--primary-700)">
              Career College
            </span>
            . By registering an account or enrolling in any course, you
            acknowledge that you have read, understood, and agreed to be bound
            by these Terms.
          </p>
        </div>

        <div className="grid gap-4 lg:gap-5">
          {SECTIONS.map(({ title, content }) => (
            <article
              key={title}
              data-terms-section
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
