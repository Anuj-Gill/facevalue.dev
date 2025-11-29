-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UP', 'DOWN');

-- CreateTable
CREATE TABLE "coin_suggestions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coin_name" TEXT NOT NULL,
    "ceo_name" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_votes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "suggestion_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coin_suggestions_coin_name_key" ON "coin_suggestions"("coin_name");

-- CreateIndex
CREATE UNIQUE INDEX "coin_suggestions_ceo_name_key" ON "coin_suggestions"("ceo_name");

-- CreateIndex
CREATE UNIQUE INDEX "coin_votes_suggestion_id_user_id_key" ON "coin_votes"("suggestion_id", "user_id");

-- AddForeignKey
ALTER TABLE "coin_votes" ADD CONSTRAINT "coin_votes_suggestion_id_fkey" FOREIGN KEY ("suggestion_id") REFERENCES "coin_suggestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
