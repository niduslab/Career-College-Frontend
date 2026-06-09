"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
  Globe,
  BadgePercent,
  Repeat2,
  Lock,
  Tag,
  CalendarClock,
  Sparkles,
} from "lucide-react";

type PricingModel = "One-time" | "Subscription" | "Free";
type AccessType = "Lifetime" | "Time-limited";
type Currency = "USD" | "EUR" | "GBP" | "BDT";

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "BDT"];

const PRICING_MODELS: {
  key: PricingModel;
  icon: React.ElementType;
  label: string;
  sub: string;
}[] = [
  {
    key: "One-time",
    icon: DollarSign,
    label: "One-time",
    sub: "Single payment, full access",
  },
  {
    key: "Subscription",
    icon: Repeat2,
    label: "Subscription",
    sub: "Recurring monthly billing",
  },
  { key: "Free", icon: Globe, label: "Free", sub: "No payment required" },
];

const ACCESS_TYPES: {
  key: AccessType;
  icon: React.ElementType;
  label: string;
  sub: string;
}[] = [
  {
    key: "Lifetime",
    icon: Lock,
    label: "Lifetime access",
    sub: "Students own the course forever",
  },
  {
    key: "Time-limited",
    icon: CalendarClock,
    label: "Time-limited",
    sub: "Access expires after N days",
  },
];

const TIPS = [
  {
    icon: Sparkles,
    color: "text-yellow-500",
    text: "Use a compare-at price to communicate value.",
  },
  {
    icon: Sparkles,
    color: "text-blue-500",
    text: "Launch coupons convert 2× in week 1.",
  },
  {
    icon: Sparkles,
    color: "text-green-500",
    text: "Drip content increases completion by 38%.",
  },
];

const PLATFORM_FEE = 0.15;

