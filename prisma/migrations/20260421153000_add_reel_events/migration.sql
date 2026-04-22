CREATE TABLE `ReelEvent` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reelId` INTEGER NOT NULL,
  `userId` INTEGER NULL,
  `productId` INTEGER NULL,
  `variantId` INTEGER NULL,
  `reelProductTagId` INTEGER NULL,
  `type` ENUM('SHARE', 'PRODUCT_CLICK') NOT NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `ReelEvent_reelId_type_createdAt_idx`(`reelId`, `type`, `createdAt`),
  INDEX `ReelEvent_userId_idx`(`userId`),
  INDEX `ReelEvent_productId_idx`(`productId`),
  INDEX `ReelEvent_variantId_idx`(`variantId`),
  INDEX `ReelEvent_reelProductTagId_idx`(`reelProductTagId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ReelEvent`
  ADD CONSTRAINT `ReelEvent_reelId_fkey`
  FOREIGN KEY (`reelId`) REFERENCES `Reel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelEvent_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelEvent_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelEvent_variantId_fkey`
  FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ReelEvent_reelProductTagId_fkey`
  FOREIGN KEY (`reelProductTagId`) REFERENCES `ReelProductTag`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
