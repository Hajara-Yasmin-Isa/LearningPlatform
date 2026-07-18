-- =============================================================================
-- RETROFIT SCRIPT: add_how_to_use_section.sql
-- Purpose: Add the "How to use this book" section from the original PDF
-- (Yadda Za Ayi Amfani Da Littafin) as a new first section in Lesson 1,
-- adapted to describe what the platform actually does (inline exercises
-- with instant checkmark feedback, saved progress) rather than the book's
-- print-only concepts that don't apply here (a printed glossary, a
-- separate answer-key section at the back).
--
-- The explanation of the 💡/📓/📍 icons embeds real [[tip:]]/[[note:]]/
-- [[check:]] markers, so students can click each one while reading what
-- it does — the section demonstrates itself.
--
-- section_order = 0 so it sorts before the existing "Gabatar Da Babi Na
-- Ɗaya" (order 1) without needing to renumber any existing rows.
--
-- Plain INSERT since this row doesn't exist yet — ON CONFLICT DO NOTHING
-- makes it safe to run more than once, and it's already baked into
-- seed_kaidoji_book.local.sql for fresh installs. No personal/user IDs in
-- this file, safe to commit.
-- =============================================================================

INSERT INTO sections (id, lesson_id, title, content, section_order)
VALUES
  (
    '60000000-0000-0000-0000-000000000036',
    '50000000-0000-0000-0000-000000000001',
    $t$Yadda Za A Yi Amfani Da Wannan Darasi$t$,
    $t$Kafin ku fara, ga taƙaitaccen bayani kan yadda ake amfani da wannan darasi.

Bayan an gabatar da sabon batu, sau da yawa za a ba da misali domin ƙarin bayani. A cikin rubutun, za ku ga alamomi masu launi da za ku iya danna su domin ganin ƙarin bayani — gwada danna su yanzu: [[tip:Wannan alamar (💡) tana nuna muhimman bayanai ko ƙa'idoji da suka cancanci a tuna da su.]] [[note:Wannan alamar (📓) tana ɗauke da ƙarin shawarwari daga marubuciyar littafin.]] [[check:Wannan alamar (📍) tana gayyatar ku ku tsaya ku yi tunani kafin ku ci gaba.]]

Wasu sassan darussan suna da tambayoyi a ciki. Idan kuka amsa daidai, za ku ga alamar ✓ nan take, kuma dole ne ku amsa kafin ku ci gaba zuwa sashe na gaba. A ƙarshen kowane babi, akwai ƙarin tambayoyi don gwada dukkan abin da kuka koya a wannan babin.

Ba lallai ne ku kammala babi guda a zama ɗaya ba — ci gaban ku ana adana shi kai tsaye bayan kowane sashe, don haka za ku iya komawa daga inda kuka tsaya a duk lokacin da kuka sake shiga.$t$,
    0
  )
ON CONFLICT DO NOTHING;
