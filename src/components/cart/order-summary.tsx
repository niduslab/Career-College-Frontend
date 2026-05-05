"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface OrderSummaryProps {
  itemCount: number;
  total: number;
}

export default function OrderSummary({ itemCount, total }: OrderSummaryProps) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = () => {
    setDiscount(0);
  };

  const subTotal = total - discount;

  return (
    <div className="bg-gray-100 rounded-2xl border   p-6 sticky top-24">
      <h2 className="sg-p-big font-semibold text-[#101114] mb-4">
        Order Summary
      </h2>

      {/* Coupon */}
      <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 gap-1 mb-6">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Enter coupon code"
          className="flex-1 min-w-0 px-3 py-2 sg-p-default text-(--text-paragraph) outline-none bg-transparent"
        />
        <button
          onClick={handleApplyCoupon}
          className="shrink-0 bg-(--primary-700) sg-p-default m-2 text-white text-sm font-semibold px-4 py-2.5 cursor-pointer   transition-opacity rounded-md  "
        >
          Apply Coupon
        </button>
      </div>

      {/* Breakdown */}
      <div className="space-y-6 sg-p-default text-(--text-paragraph) font-normal">
        <div className="flex items-center justify-between">
          <span>Total Items ({itemCount})</span>
          <span className="font-medium  text-(--text-title)">
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

      <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex items-center justify-between sg-p-default font-semibold text-(--text-title)">
        <span>Sub Total:</span>
        <span className="font-medium  text-(--text-title)">
          ${subTotal.toFixed(2)}
        </span>
      </div>

      {/* Checkout */}
      <button className="mt-5 lg:mt-8 w-full h-12 bg-(--primary-700) text-white sg-p-default font-semibold py-3 rounded-md cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
        Proceed to Checkout
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
