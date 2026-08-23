import { useQuery } from "@tanstack/react-query";
import { getMyVerifications } from "@/lib/verification-api";
import { getMyInstructorProfile, type InstructorProfile } from "@/lib/profile-api";

const QUERY_KEY = ["instructor-verification-status"];

/** Mirrors the backend's submit-time profile completeness check (§23 of the guide). */
const REQUIRED_PROFILE_FIELDS: {
  key: keyof InstructorProfile;
  label: string;
}[] = [
  { key: "headline", label: "Headline" },
  { key: "specialization", label: "Specialization" },
  { key: "years_of_experience", label: "Years of experience" },
  { key: "current_title", label: "Current title" },
];

function missingProfileFields(profile: InstructorProfile): string[] {
  return REQUIRED_PROFILE_FIELDS.filter(({ key }) => {
    const value = profile[key];
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "number") return !value || value <= 0;
    return !value;
  }).map(({ label }) => label);
}

/**
 * The instructor's most recent identity verification request (`null` when
 * they've never started one), plus which profile fields are still missing
 * before submit will succeed.
 */
export function useInstructorVerificationStatus() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const [verifications, profileRes] = await Promise.all([
        getMyVerifications(),
        getMyInstructorProfile(),
      ]);
      return {
        verification: verifications[0] ?? null,
        missingProfileFields: missingProfileFields(profileRes.profile),
        totalProfileFields: REQUIRED_PROFILE_FIELDS.length,
      };
    },
    // Profile fields can change on another page (settings) without this cache
    // hearing about it, in either direction — always re-check on mount.
    staleTime: 0,
    refetchOnMount: "always",
  });
}
