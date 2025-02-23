-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('SPORT', 'SANTE', 'TRAVAIL', 'LOISIRS');

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'LOISIRS';
