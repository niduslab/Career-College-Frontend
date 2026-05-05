"use client";
import { House, ChevronRight } from "lucide-react";
import Link from "next/link";
import LoginOrCreateAccount from "@/components/checkout/login-or-create-account";
import BillingInformation from "@/components/checkout/billing-information";
import PaymentMethod from "@/components/checkout/payment-method";
import CheckoutOrderSummary from "@/components/checkout/checkout-order-summary";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 sg-p-small text-(--text-paragraph) mb-8">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-(--primary-700) transition-colors"
          >
            <House size={16} color="#6a7282" />
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-500" />
          <Link
            href="/add-to-cart"
            className="hover:text-(--primary-700) transition-colors"
          >
            Add to Cart
          </Link>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-(--text-title) sg-p-small font-medium">
            Checkout
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-5">
            <LoginOrCreateAccount />
            <BillingInformation />
            <PaymentMethod />
          </div>

          {/* Right column — order summary */}
          <div className="w-full lg:w-100 shrink-0">
            <CheckoutOrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
