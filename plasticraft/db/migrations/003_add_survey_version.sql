-- Track which version of survey questions each session used.
-- Increment SURVEY_VERSION in src/services/survey.ts whenever questions change.
-- See db/SURVEY_CHANGELOG.md for the full version history.
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS survey_version smallint NOT NULL DEFAULT 1;
