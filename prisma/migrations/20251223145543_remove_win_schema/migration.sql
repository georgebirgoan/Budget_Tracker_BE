/*
  Warnings:

  - You are about to drop the `actiuni_2025_12` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oferte_2025` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "actiuni_2025_12" DROP CONSTRAINT "actiuni_2025_12_codunicoferta_fkey";

-- DropTable
DROP TABLE "actiuni_2025_12";

-- DropTable
DROP TABLE "oferte_2025";
