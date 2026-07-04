import { apiGet, apiPatch, apiPost, apiDelete } from "./api";

/** User block from `GET /auth/profile/me/` */
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

// Education

export interface Education {
  id: number;
  degree: string;
  field_of_study: string;
  institution: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Payload for create/update. `end_date` omitted/null when `is_current`. */
export interface EducationInput {
  degree: string;
  field_of_study: string;
  institution: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
}

/** `degree` options (guide §17). */
export const DEGREE_OPTIONS: { value: string; label: string }[] = [
  { value: "high_school", label: "High School" },
  { value: "associate", label: "Associate Degree" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "doctorate", label: "Doctorate" },
  { value: "diploma", label: "Diploma" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];

export async function listEducation(): Promise<Education[]> {
  const res = await apiGet<Education[]>("/auth/profile/me/education/");
  return (res.data ?? []) as Education[];
}

export async function createEducation(
  input: EducationInput,
): Promise<Education> {
  const res = await apiPost<Education>("/auth/profile/me/education/", input);
  return res.data as Education;
}

export async function updateEducation(
  id: number,
  input: Partial<EducationInput>,
): Promise<Education> {
  const res = await apiPatch<Education>(
    `/auth/profile/me/education/${id}/`,
    input,
  );
  return res.data as Education;
}

export async function deleteEducation(id: number): Promise<void> {
  await apiDelete(`/auth/profile/me/education/${id}/`);
}

// Work Experience

export interface WorkExperience {
  id: number;
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkExperienceInput {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
}

export async function listWorkExperience(): Promise<WorkExperience[]> {
  const res = await apiGet<WorkExperience[]>(
    "/auth/profile/me/work-experience/",
  );
  return (res.data ?? []) as WorkExperience[];
}

export async function createWorkExperience(
  input: WorkExperienceInput,
): Promise<WorkExperience> {
  const res = await apiPost<WorkExperience>(
    "/auth/profile/me/work-experience/",
    input,
  );
  return res.data as WorkExperience;
}

export async function updateWorkExperience(
  id: number,
  input: Partial<WorkExperienceInput>,
): Promise<WorkExperience> {
  const res = await apiPatch<WorkExperience>(
    `/auth/profile/me/work-experience/${id}/`,
    input,
  );
  return res.data as WorkExperience;
}

export async function deleteWorkExperience(id: number): Promise<void> {
  await apiDelete(`/auth/profile/me/work-experience/${id}/`);
}
