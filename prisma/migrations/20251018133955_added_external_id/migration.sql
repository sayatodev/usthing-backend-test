/*
  Warnings:

  - A unique constraint covering the columns `[externalId,source]` on the table `Competition` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Competition" ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Competition_externalId_source_key" ON "Competition"("externalId", "source");
