-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "qcmReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shareStatistics" BOOLEAN NOT NULL DEFAULT false;
