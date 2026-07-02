# Survey Question Changelog

## How to update survey questions

1. Edit the question strings in `src/phases/PhaseSurveyPre.tsx` or `src/phases/PhaseSurveyPost.tsx`
2. Update **all three languages** (zh, ja, en) — they must stay in sync
3. Increment `SURVEY_VERSION` in `src/services/survey.ts`
4. Add an entry below describing what changed and why
5. Run a new migration if the meaning of a field changed significantly (rare — usually just update this file)

> **Why this matters:** sessions only store the answer (e.g. `3` or `'B'`), not the question text.
> Without version tracking, you can't tell which question a historical answer belongs to.

## How to add/change database columns

1. Create a new file in `db/migrations/` — e.g. `004_add_new_column.sql`
2. Run migrations: `POSTGRES_URL=<connection-string> npx tsx db/migrate.ts`
3. Reload PostgREST schema cache — in Supabase SQL Editor run: `NOTIFY pgrst, 'reload schema';`
4. Run smoke tests to confirm the API works end-to-end:
   ```
   BASE_URL=https://plasticraft.vercel.app ADMIN_PASSWORD=<password> npx tsx db/smoke-test.ts
   ```
5. All 8 checks must pass before deploying

> **Why this matters:** PostgREST caches the DB schema and won't see new columns until notified.
> The smoke test catches this (and other API failures) before users do.

---

## Version 1 — 2026-04-25 (initial)

### Pre-survey
| Field | Question (EN) |
|-------|--------------|
| q1_sort_habit | How often do you sort your rubbish at home? (1–5) |
| q2_seen_marks | Have you seen recycling marks on plastic before? (A=Yes, B=Not yet) |
| q3_cap_behavior | What do you do with bottle caps? (A=Keep on, B=Separate, C=Not sure) |

### Post-survey
| Field | Question (EN) |
|-------|--------------|
| p1_cap_material | What material are bottle caps and straws made of? (A=PET, B=PP ✓) |
| p2_mix_result | What happens if PET and PP are recycled together? (A=Stronger, B=Breaks ✓) |
| p3_ai_interest | After the AI made you a cool picture, did you want to learn more about waste and recycling? (1–5) |
| p4_ai_clarity | Was the AI's picture a helpful hint for making your car? (1–5) |
| p5_ai_achievement | Seeing your trash become something awesome — did you feel proud? (1–5) |
| p6_sort_intention | From now on, will you look for the marks and sort your rubbish at home? (1–5) |
| p7_fun | How fun was today's workshop? (1–5) |

## Version 2 — 2026-07-02

### Post-survey
| Field | Question (EN) |
|-------|--------------|
| p8_more_types_interest | After this workshop, would you like to learn more about what other types of plastic can be used for? (1–5) |

Added a new Action question (p8) asking whether the workshop made the child want to learn about other plastic types. No existing fields changed.
