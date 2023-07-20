/*
  Warnings:

  - You are about to drop the column `helpul_count` on the `ToiletReviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ToiletReviews" DROP COLUMN "helpul_count",
ADD COLUMN     "helpful_count" INTEGER;
