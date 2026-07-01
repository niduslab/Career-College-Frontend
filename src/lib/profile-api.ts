import { apiGet, apiPatch } from "./api";

/** User block from `GET /auth/profile/me/` (guide §16.1). */
export interface ProfileUser {
  id: number;
  email: string;
  full_name: string;
  name_slug: string;
  user_type: string;
  is_email_verified: boolean;
  is_verified: boolean;
  registration_date?: string;
}

/** Learner profile block */
export interface LearnerProfile {
  id: number;
  profile_photo: string | null;
  headline: string;
  bio: string;
  date_of_birth: string | null;
  city: string;
  state: string;
  country: string;
  experience_level: string;
  learning_goal: string;
  interests: string[];
  preferred_language: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  is_profile_public: boolean;
}

export interface MyProfileResponse {
  user: ProfileUser;
  profile: LearnerProfile;
  education: unknown[];
  work_experience: unknown[];
}

/** Fields a learner may update via PATCH   */
export interface LearnerProfileUpdate {
  headline?: string;
  bio?: string;
  date_of_birth?: string | null;
  city?: string;
  state?: string;
  country?: string;
  experience_level?: string;
  learning_goal?: string;
  interests?: string[];
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  is_profile_public?: boolean;
}

/** `experience_level` options for learners   */
export const EXPERIENCE_LEVELS: { value: string; label: string }[] = [
  { value: "student", label: "Student / No experience" },
  { value: "entry", label: "Entry level (0–2 years)" },
  { value: "mid", label: "Mid level (3–5 years)" },
  { value: "senior", label: "Senior level (6–10 years)" },
  { value: "expert", label: "Expert (10+ years)" },
];

/** Fetch the current user's full profile  */
export async function getMyProfile(): Promise<MyProfileResponse> {
  const res = await apiGet<MyProfileResponse>("/auth/profile/me/");
  return res.data as MyProfileResponse;
}

function extractProfile(data: unknown): LearnerProfile {
  const obj = data as { profile?: LearnerProfile } & Partial<LearnerProfile>;
  return (obj?.profile ?? obj) as LearnerProfile;
}

/** Update the current user's profile with a JSON patch   */
export async function updateMyProfile(
  patch: LearnerProfileUpdate,
): Promise<LearnerProfile> {
  const res = await apiPatch("/auth/profile/me/", patch);
  return extractProfile(res.data);
}

/**
 * Upload/replace the profile photo.
 */
export async function updateProfilePhoto(
  file: File | null,
): Promise<LearnerProfile> {
  const form = new FormData();
  form.append("profile_photo", file ?? "");
  const res = await apiPatch("/auth/profile/me/", form);
  return extractProfile(res.data);
}
