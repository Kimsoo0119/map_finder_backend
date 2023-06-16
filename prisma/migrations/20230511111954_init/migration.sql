/*
  Warnings:

  - Added the required column `updatedAt` to the `DetailedReviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SimpleReviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nickname` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetailedReviews" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Places" ADD COLUMN     "thumUrl" TEXT;

-- AlterTable
ALTER TABLE "SimpleReviews" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "nickname" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;
