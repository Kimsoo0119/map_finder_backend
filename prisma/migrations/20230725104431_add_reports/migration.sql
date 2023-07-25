-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('USER', 'TOILET_REVIEW');

-- CreateEnum
CREATE TYPE "Reason" AS ENUM ('INAPPROPRIATE_NICKNAME', 'INAPPROPRIATE_CONTENT', 'CONTAINS_PROFANITY', 'HARASSMENT', 'SPAM', 'OTHER');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "is_suspended" BOOLEAN,
ADD COLUMN     "report_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "suspension_end_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Reports" (
    "id" SERIAL NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "target_user_id" INTEGER,
    "target_toilet_review_id" INTEGER,
    "reason" "Reason" NOT NULL,
    "description" TEXT,

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_target_toilet_review_id_fkey" FOREIGN KEY ("target_toilet_review_id") REFERENCES "ToiletReviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;
