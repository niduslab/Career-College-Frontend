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

/** Instructor profile */
export interface InstructorProfile {
  id: number;
  profile_photo: string | null;
  headline: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  specialization: string[];
  years_of_experience: number | null;
  current_title: string;
  current_organization: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  is_verified?: boolean;
  is_profile_public: boolean;
}

export interface MyProfileResponse {
  user: ProfileUser;
  profile: LearnerProfile;
  education: unknown[];
  work_experience: unknown[];
}

/** Same endpoint as `MyProfileResponse` but typed for an instructor. */
export interface MyInstructorProfileResponse {
  user: ProfileUser;
  profile: InstructorProfile;
  education: unknown[];
  work_experience: unknown[];
}

/** Fields an instructor may update */
export interface InstructorProfileUpdate {
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  specialization?: string[];
  years_of_experience?: number;
  current_title?: string;
  current_organization?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  is_profile_public?: boolean;
}

/** Partner-institution profile. */
export interface PartnerProfile {
  id: number;
  logo: string | null;
  cover_image: string | null;
  institution_name: string;
  institution_type: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  founded_year: number | null;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  linkedin_url: string;
  is_verified?: boolean;
  is_profile_public: boolean;
}

/** Same endpoint as `MyProfileResponse` but typed for a partner institution. */
export interface MyPartnerProfileResponse {
  user: ProfileUser;
  profile: PartnerProfile;
}

/** Fields a partner institution may update. */
export interface PartnerProfileUpdate {
  tagline?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  founded_year?: number | null;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  linkedin_url?: string;
  is_profile_public?: boolean;
}

/** `institution_type` options. */
export const INSTITUTION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "university", label: "University" },
  { value: "college", label: "College" },
  { value: "training_center", label: "Training Center" },
  { value: "corporate", label: "Corporate Training" },
  { value: "nonprofit", label: "Non-Profit" },
  { value: "other", label: "Other" },
];

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

// Instructor profile (same endpoint, instructor-shaped fields)

export async function getMyInstructorProfile(): Promise<MyInstructorProfileResponse> {
  const res = await apiGet<MyInstructorProfileResponse>("/auth/profile/me/");
  return res.data as MyInstructorProfileResponse;
}

/** PATCH response returns the profile directly; GET nests it under `profile`. */
function extractInstructorProfile(data: unknown): InstructorProfile {
  const obj = data as {
    profile?: InstructorProfile;
  } & Partial<InstructorProfile>;
  return (obj?.profile ?? obj) as InstructorProfile;
}

export async function updateInstructorProfile(
  patch: InstructorProfileUpdate,
): Promise<InstructorProfile> {
  const res = await apiPatch("/auth/profile/me/", patch);
  return extractInstructorProfile(res.data);
}

/** Upload/replace the instructor photo; returns the instructor profile shape. */
export async function updateInstructorPhoto(
  file: File | null,
): Promise<InstructorProfile> {
  const form = new FormData();
  form.append("profile_photo", file ?? "");
  const res = await apiPatch("/auth/profile/me/", form);
  return extractInstructorProfile(res.data);
}

// Partner institution profile

export async function getMyPartnerProfile(): Promise<MyPartnerProfileResponse> {
  const res = await apiGet<MyPartnerProfileResponse>("/auth/profile/me/");
  return res.data as MyPartnerProfileResponse;
}

/** PATCH response returns the profile directly; GET nests it under `profile`. */
function extractPartnerProfile(data: unknown): PartnerProfile {
  const obj = data as { profile?: PartnerProfile } & Partial<PartnerProfile>;
  return (obj?.profile ?? obj) as PartnerProfile;
}

export async function updatePartnerProfile(
  patch: PartnerProfileUpdate,
): Promise<PartnerProfile> {
  const res = await apiPatch("/auth/profile/me/", patch);
  return extractPartnerProfile(res.data);
}

/**
 * Upload/replace the institution logo and/or cover image.
 * Pass `null` for a field to skip it.
 */
