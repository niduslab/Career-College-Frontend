export type UserType = "learner" | "instructor" | "partner_institution";

export type InstitutionType = "university" | "college" | "school" | "training_center" | "other";

export interface SignUpFormData {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
  user_type: UserType;
  institution_name?: string;
  institution_type?: InstitutionType;
}

export interface LoginFormData {
  email: string;
  password: string;
  user_type: UserType;
}
