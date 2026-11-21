-- AlterTable: add familyId to RefreshTokenSession
ALTER TABLE "RefreshTokenSession" ADD COLUMN IF NOT EXISTS "familyId" TEXT;
CREATE INDEX IF NOT EXISTS "RefreshTokenSession_familyId_idx" ON "RefreshTokenSession"("familyId");

-- AlterTable: add readAt to Notification
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
