"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import img1 from "@/assets/images/courses-details/image.webp";
import img2 from "@/assets/images/courses-details/image.webp";

const ITEMS = [
  {
    id: 1,
    image: img1,
    title: "Complete UI/UX Design Course 2026: Figma + Real Project",
    price: 42.99,
  },
  {
    id: 2,
    image: img2,
    title: "Complete UI/UX Design Course 2026: Figma + Real Project",
    price: 42.99,
  },
];

export default function CheckoutOrderSummary() {
  const [coupon, setCoupon] = useState("");
  const [discount] = useState(0);

  const total = ITEMS.reduce((s, i) => s + i.price, 0);
  const subTotal = total - discount;

  return (
    <div className="bg-gray-100 rounded-2xl  p-6 sticky top-24">
      <h2 className="sg-p-big font-semibold text-[#101114] mb-4">
        Order Summary
      </h2>
      {/* Coupon */}
      {/* <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 gap-1 mb-5">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Enter coupon code"
          className="flex-1 min-w-0 px-3 py-2 text-sm text-(--text-paragraph) outline-none bg-transparent"
        />
        <button className="shrink-0 bg-(--primary-700) text-white text-sm font-semibold px-4 py-2.5 cursor-pointer hover:opacity-90 transition-opacity rounded-md whitespace-nowrap">
          Apply Coupon
        </button>
      </div> */}

      {/* Coupon */}
      <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 gap-1 mb-6">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Enter coupon code"
          className="flex-1 min-w-0 px-3 py-2 sg-p-default text-(--text-paragraph) outline-none bg-transparent"
        />
        <button className="shrink-0 bg-(--primary-700) sg-p-default m-2 text-white text-sm font-semibold px-4 py-2.5 cursor-pointer   transition-opacity rounded-md  ">
          Apply Coupon
        </button>
      </div>
      {/* Items */}
      <div className="space-y-3 mb-5">
        {ITEMS.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="flex-1 sg-p-small text-[#12100E] font-medium leading-snug line-clamp-2">
              {item.title}
            </p>
            <span className="shrink-0 sg-p-small font-normal text-[#12100E]">
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-3 border-t border-dashed border-gray-300  mt-4 pt-4 sg-p-default text-[#4E4758]">
        <div className="flex items-center justify-between">
          <span>Total Items ({ITEMS.length})</span>
          <span className="font-medium text-[#12100E]">
            ${total.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Coupon Discount</span>
          <span className="font-medium text-(--text-title)">
            ${discount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-300 mt-4 pt-4 flex items-center justify-between sg-p-default font-semibold text-[#12100E]">
        <span>Sub Total:</span>
        <span className="font-medium  text-(--text-title)">
          ${subTotal.toFixed(2)}
        </span>
      </div>

      {/* Pay button */}

      <button className="mt-5 w-full h-12 bg-(--primary-700) text-white sg-p-default font-semibold rounded-md cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        Pay ${subTotal.toFixed(2)}
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
