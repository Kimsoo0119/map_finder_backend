/*
  Warnings:

  - You are about to drop the column `type` on the `DetailedReviews` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ToiletLocation" AS ENUM ('INSIDE', 'OUTSIDE');

-- AlterTable
ALTER TABLE "DetailedReviews" DROP COLUMN "type",
ADD COLUMN     "location" "ToiletLocation";

-- DropEnum
DROP TYPE "ToiletType";
