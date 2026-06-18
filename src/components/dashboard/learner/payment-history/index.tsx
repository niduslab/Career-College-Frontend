"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Download,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  DollarSign,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";

import instructor1 from "@/assets/images/instructors/instructor1.webp";
import instructor2 from "@/assets/images/instructors/instructor2.webp";
import instructor3 from "@/assets/images/instructors/instructor3.webp";
import instructor4 from "@/assets/images/instructors/instructor4.webp";
import instructor5 from "@/assets/images/instructors/instructor5.webp";
import instructor6 from "@/assets/images/instructors/instructor6.webp";

// Types
type PaymentStatus = "completed" | "pending" | "failed" | "refunded";
type PaymentMethod = "Visa" | "Mastercard" | "PayPal" | "Stripe";
type FilterStatus = "All" | PaymentStatus;

interface Payment {
  id: string;
  courseName: string;
  courseThumb: Parameters<typeof Image>[0]["src"];
  instructor: string;
  amount: number;
  discount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  cardLast4?: string;
  date: string;
  invoiceId: string;
}

// Mock data
const PAYMENTS: Payment[] = [
  {
    id: "p1",
    courseName: "Generative AI & LLMs in Production",
    courseThumb: instructor1,
    instructor: "Dr. Lena Park",
    amount: 89.99,
    discount: 20,
    status: "completed",
    method: "Visa",
    cardLast4: "4242",
    date: "Jun 12, 2026",
    invoiceId: "INV-2026-0041",
  },
  {
    id: "p2",
    courseName: "SQL for Data Analytics",
    courseThumb: instructor3,
    instructor: "Dr. Omar Said",
    amount: 49.99,
    discount: 0,
    status: "completed",
    method: "PayPal",
    date: "May 28, 2026",
    invoiceId: "INV-2026-0038",
  },
  {
    id: "p3",
    courseName: "UI/UX Design Fundamentals",
    courseThumb: instructor4,
    instructor: "Sara Kim",
    amount: 69.99,
    discount: 15,
    status: "completed",
    method: "Mastercard",
    cardLast4: "1234",
    date: "May 10, 2026",
    invoiceId: "INV-2026-0031",
  },
  {
    id: "p4",
    courseName: "Full-Stack React & Node.js",
    courseThumb: instructor2,
    instructor: "Marcus Webb",
    amount: 79.99,
    discount: 0,
    status: "pending",
    method: "Stripe",
    date: "Jun 15, 2026",
    invoiceId: "INV-2026-0044",
  },
  {
    id: "p5",
    courseName: "Python Data Wrangling with Polars",
    courseThumb: instructor3,
    instructor: "Dr. Omar Said",
    amount: 59.99,
    discount: 10,
    status: "refunded",
    method: "Visa",
    cardLast4: "4242",
    date: "Apr 22, 2026",
    invoiceId: "INV-2026-0022",
  },
  {
    id: "p6",
    courseName: "Career Coaching: Land Your Dream Tech Job",
    courseThumb: instructor5,
    instructor: "James Carter",
    amount: 39.99,
    discount: 0,
    status: "failed",
    method: "Mastercard",
    cardLast4: "9876",
    date: "Jun 14, 2026",
    invoiceId: "INV-2026-0043",
  },
  {
    id: "p7",
    courseName: "AWS Cloud & DevOps Bootcamp",
    courseThumb: instructor6,
    instructor: "Amara Okafor",
    amount: 99.99,
    discount: 25,
    status: "completed",
    method: "PayPal",
    date: "Mar 18, 2026",
    invoiceId: "INV-2026-0015",
  },
  {
    id: "p8",
    courseName: "Data Visualization with Plotly & D3",
    courseThumb: instructor3,
    instructor: "Dr. Omar Said",
    amount: 44.99,
    discount: 0,
    status: "completed",
    method: "Visa",
    cardLast4: "4242",
    date: "Feb 5, 2026",
    invoiceId: "INV-2026-0008",
  },
];

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; badge: string; icon: typeof CheckCircle2 }
> = {
  completed: {
    label: "Completed",
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
    icon: Clock,
  },
  failed: {
    label: "Failed",
    badge: "bg-rose-50 text-rose-600 border border-rose-200",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    badge: "bg-(--gray-100) text-(--gray-500) border border-(--gray-200)",
    icon: RefreshCcw,
  },
};

