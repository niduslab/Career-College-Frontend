import { Suspense } from "react";
import { PaymentResultView } from "@/components/payment/payment-result";

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResultView outcome="cancel" />
    </Suspense>
  );
}
