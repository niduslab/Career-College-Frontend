"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useOrderByTranId } from "@/hooks/use-payments";

type Outcome = "success" | "fail" | "cancel";

const COPY: Record<
  Outcome,
  { icon: React.ElementType; iconClass: string; title: string; body: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    title: "Payment successful",
    body: "Your enrollment is now active. You can start learning right away.",
  },
  fail: {
    icon: XCircle,
    iconClass: "text-rose-500",
    title: "Payment failed",
    body: "Your payment could not be completed. No charge was made — you can try again.",
  },
  cancel: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    title: "Payment cancelled",
    body: "You cancelled the checkout before it completed. No charge was made.",
  },
};

export function PaymentResultView({ outcome }: { outcome: Outcome }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id") ?? undefined;
  const { data: order, isLoading } = useOrderByTranId(tranId);
  const copy = COPY[outcome];
  const Icon = copy.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--gray-50) px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-(--gray-200) shadow-sm p-8 text-center">
        <Icon className={`w-14 h-14 mx-auto mb-4 ${copy.iconClass}`} />
        <h1 className="text-[20px] font-semibold text-(--text-title) mb-2">
          {copy.title}
        </h1>
        <p className="text-[14px] text-(--gray-500) mb-6">{copy.body}</p>

        {tranId && (
          <div className="text-[12px] text-(--gray-400) mb-6 space-y-1">
            <p>
              Transaction ID:{" "}
              <span className="font-mono text-(--gray-600)">{tranId}</span>
            </p>
            {isLoading ? (
              <p className="flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Checking order status...
              </p>
            ) : order ? (
              <p>
                Order status:{" "}
                <span className="font-semibold text-(--gray-600)">
                  {order.status}
                </span>
              </p>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {outcome === "success" ? (
            <button
              onClick={() => router.push("/dashboard/learner/my-courses")}
              className="w-full h-11 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer"
            >
              Go to My Courses
            </button>
          ) : (
            <button
              onClick={() => router.push("/dashboard/learner/course-catalog")}
              className="w-full h-11 rounded-md bg-(--primary-600) hover:bg-(--primary-700) text-white text-[14px] font-semibold transition-colors cursor-pointer"
            >
              Back to Catalog
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
