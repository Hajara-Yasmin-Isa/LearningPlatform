-- Add compound index on user_progress(user_id, lesson_id).
-- Queries that filter by both columns (getUserProgress, checkAndMarkLessonComplete,
-- getCompletedSectionsForLesson) currently do a per-user scan then filter in memory.
-- This index makes those lookups O(log n) instead of O(n).

CREATE INDEX IF NOT EXISTS idx_progress_user_lesson
  ON user_progress(user_id, lesson_id);
