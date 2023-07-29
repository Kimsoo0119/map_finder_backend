/*
  Warnings:

  - You are about to drop the column `category` on the `Places` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `Places` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Places" DROP COLUMN "category",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "PlaceCategories" (
    "id" SERIAL NOT NULL,
    "main" TEXT NOT NULL,
    "sub" TEXT,

    CONSTRAINT "PlaceCategories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaceCategories_main_sub_key" ON "PlaceCategories"("main", "sub");

-- AddForeignKey
ALTER TABLE "Places" ADD CONSTRAINT "Places_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "PlaceCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
