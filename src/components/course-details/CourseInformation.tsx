"use client";
import React from "react";
import Image from "next/image";
import { Video, Clock, BarChart3, Award } from "lucide-react";
import image from "@/assets/images/courses-details/image.webp";

const INFO_ITEMS = [
  { icon: Video,    label: "Total 92 Videos"        },
  { icon: Clock,    label: "Duration 10 hours 45 min"},
  { icon: BarChart3,label: "Intermediate Level"      },
  { icon: Award,    label: "Get Certificate"         },
];

const SUBSCRIPTIONS = [
  { id: "starter",  label: "Starter",  price: "$42.99",  suffix: "/year" },
  { id: "growth",   label: "Growth",   price: "$242.99", suffix: "/year" },
  { id: "ultimate", label: "Ultimate", price: "$499.00", suffix: "/year" },
];

type Plan = "one-time" | "subscription";

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? "border-purple-600 bg-purple-600" : "border-gray-300 bg-white"
      }`}
    >
      {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
    </span>
  );
}

export default function CourseInformation() {
  const [plan, setPlan]     = React.useState<Plan>("one-time");
  const [subPlan, setSubPlan] = React.useState("starter");

  const isSubscription = plan === "subscription";

  return (
    <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
      {/* Cover image */}
      <div className="w-full h-44 relative">
        <Image src={image} alt="Course Cover" fill className="object-cover" />
      </div>

      <div className="p-5">
        {/* Course info list */}
        <h3 className="font-bold text-base mb-3">Course Information</h3>
        <ul className="space-y-2.5 text-sm text-gray-600 mb-5">
          {INFO_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon size={16} className="text-gray-400 shrink-0" />
              {label}
            </li>
          ))}
        </ul>

        {/* Purchase options */}
        <div className="space-y-2 mb-5">

          {/* One-time option */}
          <button
            onClick={() => setPlan("one-time")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Radio checked={plan === "one-time"} />
            <span className="flex-1 text-sm font-medium text-left">One time for 1-person</span>
            <span className="text-sm font-bold text-gray-900">$42.99</span>
          </button>

          {/* Subscriptions toggle */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setPlan("subscription")}
              className={`w-full flex items-center gap-3 px-3 py-3 transition-colors ${
                isSubscription ? "bg-purple-50" : "hover:bg-gray-50"
              }`}
            >
              <Radio checked={isSubscription} />
              <span className="flex-1 text-sm font-semibold text-left">Subscriptions</span>
            </button>

            {/* Sub-options — visible only when subscription plan is selected */}
            {isSubscription && (
              <div className="border-t border-gray-100 bg-white">
                {SUBSCRIPTIONS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubPlan(sub.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <Radio checked={subPlan === sub.id} />
                    <span className="flex-1 text-sm font-medium text-left">{sub.label}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {sub.price}
                      <span className="text-xs font-normal text-gray-400">{sub.suffix}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors text-sm">
            {isSubscription ? "Subscribe Now" : "Add to Cart"}
          </button>
          <button className="w-full bg-gray-100 text-purple-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            Membership
          </button>
        </div>
      </div>
    </div>
  );
}
