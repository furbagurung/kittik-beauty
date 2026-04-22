CREATE TABLE `Reel` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `caption` TEXT NULL,
  `videoUrl` VARCHAR(191) NOT NULL,
  `thumbnailUrl` VARCHAR(191) NULL,
  `duration` INTEGER NULL,
  `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `featured` BOOLEAN NOT NULL DEFAULT false,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `viewCount` INTEGER NOT NULL DEFAULT 0,
  `createdById` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `Reel_feed_idx`(`status`, `featured`, `sortOrder`, `createdAt`),
  INDEX `Reel_createdById_idx`(`createdById`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ReelProductTag` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reelId` INTEGER NOT NULL,
  `productId` INTEGER NOT NULL,
  `variantId` INTEGER NULL,
  `ctaLabel` VARCHAR(191) NOT NULL DEFAULT 'Shop now',
  `sortOrder` INTEGER NOT NULL DEFAULT 0,

  INDEX `ReelProductTag_reelId_sortOrder_idx`(`reelId`, `sortOrder`),
  INDEX `ReelProductTag_productId_idx`(`productId`),
  INDEX `ReelProductTag_variantId_idx`(`variantId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ReelLike` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reelId` INTEGER NOT NULL,
  `userId` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `ReelLike_reelId_userId_key`(`reelId`, `userId`),
  INDEX `ReelLike_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ReelSave` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reelId` INTEGER NOT NULL,
  `userId` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `ReelSave_reelId_userId_key`(`reelId`, `userId`),
  INDEX `ReelSave_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ReelView` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reelId` INTEGER NOT NULL,
  `userId` INTEGER NULL,
  `watchedSeconds` INTEGER NOT NULL DEFAULT 0,
  `completed` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `ReelView_reelId_createdAt_idx`(`reelId`, `createdAt`),
  INDEX `ReelView_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Reel`
  ADD CONSTRAINT `Reel_createdById_fkey`
  FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ReelProductTag`
  ADD CONSTRAINT `ReelProductTag_reelId_fkey`
  FOREIGN KEY (`reelId`) REFERENCES `Reel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelProductTag_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelProductTag_variantId_fkey`
  FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ReelLike`
  ADD CONSTRAINT `ReelLike_reelId_fkey`
  FOREIGN KEY (`reelId`) REFERENCES `Reel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelLike_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ReelSave`
  ADD CONSTRAINT `ReelSave_reelId_fkey`
  FOREIGN KEY (`reelId`) REFERENCES `Reel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelSave_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ReelView`
  ADD CONSTRAINT `ReelView_reelId_fkey`
  FOREIGN KEY (`reelId`) REFERENCES `Reel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelView_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
