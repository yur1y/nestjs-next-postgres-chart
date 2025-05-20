-- CreateTable
CREATE TABLE "Vessel" (
    "id" SERIAL NOT NULL,
    "imoNo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "vesselType" INTEGER NOT NULL,

    CONSTRAINT "Vessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPReference" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "vesselTypeId" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "traj" TEXT NOT NULL,
    "a" DOUBLE PRECISION NOT NULL,
    "b" DOUBLE PRECISION NOT NULL,
    "c" DOUBLE PRECISION NOT NULL,
    "d" DOUBLE PRECISION NOT NULL,
    "e" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PPReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emission" (
    "id" SERIAL NOT NULL,
    "vesselId" INTEGER NOT NULL,
    "logId" BIGINT NOT NULL,
    "fromUtc" TIMESTAMP(3) NOT NULL,
    "toUtc" TIMESTAMP(3) NOT NULL,
    "totT2wco2" DOUBLE PRECISION NOT NULL,
    "totW2wco2" DOUBLE PRECISION NOT NULL,
    "aerco2T2w" DOUBLE PRECISION NOT NULL,
    "aerco2eW2w" DOUBLE PRECISION NOT NULL,
    "eeoico2eW2w" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_imoNo_key" ON "Vessel"("imoNo");

-- CreateIndex
CREATE INDEX "Emission_toUtc_idx" ON "Emission"("toUtc");

-- AddForeignKey
ALTER TABLE "Emission" ADD CONSTRAINT "Emission_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
