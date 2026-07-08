export type TransactionStatus = "Completed" | "Pending" | "Refunded" | "Failed";
export type PaymentMethod = "Credit Card" | "PayPal" | "Bank Transfer" | "Wallet";

export interface Transaction {
  id: string;
  student: string;
  course: string;
  amount: string;
  method: PaymentMethod;
  status: TransactionStatus;
  date: string;
}
