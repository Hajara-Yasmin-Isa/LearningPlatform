# Lesson Exercises & Progress Tracking

Exercise UI components and Supabase query functions for fetching lesson content and saving student progress.

---

## How to Run

```bash
npm run dev
```

Visit `http://localhost:3000`. These components render inside the lesson viewer — there is no standalone entry point.

---

## Query Functions (`lib/supabase/lessons.ts`)

### `getLessonWithSections(lessonId) → LessonWithSections | null`
Fetches a lesson with all sections and exercises nested. Sorted by `section_order` and `exercise_order`.

### `getUserProgress(userId, lessonId) → UserProgress[]`
Returns all progress rows for the user and lesson — one per completed section.

### `markSectionComplete(userId, lessonId, sectionId) → void`
Upserts a `UserProgress` row with `completed: true`. Safe to call more than once.

---

## Components

### `ExerciseBlock.tsx`
Routes to the correct exercise component based on `exercise_type`. Shows "Correct!" on success, "Try again" on failure — never reveals the answer. After a failed attempt (never before the first try) it also renders `AskMalamiButton`, which links to `/malami?exerciseId=…&userAnswer=…` so the learner can hand that attempt to Malami. The button renders nothing when `NEXT_PUBLIC_MALAMI` is off.

| Prop | Type |
|------|------|
| `exercise` | `Exercise` |
| `onComplete` | `() => void` |

Each exercise component accepts an optional `onFailedAttempt?: (userAnswer: string) => void`, fired when an attempt is graded wrong (for self-check text answers, when the learner retries after seeing the model answer; for code, when tests fail but not when the runner is unreachable). `ExerciseBlock` uses it to decide when the Malami button appears.

### `MultipleChoiceExercise.tsx`
Renders options as buttons. Case-sensitive comparison against `correct_answer`.

### `TextExercise.tsx`
Text input. Case-insensitive comparison against `correct_answer`. Enter key submits.

---

## Assumptions

- `onComplete` fires once — exercise locks after a correct answer.
- `markSectionComplete` is called by the Card A parent (`SectionContent`) once all exercises in a section are complete.
- Table name is assumed to be `user_progress`. If the migration uses a different name, queries will silently return empty data.
- `user_progress` must have a unique constraint on `(user_id, lesson_id, section_id)` for the upsert to work — confirm this exists in the migration.