const METHOD_ICON: Record<PaymentMethod, string> = {
  Visa: "VISA",
  Mastercard: "MC",
  PayPal: "PP",
  Stripe: "ST",
};

const METHOD_COLOR: Record<PaymentMethod, string> = {
  Visa: "bg-blue-600",
  Mastercard: "bg-rose-600",
  PayPal: "bg-sky-500",
  Stripe: "bg-violet-600",
};

const FILTER_STATUSES: FilterStatus[] = [
  "All",
  "completed",
  "pending",
  "failed",
  "refunded",
];
const PAGE_SIZE = 6;

// Invoice row component
function PaymentRow({ payment }: { payment: Payment }) {
  const cfg = STATUS_CONFIG[payment.status];
  const StatusIcon = cfg.icon;
  const finalAmount =
    payment.amount - (payment.amount * payment.discount) / 100;

  return (
    <div className="payment-row opacity-0 bg-white rounded-xl border border-(--gray-200) p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
      {/* Thumb */}
      <div className="w-13 h-13 rounded-xl overflow-hidden shrink-0 ">
        <Image
          src={payment.courseThumb}
          alt={payment.courseName}
          width={52}
          height={52}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-(--text-title) truncate">
          {payment.courseName}
        </p>
        <p className="text-[12px] text-(--gray-500) mt-0.5">
          {payment.instructor}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className="text-[12px] text-(--gray-500)">{payment.date}</span>
          <span className="text-[12px] text-(--gray-500)">
            {payment.invoiceId}
          </span>
          {/* Payment method badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold text-white px-2 py-0.5 rounded-md ${METHOD_COLOR[payment.method]}`}
          >
            {METHOD_ICON[payment.method]}
            {payment.cardLast4 && (
              <span className="font-normal opacity-90">
                ···· {payment.cardLast4}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Amount + discount */}
      <div className="text-right shrink-0">
        <p className="text-[16px] font-bold text-(--text-title)">
          ${finalAmount.toFixed(2)}
        </p>
        {payment.discount > 0 && (
          <p className="text-[12px] text-(--gray-500) line-through">
            ${payment.amount.toFixed(2)}
          </p>
        )}
        {payment.discount > 0 && (
          <p className="text-[12px] text-emerald-600 font-medium">
            -{payment.discount}% off
          </p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full ${cfg.badge}`}
        >
          <StatusIcon className="w-4 h-4" />
          {cfg.label}
        </span>
        <button
          title="Download invoice"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-(--gray-200) text-(--gray-400) hover:border-(--primary-300) hover:text-(--primary-600) transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Main page component
export default function PaymentHistoryPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "Newest" | "Oldest" | "Amount: High–Low" | "Amount: Low–High"
  >("Newest");
  const [currentPage, setCurrentPage] = useState(1);

  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = PAYMENTS.filter((p) => {
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      p.courseName.toLowerCase().includes(q) ||
      p.invoiceId.toLowerCase().includes(q) ||
      p.instructor.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }).sort((a, b) => {
    const aFinal = a.amount - (a.amount * a.discount) / 100;
    const bFinal = b.amount - (b.amount * b.discount) / 100;
    if (sortBy === "Amount: High–Low") return bFinal - aFinal;
    if (sortBy === "Amount: Low–High") return aFinal - bFinal;
    if (sortBy === "Oldest") return a.id.localeCompare(b.id);
    return b.id.localeCompare(a.id);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const totalSpent = PAYMENTS.filter((p) => p.status === "completed").reduce(
    (s, p) => s + (p.amount - (p.amount * p.discount) / 100),
    0,
  );
  const totalRefunded = PAYMENTS.filter((p) => p.status === "refunded").reduce(
    (s, p) => s + (p.amount - (p.amount * p.discount) / 100),
    0,
  );

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const rows = Array.from(listRef.current.querySelectorAll(".payment-row"));
    gsap.fromTo(
      rows,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: "power3.out" },
    );
  }, [filterStatus, search, sortBy, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        ref={headerRef}
        className="opacity-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[20px] md:text-[24px] lg:text-[24px] font-semibold text-(--text-title)">
            Payment History
          </h1>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
            Track all your course purchases and invoices.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Spent",
            value: `$${totalSpent.toFixed(2)}`,
            iconBg: "bg-(--primary-100)",
            color: "text-(--primary-600)",
            Icon: DollarSign,
            badge: "on courses",
          },
          {
            label: "Purchases",
            value: PAYMENTS.filter((p) => p.status === "completed").length,
            iconBg: "bg-emerald-100",
            color: "text-emerald-600",
            Icon: ShoppingCart,
            badge: "completed",
          },
          {
            label: "Pending",
            value: PAYMENTS.filter((p) => p.status === "pending").length,
            iconBg: "bg-amber-100",
            color: "text-amber-600",
            Icon: Clock,
            badge: "awaiting payment",
          },
          {
            label: "Total Refunded",
            value: `$${totalRefunded.toFixed(2)}`,
            iconBg: "bg-(--gray-100)",
            color: "text-(--gray-500)",
            Icon: RefreshCcw,
            badge: "returned",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-normal mb-2">
                  {s.label}
                </p>
                <p className="text-[18px] md:text-[20px] lg:text-[24px] font-semibold text-(--text-title) leading-none">
                  {s.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-[6px_4px_6px_6px] ${s.iconBg} flex items-center justify-center shrink-0`}
              >
                <s.Icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <div className="border border-dashed border-(--gray-200)" />
            <p className="text-[12px] font-medium text-(--gray-400)">
              {s.badge}
            </p>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {FILTER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilterStatus(s);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] border transition-colors cursor-pointer whitespace-nowrap shrink-0 capitalize ${filterStatus === s ? "bg-(--primary-600) text-white border-(--primary-600) font-medium" : "bg-white text-(--gray-600) font-normal border-(--gray-200) hover:border-(--primary-300)"}`}
            >
              {s === "All" ? "All" : STATUS_CONFIG[s as PaymentStatus].label}
              {s !== "All" && (
                <span
                  className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${filterStatus === s ? "bg-white/20 text-white" : "bg-(--gray-100) text-(--gray-500)"}`}
                >
                  {PAYMENTS.filter((p) => p.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search invoices…"
              className="w-full md:w-72 xl:w-52 pl-9 pr-4 h-11 rounded-md border border-(--gray-200) text-[14px] placeholder:text-(--gray-400) outline-none focus:border-(--primary-400) transition-colors bg-white"
            />
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 h-11 px-3.5 rounded-md border border-(--gray-200) bg-white text-[14px] text-(--gray-500) hover:border-(--primary-300) transition-colors cursor-pointer whitespace-nowrap"
            >
              {sortBy}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 z-20 bg-white border border-(--gray-200) rounded-xl shadow-lg py-1.5 w-52">
                {(
                  [
                    "Newest",
                    "Oldest",
                    "Amount: High–Low",
                    "Amount: Low–High",
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt);
                      setSortOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-[14px] hover:bg-(--gray-50) transition-colors cursor-pointer ${sortBy === opt ? "font-semibold text-(--primary-600)" : "text-(--text-title) font-normal"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {filtered.length}
        </span>{" "}
        transaction{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      <div ref={listRef} className="space-y-3">
        {paginated.map((p) => (
          <PaymentRow key={p.id} payment={p} />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-(--gray-400)">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-[16px] font-medium text-(--text-title)">
              No transactions found
            </p>
            <p className="text-[14px] mt-1">
              Try a different filter or search term
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
