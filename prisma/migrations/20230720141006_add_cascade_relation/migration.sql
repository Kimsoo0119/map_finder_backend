/*
  Warnings:

  - Made the column `like_count` on table `ToiletReviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sad_count` on table `ToiletReviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `smile_count` on table `ToiletReviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `helpful_count` on table `ToiletReviews` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Authentication" DROP CONSTRAINT "Authentication_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ToiletReviewEmoji" DROP CONSTRAINT "ToiletReviewEmoji_toilet_review_id_fkey";

-- DropForeignKey
ALTER TABLE "ToiletReviewEmoji" DROP CONSTRAINT "ToiletReviewEmoji_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ToiletReviews" DROP CONSTRAINT "ToiletReviews_user_id_fkey";

-- AlterTable
ALTER TABLE "ToiletReviews" ALTER COLUMN "like_count" SET NOT NULL,
ALTER COLUMN "like_count" SET DEFAULT 0,
ALTER COLUMN "sad_count" SET NOT NULL,
ALTER COLUMN "sad_count" SET DEFAULT 0,
ALTER COLUMN "smile_count" SET NOT NULL,
ALTER COLUMN "smile_count" SET DEFAULT 0,
ALTER COLUMN "helpful_count" SET NOT NULL,
ALTER COLUMN "helpful_count" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Authentication" ADD CONSTRAINT "Authentication_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToiletReviews" ADD CONSTRAINT "ToiletReviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToiletReviewEmoji" ADD CONSTRAINT "ToiletReviewEmoji_toilet_review_id_fkey" FOREIGN KEY ("toilet_review_id") REFERENCES "ToiletReviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToiletReviewEmoji" ADD CONSTRAINT "ToiletReviewEmoji_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
