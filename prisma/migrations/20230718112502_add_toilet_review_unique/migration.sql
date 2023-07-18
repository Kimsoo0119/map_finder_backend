/*
  Warnings:

  - You are about to drop the column `failedCount` on the `Authentication` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Authentication` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `NaverReviews` table. All the data in the column will be lost.
  - You are about to drop the column `naverPlaceId` on the `Places` table. All the data in the column will be lost.
  - You are about to drop the column `naverReviewerCounts` on the `Places` table. All the data in the column will be lost.
  - You are about to drop the column `naverStars` on the `Places` table. All the data in the column will be lost.
  - You are about to drop the column `regionId` on the `Places` table. All the data in the column will be lost.
  - You are about to drop the column `thumUrl` on the `Places` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `DetailedReviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SimpleReviews` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Authentication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nickname]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Authentication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_id` to the `NaverReviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sign_up_type` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SignUpType" AS ENUM ('LOCAL', 'KAKAO', 'GOOGLE', 'NAVER');

-- DropForeignKey
ALTER TABLE "Authentication" DROP CONSTRAINT "Authentication_userId_fkey";

-- DropForeignKey
ALTER TABLE "DetailedReviews" DROP CONSTRAINT "DetailedReviews_placeId_fkey";

-- DropForeignKey
ALTER TABLE "DetailedReviews" DROP CONSTRAINT "DetailedReviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "NaverReviews" DROP CONSTRAINT "NaverReviews_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Places" DROP CONSTRAINT "Places_regionId_fkey";

-- DropForeignKey
ALTER TABLE "SimpleReviews" DROP CONSTRAINT "SimpleReviews_placeId_fkey";

-- DropForeignKey
ALTER TABLE "SimpleReviews" DROP CONSTRAINT "SimpleReviews_userId_fkey";

-- DropIndex
DROP INDEX "Authentication_userId_key";

-- AlterTable
ALTER TABLE "Authentication" DROP COLUMN "failedCount",
DROP COLUMN "userId",
ADD COLUMN     "failed_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "NaverReviews" DROP COLUMN "placeId",
ADD COLUMN     "place_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Places" DROP COLUMN "naverPlaceId",
DROP COLUMN "naverReviewerCounts",
DROP COLUMN "naverStars",
DROP COLUMN "regionId",
DROP COLUMN "thumUrl",
ADD COLUMN     "naver_place_id" TEXT,
ADD COLUMN     "naver_reviewer_counts" TEXT,
ADD COLUMN     "naver_stars" TEXT,
ADD COLUMN     "region_id" INTEGER,
ADD COLUMN     "thum_url" TEXT;

-- AlterTable
ALTER TABLE "Regions" ALTER COLUMN "district" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sign_up_type" "SignUpType" NOT NULL;

-- DropTable
DROP TABLE "DetailedReviews";

-- DropTable
DROP TABLE "SimpleReviews";

-- CreateTable
CREATE TABLE "ToiletReviews" (
    "id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "stars" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_unisex" BOOLEAN,
    "description" TEXT,
    "visited_at" TIMESTAMP(3),
    "location" "LocationType",

    CONSTRAINT "ToiletReviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToiletReviews_place_id_user_id_key" ON "ToiletReviews"("place_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_user_id_key" ON "Authentication"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_nickname_key" ON "Users"("nickname");

-- AddForeignKey
ALTER TABLE "Places" ADD CONSTRAINT "Places_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NaverReviews" ADD CONSTRAINT "NaverReviews_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authentication" ADD CONSTRAINT "Authentication_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToiletReviews" ADD CONSTRAINT "ToiletReviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToiletReviews" ADD CONSTRAINT "ToiletReviews_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
