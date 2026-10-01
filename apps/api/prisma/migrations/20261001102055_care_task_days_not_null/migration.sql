-- AlterTable
ALTER TABLE "care_tasks" ALTER COLUMN "days_of_week" SET DEFAULT ARRAY[]::INTEGER[];

-- Prisma creates scalar lists as nullable, and cardinality(NULL) is NULL, which a CHECK treats as
-- passing: a WEEKLY task with NULL days got through. Require the array in the CHECK itself
-- (a column NOT NULL would be reverted by Prisma's schema diff, which doesn't model it for lists).
UPDATE "care_tasks" SET "days_of_week" = '{}' WHERE "days_of_week" IS NULL AND "recurrence" = 'DAILY';

ALTER TABLE "care_tasks" DROP CONSTRAINT "care_tasks_recurrence_days_check";
ALTER TABLE "care_tasks"
  ADD CONSTRAINT "care_tasks_recurrence_days_check" CHECK (
    "days_of_week" IS NOT NULL
    AND (
      ("recurrence" = 'DAILY' AND cardinality("days_of_week") = 0)
      OR ("recurrence" = 'WEEKLY' AND cardinality("days_of_week") > 0)
    )
  );
