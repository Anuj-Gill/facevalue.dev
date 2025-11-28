/*
  Warnings:

  - A unique constraint covering the columns `[user_id,symbol_id]` on the table `holdings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "holdings_user_id_symbol_id_key" ON "holdings"("user_id", "symbol_id");

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_symbol_id_fkey" FOREIGN KEY ("symbol_id") REFERENCES "symbols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
