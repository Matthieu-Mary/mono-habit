/*
  Warnings:

  - You are about to drop the column `endDate` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `Habit` table. All the data in the column will be lost.
  - Added the required column `status` to the `HabitLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('UNSCHEDULED', 'PENDING', 'COMPLETED', 'MISSED');

-- DropForeignKey
ALTER TABLE "Habit" DROP CONSTRAINT "Habit_userId_fkey";

-- DropIndex
DROP INDEX "Habit_userId_idx";

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "endDate",
DROP COLUMN "frequency",
DROP COLUMN "isArchived";

-- AlterTable
ALTER TABLE "HabitLog" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "status" "Status" NOT NULL;

-- DropEnum
DROP TYPE "Frequency";

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
