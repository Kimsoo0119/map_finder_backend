/*
  Warnings:

  - A unique constraint covering the columns `[reporter_id,target_user_id]` on the table `Reports` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reporter_id,target_toilet_review_id]` on the table `Reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reports_reporter_id_target_user_id_key" ON "Reports"("reporter_id", "target_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Reports_reporter_id_target_toilet_review_id_key" ON "Reports"("reporter_id", "target_toilet_review_id");
