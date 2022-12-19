/*
  Warnings:

  - You are about to drop the `Cahnnel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cahnnel" DROP CONSTRAINT "Cahnnel_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_channelId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnChannel" DROP CONSTRAINT "UserOnChannel_channelId_fkey";

-- DropForeignKey
ALTER TABLE "_JoinedChannels" DROP CONSTRAINT "_JoinedChannels_A_fkey";

-- DropTable
DROP TABLE "Cahnnel";

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnChannel" ADD CONSTRAINT "UserOnChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoinedChannels" ADD CONSTRAINT "_JoinedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
