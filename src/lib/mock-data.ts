import type { Exercise, Program, Trainer } from "./types";

export const mockTrainers: Trainer[] = [
  {
    id: 1,
    name: "Aung Khant",
    slug: "aung-khant",
    bio: "Certified strength & conditioning coach with 8 years of experience helping beginners build lasting habits.",
    specialties: ["Strength", "Fat Loss", "Beginner"],
    programs_count: 4,
  },
  {
    id: 2,
    name: "Su Wai",
    slug: "su-wai",
    bio: "HIIT and mobility specialist. Focuses on home-friendly workouts with minimal equipment.",
    specialties: ["HIIT", "Mobility", "Home Workout"],
    programs_count: 3,
  },
];

export const mockPrograms: Program[] = [
  {
    id: 1,
    title: "Beginner Full-Body Foundations",
    slug: "beginner-full-body-foundations",
    description:
      "A 4-week full-body program designed for complete beginners. 3 days per week, 45 minutes per session.",
    access_type: "free",
    status: "published",
    is_featured: true,
    duration_weeks: 4,
    trainer: mockTrainers[0],
    days_count: 3,
    price: null,
    days: [
      {
        id: 11,
        title: "Day 1 — Lower Body Basics",
        description: "Squat pattern, hinge pattern and core.",
        sort_order: 1,
        exercises: [],
      },
      {
        id: 12,
        title: "Day 2 — Upper Body Basics",
        description: "Push, pull and carry.",
        sort_order: 2,
        exercises: [],
      },
      {
        id: 13,
        title: "Day 3 — Full Body Circuit",
        description: "Conditioning finisher.",
        sort_order: 3,
        exercises: [],
      },
    ],
  },
  {
    id: 2,
    title: "6-Week Shred: Home HIIT",
    slug: "6-week-shred-home-hiit",
    description:
      "High-intensity home program with dumbbell-only options. Burn fat and build conditioning in 30 minutes.",
    access_type: "premium",
    status: "published",
    is_featured: true,
    duration_weeks: 6,
    trainer: mockTrainers[1],
    days_count: 4,
    price: { id: 1, amount: 45000, currency: "MMK", formatted: "45,000 MMK" },
  },
  {
    id: 3,
    title: "Barbell Strength Builder",
    slug: "barbell-strength-builder",
    description:
      "Classic progressive overload program for squat, bench, deadlift and overhead press.",
    access_type: "premium",
    status: "published",
    duration_weeks: 8,
    trainer: mockTrainers[0],
    days_count: 4,
    price: { id: 2, amount: 65000, currency: "MMK", formatted: "65,000 MMK" },
  },
];

export const mockExercises: Exercise[] = [
  {
    id: 1,
    name: "Goblet Squat",
    slug: "goblet-squat",
    description: "A beginner-friendly squat variation holding a dumbbell at the chest.",
    instructions: "1. Hold dumbbell at chest.\n2. Sit hips back and down.\n3. Drive through heels to stand.",
    access_type: "free",
    status: "published",
    primary_muscle_group: { id: 1, name: "Quadriceps", slug: "quadriceps" },
  },
  {
    id: 2,
    name: "Romanian Deadlift",
    slug: "romanian-deadlift",
    description: "Hinge pattern builder for glutes and hamstrings.",
    access_type: "premium",
    status: "published",
    primary_muscle_group: { id: 2, name: "Hamstrings", slug: "hamstrings" },
  },
  {
    id: 3,
    name: "Push-Up",
    slug: "push-up",
    description: "Foundational horizontal push movement.",
    access_type: "free",
    status: "published",
    primary_muscle_group: { id: 3, name: "Chest", slug: "chest" },
  },
];
