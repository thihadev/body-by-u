export type AccessType = "free" | "premium";
export type ContentStatus = "draft" | "published" | "archived";

export interface Trainer {
  id: number;
  name: string;
  slug?: string;
  bio?: string;
  avatar_url?: string;
  avatar?: string;
  specialties?: string[];
  social_links?: Record<string, string>;
  programs_count?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Difficulty {
  id: number;
  name: string;
  slug: string;
  level: number;
}

export interface MuscleGroup {
  id: number;
  name: string;
  slug: string;
}

export interface ExerciseVariant {
  id: number;
  name: string;
  description?: string;
  video_id?: number;
  sort_order: number;
}

export interface Video {
  id: number;
  title: string;
  provider: "vimeo" | "bunny" | "youtube";
  external_id: string;
  playback_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  access_type: AccessType;
  is_locked?: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  slug: string;
  description?: string;
  instructions?: string;
  thumbnail_url?: string;
  thumbnail?: string;
  access_type?: AccessType;
  status: ContentStatus;
  primary_muscle_group?: MuscleGroup;
  muscle_groups?: MuscleGroup[];
  category?: Category;
  difficulty?: Difficulty;
  variants?: ExerciseVariant[];
  videos?: Video[];
}

export interface ProgramDayExercise {
  id: number;
  exercise: Exercise;
  sets?: number;
  reps?: string;
  rest_seconds?: number;
  notes?: string;
  sort_order: number;
}

export interface ProgramDay {
  id: number;
  title?: string;
  day_number?: number;
  description?: string;
  sort_order: number;
  is_rest_day?: boolean;
  exercises_count?: number;
  exercises?: ProgramDayExercise[];
}

/** Single workout item inside a day (backend ProgramDayResource). */
export interface DayExerciseItem {
  id: number;
  sort_order: number;
  sets?: number | null;
  reps?: number | null;
  duration_seconds?: number | null;
  rest_seconds?: number | null;
  notes?: string | null;
  is_free_preview: boolean;
  is_locked: boolean;
  variant?: { id: number; name?: string } | null;
  exercise?: {
    id: number;
    name: string;
    slug: string;
    thumbnail?: string;
    primary_muscle_group?: { id: number; name: string } | null;
  } | null;
  video_id?: number | null;
}

export interface ProgramDayDetail {
  id: number;
  program_id: number;
  program_slug: string;
  program_title: string;
  day_number: number;
  title?: string | null;
  description?: string | null;
  is_rest_day: boolean;
  has_access: boolean;
  exercises: DayExerciseItem[];
}

export interface Program {
  id: number;
  name?: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  thumbnail?: string;
  access_type: AccessType;
  status: ContentStatus;
  is_featured?: boolean;
  duration_weeks?: number;
  trainer?: Trainer;
  category?: Category;
  difficulty?: Difficulty;
  days?: ProgramDay[];
  days_count?: number;
  // Present in local mocks / legacy payloads only.
  price?: Price | null;
}

export interface Price {
  id: number;
  amount: number | string;
  currency: string;
  type?: string;
  formatted?: string;
}

export type UserProgramStatus =
  | "not_started"
  | "active"
  | "paused"
  | "completed"
  | "abandoned";

export interface UserProgram {
  id: number;
  status: UserProgramStatus;
  started_at?: string | null;
  completed_at?: string | null;
  program: Program;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  amount: number | string;
  currency: string;
  interval: "monthly" | "yearly" | string;
  is_active: boolean;
}

/** An admin-managed payment method (e.g. KB Pay, Wave Pay) with its QR code. */
export interface PaymentMethod {
  id: number;
  name: string;
  slug: string;
  account_name: string | null;
  account_number: string | null;
  logo_url: string | null;
  qr_url: string | null;
  sort_order: number;
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "expired";

export interface Subscription {
  id: number;
  subscription_plan_id: number;
  status: SubscriptionStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  canceled_at?: string | null;
  plan?: SubscriptionPlan;
}

export type TransactionStatus =
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "refunded";

/** A manual payment for a subscription plan, reviewed by the team. */
export interface Transaction {
  id: number;
  subscription_plan_id: number;
  plan?: SubscriptionPlan;
  status: TransactionStatus;
  amount: number | string;
  currency: string;
  payment_method?: string;
  payment_reference?: string | null;
  screenshot_path?: string | null;
  payer_name?: string | null;
  payer_phone?: string | null;
  admin_notes?: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  href?: string;
  read: boolean;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Paginated<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
