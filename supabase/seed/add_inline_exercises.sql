-- =============================================================================
-- RETROFIT SCRIPT: add_inline_exercises.sql
-- Purpose: Add 6 exercises attached to real content sections (not just the
-- chapter-end "Tambayoyin" section) — matching the book's pin-icon
-- checkpoints, which appear mid-chapter rather than bunched at the end.
-- LessonSections.tsx already renders a section's exercises right after its
-- content, so attaching them here makes them appear inline exactly where
-- the book has them, with no code changes needed.
--
-- These are plain INSERTs (not UPDATEs) since the rows don't exist yet —
-- ON CONFLICT DO NOTHING makes this safe to run more than once, and it's
-- also already baked into seed_kaidoji_book.local.sql for fresh installs.
-- No personal/user IDs in this file, safe to commit.
-- =============================================================================

INSERT INTO exercises (id, section_id, question, exercise_type, correct_answer, options, exercise_order)
VALUES
  -- Babi 1, Gabatar Da Babi Na Ɗaya
  ('70000000-0000-0000-0000-000000000072', '60000000-0000-0000-0000-000000000001',
   $t$Menene furograming?$t$, 'multiple_choice',
   $t$Umarni da kwamfuta za ta aiwatar$t$,
   $t$["Mai rubuta umarni", "Umarni da kwamfuta za ta aiwatar", "Ƙwaƙwalwar kwamfuta"]$t$::jsonb, 1),

  -- Babi 1, Sassan Kwamfuta — matching
  ('70000000-0000-0000-0000-000000000073', '60000000-0000-0000-0000-000000000003',
   $t$Haɗa kowanne kalma da ma'anarsa: Furogiramin, Sashen Sarafar Bayani, Ma'ajin Dindindin, Furogirama.$t$, 'text',
   $t$Furogiramin — Umarnin Da Kwamfuta Ke Aiwatarwa; Sashen Sarafar Bayani — Ƙwaƙwalwar Kwamfuta; Ma'ajin Dindindin — Wurin Adana Umarni; Furogirama — Mai Rubuta Furogiram.$t$,
   NULL, 1),

  -- Babi 3, Amfani Da Are
  ('70000000-0000-0000-0000-000000000074', '60000000-0000-0000-0000-000000000016',
   $t$Ƙirƙiri are mai suna num wanda ke riƙe lambobi masu goyo guda biyar.$t$, 'text',
   $t$Lamba mai goyo num[5]$t$,
   NULL, 1),

  -- Babi 4, Gina Tsarin Yanke Shawara
  ('70000000-0000-0000-0000-000000000075', '60000000-0000-0000-0000-000000000022',
   $t$Idan ana son a kauce wa hanya idan an ga dutse ko kuma rami: idan (an ga dutse ___ rami) — menene ya dace a saka a gurbin?$t$, 'multiple_choice',
   $t$ko$t$,
   $t$["<", "ko", "≥"]$t$::jsonb, 1),
  ('70000000-0000-0000-0000-000000000076', '60000000-0000-0000-0000-000000000022',
   $t$Idan a = 5, b = 6, kuma sharaɗin shi ne idan (!(a != b)) — za a nuna rubutun cikin sharaɗin ("Ina cikin sharaɗin")?$t$, 'text',
   $t$A'a, ba za a nuna ba, domin a != b gaskiya ne (5 ba daidai yake da 6 ba), don haka !(a != b) ya zama ƙarya, kuma tsarin idan ba ya aiwatarwa.$t$,
   NULL, 2),

  -- Babi 4, Tsarin Yanke Shawara Me Maimaitawa
  ('70000000-0000-0000-0000-000000000077', '60000000-0000-0000-0000-000000000023',
   $t$Menene bambancin nesting da kuma haɗa buliyen fiye da ɗaya?$t$, 'text',
   $t$Haɗa buliyen (da/ko) yana duba dukkan sharuɗɗan a lokaci guda don samar da sakamako guda ɗaya, yayin da nesting ke duba sabon sharaɗi ne kawai bayan wani sharaɗin baya ya tabbata gaskiya.$t$,
   NULL, 1)
ON CONFLICT DO NOTHING;
