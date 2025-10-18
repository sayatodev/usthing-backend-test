/*
  Warnings:

  - Added the required column `normalizedTitle` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Competition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL,
    "url" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Competition" ("createdAt", "externalId", "id", "source", "title", "updatedAt", "url") SELECT "createdAt", "externalId", "id", "source", "title", "updatedAt", "url" FROM "Competition";
DROP TABLE "Competition";
ALTER TABLE "new_Competition" RENAME TO "Competition";
CREATE INDEX "Competition_createdAt_idx" ON "Competition"("createdAt");
CREATE UNIQUE INDEX "Competition_externalId_source_key" ON "Competition"("externalId", "source");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
