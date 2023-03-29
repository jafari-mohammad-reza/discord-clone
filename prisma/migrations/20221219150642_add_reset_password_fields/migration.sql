-- AlterTable
ALTER TABLE "User"
    ADD COLUMN "lastResetPasswordAttempt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordAttempt" INTEGER NOT NULL DEFAULT 0;
