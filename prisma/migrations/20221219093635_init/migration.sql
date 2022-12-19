-- CreateEnum
CREATE TYPE "Permissions" AS ENUM ('CreateRoom', 'EditRoom', 'DeleteRoom', 'KickUser', 'BanUser', 'God_Admin', 'Admin');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "friendId" TEXT,
    "voiceRoomId" TEXT,
    "IsVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cahnnel" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Cahnnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" "Permissions"[],
    "channelId" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "TextRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "VoiceRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "textRoomId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "emojiKey" TEXT NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageOnReaction" (
    "messageId" INTEGER NOT NULL,
    "reactionId" INTEGER NOT NULL,

    CONSTRAINT "MessageOnReaction_pkey" PRIMARY KEY ("reactionId","messageId")
);

-- CreateTable
CREATE TABLE "UserOnChannel" (
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOnChannel_pkey" PRIMARY KEY ("userId","channelId")
);

-- CreateTable
CREATE TABLE "_JoinedChannels" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MessageToReaction" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_emojiKey_key" ON "Reaction"("emojiKey");

-- CreateIndex
CREATE UNIQUE INDEX "_JoinedChannels_AB_unique" ON "_JoinedChannels"("A", "B");

-- CreateIndex
CREATE INDEX "_JoinedChannels_B_index" ON "_JoinedChannels"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageToReaction_AB_unique" ON "_MessageToReaction"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageToReaction_B_index" ON "_MessageToReaction"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_voiceRoomId_fkey" FOREIGN KEY ("voiceRoomId") REFERENCES "VoiceRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cahnnel" ADD CONSTRAINT "Cahnnel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Cahnnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Cahnnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextRoom" ADD CONSTRAINT "TextRoom_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceRoom" ADD CONSTRAINT "VoiceRoom_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_textRoomId_fkey" FOREIGN KEY ("textRoomId") REFERENCES "TextRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageOnReaction" ADD CONSTRAINT "MessageOnReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageOnReaction" ADD CONSTRAINT "MessageOnReaction_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnChannel" ADD CONSTRAINT "UserOnChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnChannel" ADD CONSTRAINT "UserOnChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Cahnnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoinedChannels" ADD CONSTRAINT "_JoinedChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Cahnnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoinedChannels" ADD CONSTRAINT "_JoinedChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToReaction" ADD CONSTRAINT "_MessageToReaction_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToReaction" ADD CONSTRAINT "_MessageToReaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Reaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
