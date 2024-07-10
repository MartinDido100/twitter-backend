/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Reaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt";
