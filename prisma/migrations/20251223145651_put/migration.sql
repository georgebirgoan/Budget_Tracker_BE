-- CreateTable
CREATE TABLE "oferte_2025" (
    "codunicoferta" INTEGER NOT NULL,
    "creatin" INTEGER NOT NULL,
    "codintern" INTEGER NOT NULL,
    "creatde" TEXT NOT NULL,
    "idunicclient" INTEGER NOT NULL,
    "idunicoferta" INTEGER NOT NULL,
    "inregistratde" TEXT NOT NULL,
    "container" TEXT NOT NULL,
    "nume" TEXT NOT NULL,
    "nroferta" INTEGER NOT NULL,
    "datacreare" TIMESTAMP(3) NOT NULL,
    "datainregistrare" TIMESTAMP(3) NOT NULL,
    "datamodificare" TIMESTAMP(3) NOT NULL,
    "datalivrare" TIMESTAMP(3) NOT NULL,
    "datamontaj" TIMESTAMP(3) NOT NULL,
    "totalsuprafata" INTEGER,
    "totalferestreusi" INTEGER,
    "totalferestre" INTEGER,
    "totalusi" INTEGER,
    "totalusibalcon" INTEGER,
    "totaltermopane" INTEGER,
    "totalpaneluri" INTEGER,
    "totalpret" INTEGER,
    "culoare" TEXT,

    CONSTRAINT "oferte_2025_pkey" PRIMARY KEY ("codunicoferta")
);

-- CreateTable
CREATE TABLE "actiuni_2025_12" (
    "nrinreg" INTEGER NOT NULL,
    "codunicoferta" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "actiune" TEXT NOT NULL,
    "coduniccomanda" INTEGER NOT NULL,
    "idunicoferta" INTEGER NOT NULL,
    "numefisier" TEXT NOT NULL,
    "obs" TEXT NOT NULL,

    CONSTRAINT "actiuni_2025_12_pkey" PRIMARY KEY ("nrinreg")
);

-- CreateIndex
CREATE UNIQUE INDEX "oferte_2025_creatin_key" ON "oferte_2025"("creatin");

-- CreateIndex
CREATE INDEX "oferte_2025_codintern_idx" ON "oferte_2025"("codintern");

-- CreateIndex
CREATE INDEX "oferte_2025_creatde_idx" ON "oferte_2025"("creatde");

-- CreateIndex
CREATE INDEX "oferte_2025_creatin_idx" ON "oferte_2025"("creatin");

-- CreateIndex
CREATE INDEX "oferte_2025_idunicclient_idx" ON "oferte_2025"("idunicclient");

-- CreateIndex
CREATE INDEX "oferte_2025_idunicoferta_idx" ON "oferte_2025"("idunicoferta");

-- CreateIndex
CREATE INDEX "actiuni_2025_12_nrinreg_idx" ON "actiuni_2025_12"("nrinreg");

-- AddForeignKey
ALTER TABLE "actiuni_2025_12" ADD CONSTRAINT "actiuni_2025_12_codunicoferta_fkey" FOREIGN KEY ("codunicoferta") REFERENCES "oferte_2025"("codunicoferta") ON DELETE RESTRICT ON UPDATE CASCADE;
