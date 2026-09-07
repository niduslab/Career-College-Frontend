"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  Receipt,
  BookOpen,
  Video,
} from "lucide-react";
import gsap from "gsap";
import { Pagination } from "@/components/common/pagination";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/common/query-states";
import { useMyOrders } from "@/hooks/use-payments";
import type { Order, OrderStatus } from "@/lib/payments-api";

/**
 * The gateway's five order states collapse into the three the UI shows.
 * There is no `refunded` state on the backend — refunds are a manual Phase-2
 * process with no order status — so the page has no refunded tab or tile.
 */
type DisplayStatus = "completed" | "pending" | "failed";
type FilterStatus = "All" | DisplayStatus;

const STATUS_MAP: Record<OrderStatus, DisplayStatus> = {
  paid: "completed",
  initiated: "pending",
  processing: "pending",
  failed: "failed",
  cancelled: "failed",
};

const STATUS_CONFIG: Record<
  DisplayStatus,
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
};

const FILTER_STATUSES: FilterStatus[] = [
  "All",
  "completed",
  "pending",
  "failed",
];
const PAGE_SIZE = 6;
/** Server cap. A learner's order history is small; one page covers it and
 *  lets the stat tiles count across every status. */
const FETCH_SIZE = 100;

function orderTitle(order: Order): string {
  return order.course_title ?? order.webinar_title ?? `Order ${order.tran_id}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(order: Order): string {
  const value = Number(order.amount);
  return Number.isFinite(value)
    ? `${value.toFixed(2)} ${order.currency}`
    : `${order.amount} ${order.currency}`;
}

function PaymentRow({ order }: { order: Order }) {
  const display = STATUS_MAP[order.status];
  const cfg = STATUS_CONFIG[display];
  const StatusIcon = cfg.icon;
  const ItemIcon = order.item_type === "webinar" ? Video : BookOpen;

  return (
    <div className="payment-row opacity-0 bg-white rounded-xl border border-(--gray-200) p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* The order carries no thumbnail — the item type stands in for it. */}
      <div className="w-13 h-13 rounded-xl shrink-0 bg-linear-to-br from-(--primary-500) to-(--primary-600) flex items-center justify-center shadow-sm">
        <ItemIcon className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-(--text-title) truncate">
          {orderTitle(order)}
        </p>
        <p className="text-[12px] text-(--gray-500) mt-0.5 capitalize">
          {order.item_type}
          {order.schedule_id !== null ? " · cohort seat" : ""}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className="text-[12px] text-(--gray-500)">
            {formatDate(order.paid_at ?? order.created_at)}
          </span>
          <span className="text-[12px] text-(--gray-500) font-mono">
            {order.tran_id}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[16px] font-bold text-(--text-title)">
          {formatAmount(order)}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full ${cfg.badge}`}
        >
          <StatusIcon className="w-4 h-4" />
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

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

  const { data, isLoading, isError, refetch } = useMyOrders({
    page_size: FETCH_SIZE,
  });
  const orders = useMemo(() => data?.results ?? [], [data]);

  const countByStatus = useMemo(() => {
    const counts: Record<DisplayStatus, number> = {
      completed: 0,
      pending: 0,
      failed: 0,
    };
    orders.forEach((order) => {
      counts[STATUS_MAP[order.status]] += 1;
    });
    return counts;
  }, [orders]);

  const totalSpent = useMemo(
    () =>
      orders
        .filter((order) => order.status === "paid")
        .reduce((sum, order) => sum + Number(order.amount || 0), 0),
    [orders],
  );
  const currency = orders[0]?.currency ?? "BDT";

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders
      .filter((order) => {
        const matchStatus =
          filterStatus === "All" || STATUS_MAP[order.status] === filterStatus;
        const matchSearch =
          !query ||
          orderTitle(order).toLowerCase().includes(query) ||
          order.tran_id.toLowerCase().includes(query);
        return matchStatus && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "Amount: High–Low")
          return Number(b.amount) - Number(a.amount);
        if (sortBy === "Amount: Low–High")
          return Number(a.amount) - Number(b.amount);
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return sortBy === "Oldest" ? aTime - bTime : bTime - aTime;
      });
  }, [orders, filterStatus, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const rows = Array.from(listRef.current.querySelectorAll(".payment-row"));
    if (rows.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.killTweensOf(rows);
      gsap.fromTo(
        rows,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: "power3.out" },
      );
    }, listRef);
    return () => ctx.revert();
  }, [filterStatus, search, sortBy, currentPage, paginated.length]);

  const stats = [
    {
      label: "Total Spent",
      value: `${totalSpent.toFixed(2)} ${currency}`,
      tint: "from-(--primary-50) to-white",
      iconColor: "bg-gradient-to-br from-(--primary-500) to-(--primary-600)",
      Icon: DollarSign,
      badge: "on courses and webinars",
    },
    {
      label: "Purchases",
      value: countByStatus.completed,
      tint: "from-emerald-50 to-white",
      iconColor: "bg-gradient-to-br from-emerald-400 to-emerald-500",
      Icon: ShoppingCart,
      badge: "completed",
    },
    {
      label: "Pending",
      value: countByStatus.pending,
      tint: "from-amber-50 to-white",
      iconColor: "bg-gradient-to-br from-amber-400 to-amber-500",
      Icon: Clock,
      badge: "awaiting payment",
    },
    {
      label: "Failed",
      value: countByStatus.failed,
      tint: "from-rose-50 to-white",
      iconColor: "bg-gradient-to-br from-rose-400 to-rose-500",
      Icon: XCircle,
      badge: "not charged",
    },
  ];

  return (
    <div className="space-y-6">
      <div
        ref={headerRef}
        className="opacity-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-[22px] md:text-[28px] lg:text-[28px] font-bold text-(--text-title) tracking-tight">
            Payment History
          </h1>
          <p className="text-[12px] md:text-[14px] lg:text-[14px] text-(--gray-500) mt-1">
            Track all your course and webinar purchases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-linear-to-b ${s.tint} rounded-2xl p-4 border border-(--gray-200) flex flex-col gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-(--gray-500) font-medium mb-2">
                  {s.label}
                </p>
                <p className="text-[18px] md:text-[20px] lg:text-[24px] font-bold text-(--text-title) leading-none tracking-tight">
                  {isLoading ? "—" : s.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-[6px_4px_6px_6px] ${s.iconColor} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <s.Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="border border-dashed border-(--gray-200)" />
            <p className="text-[12px] font-medium text-(--gray-400)">
              {s.badge}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {FILTER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilterStatus(s);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 h-11 rounded-md text-[14px] border transition-all cursor-pointer whitespace-nowrap shrink-0 capitalize ${filterStatus === s ? "bg-linear-to-br from-(--primary-500) to-(--primary-600) text-white border-(--primary-600) font-medium shadow-sm" : "bg-white text-(--gray-600) font-normal border-(--gray-200) hover:border-(--primary-300)"}`}
            >
              {s === "All" ? "All" : STATUS_CONFIG[s].label}
              {s !== "All" && (
                <span
                  className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${filterStatus === s ? "bg-white/20 text-white" : "bg-(--gray-100) text-(--gray-500)"}`}
                >
                  {countByStatus[s]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--gray-400)" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title or transaction…"
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

      <p className="text-[14px] text-(--gray-500)">
        Showing{" "}
        <span className="font-semibold text-(--text-title)">
          {filtered.length}
        </span>{" "}
        transaction{filtered.length !== 1 ? "s" : ""}
      </p>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your payments"
          description="We couldn't reach the payment service. Please try again."
          onRetry={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-6 h-6" />}
          title={
            orders.length === 0
              ? "No transactions yet"
              : "No transactions found"
          }
          description={
            orders.length === 0
              ? "Purchases you make will appear here with their invoices."
              : "Try a different filter or search term."
          }
        />
      ) : (
        <>
          <div ref={listRef} className="space-y-3">
            {paginated.map((order) => (
              <PaymentRow key={order.id} order={order} />
            ))}
          </div>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
