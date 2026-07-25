import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listIdentityVerifications,
  reviewIdentityVerification,
  listInstitutionVerifications,
  reviewInstitutionVerification,
  type VerificationStatus,
  type ReviewArgs,
} from "@/lib/admin-verification-api";

export function useIdentityVerifications(status?: VerificationStatus) {
  return useQuery({
    queryKey: ["admin-identity-verifications", status],
    queryFn: () => listIdentityVerifications(status),
    placeholderData: (previousData) => previousData,
  });
}

export function useReviewIdentityVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...args }: { id: number } & ReviewArgs) =>
      reviewIdentityVerification(id, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-identity-verifications"] });
    },
  });
}

export function useInstitutionVerifications(status?: VerificationStatus) {
  return useQuery({
    queryKey: ["admin-institution-verifications", status],
    queryFn: () => listInstitutionVerifications(status),
    placeholderData: (previousData) => previousData,
  });
}

export function useReviewInstitutionVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...args }: { id: number } & ReviewArgs) =>
      reviewInstitutionVerification(id, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-institution-verifications"] });
    },
  });
}
