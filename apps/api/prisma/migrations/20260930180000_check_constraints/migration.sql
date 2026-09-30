-- Database-level invariants. Zod validates at the API edge; these CHECKs are the last line of
-- defence against bugs, scripts and manual SQL. Prisma can't declare CHECK constraints in
-- schema.prisma, so they live only in migrations (Prisma leaves them alone when diffing).

-- Age is optional but never negative or absurd.
ALTER TABLE "pets"
  ADD CONSTRAINT "pets_age_years_check" CHECK ("age_years" IS NULL OR "age_years" BETWEEN 0 AND 50);

-- Minutes since midnight.
ALTER TABLE "care_tasks"
  ADD CONSTRAINT "care_tasks_time_of_day_check" CHECK ("time_of_day" BETWEEN 0 AND 1439);

-- Days are 0 (Sun) .. 6 (Sat).
ALTER TABLE "care_tasks"
  ADD CONSTRAINT "care_tasks_days_of_week_check" CHECK ("days_of_week" <@ ARRAY[0, 1, 2, 3, 4, 5, 6]);

-- Daily tasks carry no days; weekly tasks carry at least one.
ALTER TABLE "care_tasks"
  ADD CONSTRAINT "care_tasks_recurrence_days_check" CHECK (
    ("recurrence" = 'DAILY' AND cardinality("days_of_week") = 0)
    OR ("recurrence" = 'WEEKLY' AND cardinality("days_of_week") > 0)
  );

-- Uniqueness of email relies on normalised (lower-case) storage.
ALTER TABLE "users"
  ADD CONSTRAINT "users_email_lowercase_check" CHECK ("email" = lower("email"));

-- Nobody invites themselves.
ALTER TABLE "invitations"
  ADD CONSTRAINT "invitations_not_self_check" CHECK ("inviter_id" <> "invitee_id");
