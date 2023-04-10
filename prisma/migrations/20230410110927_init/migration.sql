/*
  Warnings:

  - You are about to drop the `Reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ToiletType" AS ENUM ('INSIDE', 'OUTSIDE');

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_userId_fkey";

-- DropTable
DROP TABLE "Reviews";

-- CreateTable
CREATE TABLE "SimpleReviews" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "description" TEXT,
    "stars" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SimpleReviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedReviews" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isUnisex" BOOLEAN,
    "type" "ToiletType",
    "description" TEXT,

    CONSTRAINT "DetailedReviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SimpleReviews" ADD CONSTRAINT "SimpleReviews_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimpleReviews" ADD CONSTRAINT "SimpleReviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailedReviews" ADD CONSTRAINT "DetailedReviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailedReviews" ADD CONSTRAINT "DetailedReviews_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