export async function updatePartnerImages(args: {
  logo?: File | null;
  cover_image?: File | null;
}): Promise<PartnerProfile> {
  const form = new FormData();
  if (args.logo !== undefined) form.append("logo", args.logo ?? "");
  if (args.cover_image !== undefined)
    form.append("cover_image", args.cover_image ?? "");
  const res = await apiPatch("/auth/profile/me/", form);
  return extractPartnerProfile(res.data);
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

// Public profiles (no auth required)

/** `GET /auth/profiles/<slug>/` response for a learner. */
export interface PublicLearnerProfile {
  user_type: "learner";
  full_name: string;
  slug: string;
  profile_photo: string | null;
  headline: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  experience_level: string;
  learning_goal: string;
  interests: string[];
  linkedin_url: string;
  github_url: string;
  website_url: string;
  education: Education[];
  work_experience: WorkExperience[];
}

/** A single row from `GET /auth/profiles/learners/` */
export interface PublicLearnerListItem {
  full_name: string;
  slug: string;
  profile_photo: string | null;
  headline: string;
  country: string;
  experience_level: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Fetch a learner's public profile by slug.   */
export async function getPublicLearnerProfile(
  slug: string,
): Promise<PublicLearnerProfile> {
  const res = await apiGet<PublicLearnerProfile>(
    `/auth/profiles/${encodeURIComponent(slug)}/`,
  );
  return res.data as PublicLearnerProfile;
}

export interface BrowseLearnersParams {
  page?: number;
  page_size?: number;
  country?: string;
  experience_level?: string;
}

/** Browse publicly-visible, verified learners (guide §20.1). */
export async function browsePublicLearners(
  params: BrowseLearnersParams = {},
): Promise<PaginatedResponse<PublicLearnerListItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.country) query.set("country", params.country);
  if (params.experience_level)
    query.set("experience_level", params.experience_level);
  const qs = query.toString();
  const res = await apiGet<PaginatedResponse<PublicLearnerListItem>>(
    `/auth/profiles/learners/${qs ? `?${qs}` : ""}`,
  );
  return res.data as PaginatedResponse<PublicLearnerListItem>;
}

/**
 * `GET /auth/profiles/<slug>/` response for an instructor.
 */
export interface PublicInstructorProfile {
  user_type: "instructor";
  full_name: string;
  slug: string;
  profile_photo: string | null;
  headline: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  specialization: string[];
  years_of_experience: number | null;
  current_title: string;
  current_organization: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  is_verified?: boolean;
  education: Education[];
  work_experience: WorkExperience[];
}

/** A single row from `GET /auth/profiles/instructors/`. */
export interface PublicInstructorListItem {
  full_name: string;
  slug: string;
  profile_photo: string | null;
  headline: string;
  country: string;
  specialization: string[];
  is_verified: boolean;
}

/** Fetch an instructor's public profile by slug. */
export async function getPublicInstructorProfile(
  slug: string,
): Promise<PublicInstructorProfile> {
  const res = await apiGet<PublicInstructorProfile>(
    `/auth/profiles/${encodeURIComponent(slug)}/`,
  );
  return res.data as PublicInstructorProfile;
}

export interface BrowseInstructorsParams {
  page?: number;
  page_size?: number;
  country?: string;
  is_verified?: boolean;
}

/** Browse publicly-visible instructors. */
export async function browsePublicInstructors(
  params: BrowseInstructorsParams = {},
): Promise<PaginatedResponse<PublicInstructorListItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.country) query.set("country", params.country);
  if (params.is_verified !== undefined)
    query.set("is_verified", String(params.is_verified));
  const qs = query.toString();
  const res = await apiGet<PaginatedResponse<PublicInstructorListItem>>(
    `/auth/profiles/instructors/${qs ? `?${qs}` : ""}`,
  );
  return res.data as PaginatedResponse<PublicInstructorListItem>;
}
