-- CreateTable
CREATE TABLE "Priorities" (
    "idPriorities" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT,
    "date" TEXT NOT NULL,

    CONSTRAINT "Priorities_pkey" PRIMARY KEY ("idPriorities")
);
