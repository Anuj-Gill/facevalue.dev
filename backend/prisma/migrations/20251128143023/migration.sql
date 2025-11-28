-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'bot');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';
