"use client";
import { useState } from "react";
import { CreditCard, Earth } from "lucide-react";
import Image from "next/image";
import masterCard from "@/assets/images/checkout/master-card.webp";
import visa from "@/assets/images/checkout/visa.webp";
import discover from "@/assets/images/checkout/discover.webp";

export default function PaymentMethod() {
  const [method, setMethod] = useState<"card">("card");
  const [saveInfo, setSaveInfo] = useState(false);
  const [form, setForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 sg-p-default text-(--text-title) placeholder:text-gray-400 outline-none focus:border-(--primary-500) bg-white transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="sg-p-big font-semibold text-(--text-title) mb-5">
        Payment Method
      </h2>

      {/* Method selector */}
      <div
        className={`flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border mb-5 cursor-pointer transition-colors ${
          method === "card"
            ? "border-(--primary-700) bg-(--primary-50)"
            : "border-gray-200"
        }`}
        onClick={() => setMethod("card")}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              method === "card"
                ? "border-(--primary-700) bg-(--primary-700)"
                : "border-gray-300"
            }`}
          >
            {method === "card" && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </span>
          <CreditCard size={18} className="text-gray-500" />
          <span className="lg:sg-p-default sg-p-small font-medium text-(--text-title)">
            Credit / Debit Card
          </span>
        </div>
        {/* Card brand icons */}
        <div className="flex items-center lg:gap-1.5 gap-1">
          <span className="relative h-5.5 w-8">
            <Image
              src={masterCard}
              alt="Mastercard"
              fill
              sizes="32px"
              className="object-contain"
            />
          </span>
          <span className="relative h-5.5 w-8">
            <Image
              src={visa}
              alt="Visa"
              fill
              sizes="32px"
              className="object-contain"
            />
          </span>
          <span className="relative h-5.5 w-10">
            <Image
              src={discover}
              alt="Discover"
              fill
              sizes="40px"
              className="object-contain"
            />
          </span>
        </div>
      </div>

      {/* Card fields */}
      {method === "card" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
                Card on Name <span className="text-red-500">*</span>
              </label>
              <input
                name="cardName"
                value={form.cardName}
                onChange={handleChange}
                placeholder="Card on name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
                Card Number <span className="text-red-500">*</span>
              </label>
              <input
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="dd/mm/yy"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block sg-p-default font-normal text-(--text-title) mb-2.5">
                Card Verification Code (CVC){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="cvc"
                value={form.cvc}
                onChange={handleChange}
                placeholder="1234"
                maxLength={4}
                className={inputCls}
              />
            </div>
          </div>

          {/* Save info */}
          <label className="flex items-center gap-2 cursor-pointer sg-p-small text-(--text-paragraph)">
            <input
              type="checkbox"
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="w-5 h-5 accent-(--primary-700) cursor-pointer sg-p-small font-normal text-(--text-paragraph)"
            />
            Save my information for faster checkout next time
          </label>
        </div>
      )}

      {/* SSL badge */}
      <div className="mt-6 flex items-center gap-2 border bg-gray-50  border-gray-200 rounded-lg px-4 py-3">
        <span
          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0`}
        />
        <Earth size={24} className="text-gray-500" />
        <span className="sg-p-default text-[#181910] font-normal">
          SSL Commerce
        </span>
      </div>
    </div>
  );
}
