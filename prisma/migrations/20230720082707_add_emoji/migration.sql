-- CreateEnum
CREATE TYPE "Emoji" AS ENUM ('LIKE', 'HELPFUL', 'SMILE', 'SAD');

-- AlterTable
ALTER TABLE "ToiletReviews" ADD COLUMN     "helpul_count" INTEGER,
ADD COLUMN     "like_count" INTEGER,
ADD COLUMN     "sad_count" INTEGER,
ADD COLUMN     "smile_count" INTEGER;

-- CreateTable
CREATE TABLE "ToiletReviewEmoji" (
    "id" SERIAL NOT NULL,
    "toilet_review_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "emoji" "Emoji" NOT NULL,

    CONSTRAINT "ToiletReviewEmoji_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToiletReviewEmoji_toilet_review_id_user_id_key" ON "ToiletReviewEmoji"("toilet_review_id", "user_id");

-- AddForeignKey
ALTER TABLE "ToiletReviewEmoji" ADD CONSTRAINT "ToiletReviewEmoji_toilet_review_id_fkey" FOREIGN KEY ("toilet_review_id") REFERENCES "ToiletReviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToiletReviewEmoji" ADD CONSTRAINT "ToiletReviewEmoji_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
