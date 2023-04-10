/*
  Warnings:

  - The `location` column on the `DetailedReviews` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('INSIDE', 'OUTSIDE');

-- AlterTable
ALTER TABLE "DetailedReviews" DROP COLUMN "location",
ADD COLUMN     "location" "LocationType";

-- DropEnum
DROP TYPE "ToiletLocation";
