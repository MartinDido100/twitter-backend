/*
  Warnings:

  - Added the required column `postType` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "postType" AS ENUM ('POST', 'COMMENT');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "parentId" UUID,
ADD COLUMN     "postType" "postType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
