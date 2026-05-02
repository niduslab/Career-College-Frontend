"use client";
import React from "react";
import Image from "next/image";
import { Clock, BarChart3, CirclePlay, Medal } from "lucide-react";
import image from "@/assets/images/courses-details/image.webp";

const INFO_ITEMS = [
  { icon: CirclePlay, label: "Total 92 Videos" },
  { icon: Clock, label: "Duration 10 hours 45 min" },
  { icon: BarChart3, label: "Intermediate Level" },
  { icon: Medal, label: "Get Certificate" },
];

const SUBSCRIPTIONS = [
  { id: "starter", label: "Starter", price: "$42.99", suffix: "/year" },
  { id: "growth", label: "Growth", price: "$242.99", suffix: "/year" },
  { id: "ultimate", label: "Ultimate", price: "$499.00", suffix: "/year" },
];

type Plan = "one-time" | "subscription";

interface CourseInformationProps {
  hideImage?: boolean;
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      className={`w-5 h-5 rounded-full cursor-pointer border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? "border-purple-700 bg-purple-700" : "border-gray-500"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${checked ? "bg-white" : "bg-gray-200"}`}
      />
    </span>
  );
}

export default function CourseInformation({
  hideImage = false,
}: CourseInformationProps) {
  const [plan, setPlan] = React.useState<Plan>("one-time");
  const [subPlan, setSubPlan] = React.useState("starter");

  const isSubscription = plan === "subscription";

  return (
    <div className="sticky top-24 rounded-2xl w-full lg:w-90 xl:w-90 bg-white shadow-md overflow-hidden">
      {/* Cover image */}
      {!hideImage && (
        <div className="w-full h-75 relative rounded-t-2xl overflow-hidden">
          <Image src={image} alt="Course Cover" fill className="object-cover" />
        </div>
      )}

      <div className="p-5 pb-6">
        {/* Course info list */}
        <h3 className="font-semibold lg:sg-h5 sg-p-big mb-6 mt-3 --title-text">
          Course Information
        </h3>
        <ul className="space-y-2.5 lg:mt-6 mt-5 sg-p-default --text-paragraph mb-6">
          {INFO_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon size={20} className="text-gray-500 shrink-0" />
              {label}
            </li>
          ))}
        </ul>
        <div className="border mb-6 mt-4"></div>
        {/* Purchase options */}
        <div className="space-y-4 mb-5">
          {/* One-time option */}
          <button
            onClick={() => setPlan("one-time")}
            className="w-full flex items-center gap-3 px-4 py-4 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Radio checked={plan === "one-time"} />
            <span className="flex-1 --text-title font-normal sg-p-default text-left">
              One time for 1-person
            </span>
            <span className="text-sm font-bold text-gray-900">$42.99</span>
          </button>

          {/* Subscriptions toggle */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setPlan("subscription")}
              className="bg-gray-100 w-full flex items-center gap-3 px-4 py-4 transition-colors"
            >
              <Radio checked={isSubscription} />
              <span className="flex-1 --text-title font-normal sg-p-default text-left">
                Subscriptions
              </span>
            </button>

            {/* Sub-options — visible only when subscription plan is selected */}
            {isSubscription && (
              <div className="border-t border-gray-200 bg-gray-100">
                {SUBSCRIPTIONS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubPlan(sub.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <Radio checked={subPlan === sub.id} />
                    <span className="flex-1 --text-title font-normal sg-p-default text-left">
                      {sub.label}
                    </span>
                    <span className="sg-p-default  font-semibold --title-text">
                      {sub.price}
                      <span className="sg-caption font-normal --text-paragraph">
                        {sub.suffix}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button className="w-full  bg-(--primary-700) cursor-pointer text-white font-semibold py-3 rounded-lg  transition-colors sg-p-default">
            {isSubscription ? "Subscribe Now" : "Add to Cart"}
          </button>
          <button className="w-full bg-gray-100 --text-title cursor-pointer font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors sg-p-default">
            Membership
          </button>
        </div>
      </div>
    </div>
  );
}
