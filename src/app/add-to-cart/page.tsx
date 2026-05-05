"use client";
import { useState } from "react";
import { House, ChevronRight, Slash } from "lucide-react";
import CartItems, {
  CartItem,
  INITIAL_ITEMS,
} from "@/components/cart/cart-items";
import OrderSummary from "@/components/cart/order-summary";
import Link from "next/link";
import ExploreMoreCourses from "@/components/common/explore-more-courses";
import { DreamCareerCta } from "@/components/common/dream-career-cta";

export default function AddToCartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);

  const handleRemove = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 sg-p-small text-(--text-paragraph) mb-6">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-(--primary-700) transition-colors"
          >
            <House size={16} color="#6a7282" />
            Home
          </Link>

          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-(--text-title) sg-p-small font-medium ">
            Add to Cart
          </span>
        </nav>

        <h1 className="sg-h6 lg:sg-h5  lg:mt-8 mt-6 font-semibold text-[#161617] mb-4">
          My Shopping Cart ({items.length} items)
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Cart items */}
          <div className="flex-1 min-w-0">
            {items.length > 0 ? (
              <CartItems items={items} onRemove={handleRemove} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-(--text-paragraph)">
                Your cart is empty.
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-100 shrink-0">
            <OrderSummary itemCount={items.length} total={total} />
          </div>
        </div>
        <div className="mt-10 lg:mt-25 mb-10 lg:mb-25">
          <ExploreMoreCourses />
        </div>
      </div>
      <DreamCareerCta />
    </div>
  );
}
