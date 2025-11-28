/*
  Warnings:

  - Changed the type of `symbol` on the `symbols` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `symbol` on the `trades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `provider` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('system', 'google');

-- CreateEnum
CREATE TYPE "Symbols" AS ENUM ('MEME1', 'MEME2');

-- AlterTable
ALTER TABLE "symbols" DROP COLUMN "symbol",
ADD COLUMN     "symbol" "Symbols" NOT NULL;

-- AlterTable
ALTER TABLE "trades" DROP COLUMN "symbol",
ADD COLUMN     "symbol" "Symbols" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "wallet_balance" INTEGER NOT NULL DEFAULT 1000,
DROP COLUMN "provider",
ADD COLUMN     "provider" "Provider" NOT NULL;

-- CreateTable
CREATE TABLE "holdings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "symbol_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "avg_price" INTEGER NOT NULL,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "symbols_symbol_key" ON "symbols"("symbol");

-- CreateIndex
CREATE INDEX "trades_symbol_idx" ON "trades"("symbol");
