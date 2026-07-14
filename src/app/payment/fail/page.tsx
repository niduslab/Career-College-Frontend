import { Suspense } from "react";
import { PaymentResultView } from "@/components/payment/payment-result";

export default function PaymentFailPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResultView outcome="fail" />
    </Suspense>
  );
}