export default function PricingTab({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [model, setModel] = useState<PricingModel>("One-time");
  const [access, setAccess] = useState<AccessType>("Lifetime");
  const [price, setPrice] = useState("49");
  const [compareAt, setCompareAt] = useState("99");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [couponCode, setCouponCode] = useState("LAUNCH20");
  const [discount, setDiscount] = useState("20");
  const [drip, setDrip] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const listPrice = model === "Free" ? 0 : parseFloat(price) || 0;
  const platformFee = listPrice * PLATFORM_FEE;
  const earnPerSale = listPrice - platformFee;
  const discountAmt = (listPrice * (parseFloat(discount) || 0)) / 100;
  const finalPrice = Math.max(0, listPrice - discountAmt);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ── Left — Main form ── */}
      <div className="flex-1 space-y-5">
        <div className="bg-white border border-(--gray-200) rounded-xl p-6 space-y-6">
          <h2 className="text-[16px] lg:text-[20px] font-semibold text-(--text-title)">
            Pricing &amp; Access
          </h2>

          {/* Pricing Model */}
          <div className="space-y-2">
            <p className="text-[12px] font-semibold tracking-widest text-(--gray-500) uppercase">
              Pricing Model
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
              {PRICING_MODELS.map(({ key, icon: Icon, label, sub }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModel(key)}
                  className={`flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    model === key
                      ? "border-(--primary-600) bg-(--primary-50)"
                      : "border-(--gray-200) hover:border-(--gray-300) hover:bg-(--gray-50)"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${model === key ? "text-(--primary-600)" : "text-(--gray-400)"}`}
                  />
                  <p
                    className={`text-[13px] font-semibold ${model === key ? "text-(--primary-700)" : "text-(--text-title)"}`}
                  >
                    {label}
                  </p>
                  <p className="text-[11px] text-(--gray-400) leading-snug">
                    {sub}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Price inputs — hidden for Free */}
          {model !== "Free" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold tracking-widest text-(--gray-400) uppercase">
                  Price
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--gray-400) text-[14px]">
                    $
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={0}
                    className="w-full h-12 pl-7 pr-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold tracking-widest text-(--gray-400) uppercase">
                  Compare-at
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--gray-400) text-[14px]">
                    $
                  </span>
                  <input
                    type="number"
                    value={compareAt}
                    onChange={(e) => setCompareAt(e.target.value)}
                    min={0}
                    className="w-full h-12 pl-7 pr-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold tracking-widest text-(--gray-400) uppercase">
                  Currency
                </label>
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setCurrencyOpen((v) => !v)}
                    className="w-full h-12 px-3 flex items-center justify-between border border-(--gray-200) rounded-lg bg-white text-[14px] text-(--text-title) cursor-pointer hover:bg-(--gray-50) transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-(--gray-400)" />
                      {currency}
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-(--gray-400) transition-transform ${currencyOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                  {currencyOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-(--gray-200) rounded-xl shadow-lg z-20 py-1">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCurrency(c);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-[13px] cursor-pointer transition-colors ${
                            c === currency
                              ? "bg-(--primary-50) text-(--primary-600) font-semibold"
                              : "text-(--gray-600) hover:bg-(--gray-50)"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Access Type */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
              Access
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {ACCESS_TYPES.map(({ key, icon: Icon, label, sub }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAccess(key)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    access === key
                      ? "border-(--primary-600) bg-(--primary-50)"
                      : "border-(--gray-200) hover:border-(--gray-300) hover:bg-(--gray-50)"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 shrink-0 ${access === key ? "text-(--primary-600)" : "text-(--gray-400)"}`}
                  />
                  <div>
                    <p
                      className={`text-[13px] font-semibold ${access === key ? "text-(--primary-700)" : "text-(--text-title)"}`}
                    >
                      {label}
                    </p>
                    <p className="text-[11px] text-(--gray-400) mt-0.5 leading-snug">
                      {sub}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Coupon */}
          {model !== "Free" && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-(--gray-400)" />
                <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                  Coupon
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                    Code
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. LAUNCH20"
                    className="w-full h-12 px-3 mt-1 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) placeholder:text-(--gray-400) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
                    Discount %
                  </label>
                  <div className="relative mt-1">
                    <BadgePercent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(
                          String(
                            Math.min(100, Math.max(0, Number(e.target.value))),
                          ),
                        )
                      }
                      min={0}
                      max={100}
                      className="w-full h-12 pl-9 pr-3 text-[14px] border border-(--gray-200) rounded-lg bg-white text-(--text-title) outline-none focus:ring-2 focus:ring-(--primary-700) transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                {couponCode && parseFloat(discount) > 0 && (
                  <p className="text-[13px] text-(--gray-500) pb-3">
                    Final price:{" "}
                    <span className="font-semibold text-(--primary-600)">
                      ${fmt(finalPrice)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Drip content */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-(--gray-200) hover:bg-(--gray-50) transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={drip}
              onChange={(e) => setDrip(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-(--primary-600) cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-(--gray-400)" />
                <p className="text-[14px] font-semibold text-(--text-title)">
                  Drip content
                </p>
              </div>
              <p className="text-[12px] text-(--gray-400) mt-0.5">
                Release modules weekly instead of all at once
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-5 h-12 text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Curriculum
          </button>
          <div className="flex items-center gap-3">
            <button className="flex-1 sm:flex-none px-5 h-12 text-[12px] md:text-[14px] lg:text-[14px] cursor-pointer font-medium border border-(--gray-200) rounded-lg text-(--gray-600) hover:bg-(--gray-50) transition-colors">
              Save Draft
            </button>
            <button
              onClick={onContinue}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 h-12 text-[12px] md:text-[14px] lg:text-[14px] cursor-pointer truncate font-medium bg-(--primary-600) hover:bg-(--primary-700) text-white rounded-lg transition-colors"
            >
              Continue to Review
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right — Sidebar ── */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        {/* Earnings Preview */}
        {model !== "Free" && (
          <div className="bg-white border border-(--gray-200) rounded-xl p-5 space-y-3">
            <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
              Earnings Preview
            </p>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-(--gray-500)">List price</span>
                <span className="font-medium text-(--text-title)">
                  ${fmt(listPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-(--gray-500)">Platform fee (15%)</span>
                <span className="font-medium text-red-500">
                  −${fmt(platformFee)}
                </span>
              </div>
              <div className="border-t border-(--gray-100) pt-2 flex items-center justify-between">
                <span className="font-semibold text-(--text-title)">
                  You earn / sale
                </span>
                <span className="font-bold text-(--primary-600) text-[15px]">
                  ${fmt(earnPerSale)}
                </span>
              </div>
              <div className="flex items-center justify-between text-(--gray-400)">
                <span>100 sales</span>
                <span className="text-(--primary-600) font-medium">
                  ${fmt(earnPerSale * 100)}
                </span>
              </div>
              <div className="flex items-center justify-between text-(--gray-400)">
                <span>1,000 sales</span>
                <span className="text-(--primary-600) font-medium">
                  ${fmt(earnPerSale * 1000)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-white border border-(--gray-200) rounded-xl p-5 space-y-3">
          <p className="text-[11px] font-semibold tracking-widest text-(--gray-400) uppercase">
            Tips
          </p>
          <div className="space-y-2.5">
            {TIPS.map(({ icon: Icon, color, text }) => (
              <div key={text} className="flex items-start gap-2">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                <p className="text-[12px] text-(--gray-500) leading-snug">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
