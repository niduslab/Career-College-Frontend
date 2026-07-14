import { Suspense } from "react";
import { PaymentResultView } from "@/components/payment/payment-result";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResultView outcome="success" />
    </Suspense>
  );
}
