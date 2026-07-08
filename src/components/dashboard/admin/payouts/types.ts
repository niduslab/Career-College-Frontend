export type PayoutStatus = "Paid" | "Pending" | "Failed" | "On Hold";
export type PayoutRecipientType = "Instructor" | "Partner";
export type PayoutMethod = "Bank Transfer" | "PayPal" | "Wallet";

export interface Payout {
  id: string;
  recipient: string;
  initials: string;
  type: PayoutRecipientType;
  amount: string;
  method: PayoutMethod;
  status: PayoutStatus;
  scheduled: string;
}
