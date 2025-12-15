-- DropIndex
DROP INDEX "Session_refreshToken_key";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "refreshToken" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Test" (
    "testId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("testId")
);
