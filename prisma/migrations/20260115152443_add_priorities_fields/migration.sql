/*
  Warnings:

  - Added the required column `monthKey` to the `Priorities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Priorities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Priorities" ADD COLUMN     "monthKey" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Priorities_userId_monthKey_category_order_idx" ON "Priorities"("userId", "monthKey", "category", "order");
