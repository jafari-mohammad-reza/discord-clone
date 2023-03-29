/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel"
    ADD COLUMN "categoryId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Category"
(
    "id"    TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_title_key" ON "Category" ("title");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_title_key" ON "Channel" ("title");

-- AddForeignKey
ALTER TABLE "Channel"
    ADD CONSTRAINT "Channel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
