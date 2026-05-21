"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { gsap, prepareGsap } from "@/lib/gsap";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email Us",
    value: "info@niduslab.com",
    href: "mailto:info@niduslab.com",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+1347-400-0135",
    href: "tel:+13474000135",
  },
  {
    icon: MapPin,
    label: "Our Office",
    value: "Crescent Street, Long Island City, NY -11106",
    href: "https://www.google.com/maps/place/Crescent+Street,+Long+Island+City,+NY+-11106/@40.7459055,-73.9487923,17z/data=!3m1!4b1!4m5!3m4!1s0x89c259af18e7a9f:0x2c8d9b8e7a6c8b2!8m2!3d40.7459055!4d-73.9466036",
  },
];

export function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    prepareGsap();

    const ctx = gsap.context(() => {
      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: leftRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      if (rightRef.current) {
        gsap.fromTo(
          rightRef.current,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.85,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: rightRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      gsap.fromTo(
        "[data-contact-info-card]",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: "[data-contact-info-card]",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      ref={sectionRef}
      className="w-full py-12 bg-(--gray-50) md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-310 px-4 md:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:items-start">
          {/* Left — info */}
          <div ref={leftRef}>
            <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-(--text-title) md:text-[36px] lg:text-[40px]">
              We&apos;d Love to
              <br />
              Hear From You
            </h2>

            <p className="mt-5 max-w-110 sg-p-default text-(--text-paragraph)">
              Have a question, feedback, or just want to say hello? Fill in the
              form and our team will get back to you within 24 hours.
            </p>

            <div className="mt-8 grid gap-4 md:mt-10 lg:gap-5">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  data-contact-info-card
                  className="group flex items-start gap-4 rounded-2xl border border-(--gray-200) bg-(--text-white) p-5 transition-shadow duration-300 hover:shadow-[0_12px_24px_rgba(16,24,40,0.10)]"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--primary-50) text-(--primary-700)">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="sg-p-small font-semibold text-(--text-title)">
                      {label}
                    </p>
                    <p className="mt-0.5 sg-p-small font-normal text-(--text-paragraph) group-hover:text-(--primary-700) transition-colors duration-200">
                      {value}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div
            ref={rightRef}
            className="rounded-2xl border border-(--gray-200) bg-(--text-white) p-6 md:p-8 lg:p-10"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-50) text-(--primary-700) mb-5">
                  <Mail size={32} strokeWidth={1.8} />
                </span>
                <h3 className="sg-h5 font-semibold text-(--text-title)">
                  Message Sent!
                </h3>
                <p className="mt-3 max-w-80 sg-p-default text-(--text-paragraph)">
                  Thank you for reaching out. We&apos;ll get back to you within
                  24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
                <h3 className="sg-h5 font-semibold text-(--text-title)">
                  Send a Message
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="sg-p-small font-medium text-(--text-title)"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Al Amin"
                      value={form.name}
                      onChange={handleChange}
                      className="h-11 rounded-lg border border-(--gray-200) bg-(--gray-50) px-4 sg-p-small text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-700) transition-colors duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="sg-p-small font-medium text-(--text-title)"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="info@niduslab.com"
                      value={form.email}
                      onChange={handleChange}
                      className="h-11 rounded-lg border border-(--gray-200) bg-(--gray-50) px-4 sg-p-small text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-700) transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="subject"
                    className="sg-p-small font-medium text-(--text-title)"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="How can we help you?"
                    value={form.subject}
                    onChange={handleChange}
                    className="h-11 rounded-lg border border-(--gray-200) bg-(--gray-50) px-4 sg-p-small text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-700) transition-colors duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="sg-p-small font-medium text-(--text-title)"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={handleChange}
                    className="resize-none rounded-lg border border-(--gray-200) bg-(--gray-50) px-4 py-3 sg-p-small text-(--text-title) placeholder:text-(--gray-400) outline-none focus:border-(--primary-700) transition-colors duration-200"
                  />
                </div>

                <button
                  type="submit"
                  className="cursor-pointer inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-(--primary-700) sg-p-default font-semibold text-(--text-white) transition-all duration-300 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
                >
                  Send Message
                  <ArrowRight
                    size={20}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
