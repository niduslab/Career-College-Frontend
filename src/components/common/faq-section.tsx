"use client";

import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "How to create a user?",
    answer:
      "Create an account using your email and phone number, then verify your profile to start exploring courses.",
  },
  {
    question: "Do you provide job placement support?",
    answer:
      "Yes, we offer career guidance, CV building support, and access to job opportunities to help you start your career.",
  },
  {
    question: "How long do I have access to a course?",
    answer:
      "Most paid programs include long-term access, so you can revisit lessons anytime at your own pace.",
  },
  {
    question: "Do you provide job placement support?",
    answer:
      "Our placement team regularly shares openings and interview guidance for eligible learners.",
  },
  {
    question: "Will I receive a certificate after completing a course?",
    answer:
      "Yes, course completion certificates are issued after meeting assessment and attendance requirements.",
  },
];

export function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative mt-10 w-full overflow-hidden bg-white py-12 md:py-16 lg:mt-25 lg:py-20">
      <div
        className="pointer-events-none absolute"
        style={{
          width: "354px",
          height: "354px",
          left: "123px",
          top: "250px",
          borderRadius: "354px",
          background: "#DFCBFA",
          filter: "blur(200px)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-310 gap-8 px-4 md:gap-10 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-8">
        <div>
          <h2 className="text-[30px] leading-[1.08] font-semibold tracking-[-0.03em] text-(--text-title) md:text-[40px] lg:text-[40px]">
            Frequently asked
            <br />
            questions
          </h2>

          <p className="lg:mt-6 mt-5 max-w-120 sg-p-default text-(--text-paragraph)">
            Frequently Asked Questions offers quick answers to common queries,
            guiding users through features and functionalities effortlessly.
          </p>

          <button
            type="button"
            className="mt-8 lg:mt-10 inline-flex h-12 items-center gap-2 rounded-md bg-(--primary-700) px-6 sg-p-default font-semibold text-(--text-white) transition-all duration-300 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
          >
            Contact Us
            <ArrowRight size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid content-start gap-4">
          {FAQ_ITEMS.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <article
                key={`${item.question}-${index}`}
                className={`rounded-lg border p-4 md:p-5 ${
                  isActive
                    ? "border-[#2E076E] bg-[#2E076E]"
                    : "border-(--gray-200) bg-(--gray-50)"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveIndex(index);
                  }}
                  className="flex w-full items-start justify-between gap-4 text-left cursor-pointer"
                >
                  <span
                    className={`lg:sg-h6 sg-p-big font-semibold ${
                      isActive ? "text-(--text-white)" : "text-(--text-title)"
                    }`}
                  >
                    {item.question}
                  </span>
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md ${
                      isActive
                        ? "bg-(--text-white) text-(--text-title)"
                        : "bg-(--gray-100) text-(--text-title)"
                    }`}
                  >
                    {isActive ? (
                      <Minus size={24} strokeWidth={1.5} />
                    ) : (
                      <Plus size={24} strokeWidth={1.5} />
                    )}
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out ${
                    isActive
                      ? "mt-4 max-h-40 opacity-100"
                      : "mt-0 max-h-0 opacity-0"
                  }`}
                >
                  <p className="max-w-170 font-normal lg:sg-p-default sg-p-small text-white">
                    {item.answer}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
