/*
  Warnings:

  - The values [MEME1,MEME2] on the enum `Symbols` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Symbols_new" AS ENUM ('SAMA', 'MUKS', 'HKRT', 'PAAJI');
ALTER TABLE "trades" ALTER COLUMN "symbol" TYPE "Symbols_new" USING ("symbol"::text::"Symbols_new");
ALTER TABLE "symbols" ALTER COLUMN "symbol" TYPE "Symbols_new" USING ("symbol"::text::"Symbols_new");
ALTER TYPE "Symbols" RENAME TO "Symbols_old";
ALTER TYPE "Symbols_new" RENAME TO "Symbols";
DROP TYPE "public"."Symbols_old";
COMMIT;
