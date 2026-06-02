CREATE TABLE `customerwishlist` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `customerId` INTEGER NOT NULL,
  `productId` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `CustomerWishlist_customerId_productId_key`(`customerId`, `productId`),
  INDEX `CustomerWishlist_productId_idx`(`productId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `customerwishlist`
  ADD CONSTRAINT `CustomerWishlist_customerId_fkey`
  FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `customerwishlist`
  ADD CONSTRAINT `CustomerWishlist_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `product`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `customerrecentlyviewed` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `customerId` INTEGER NOT NULL,
  `productId` INTEGER NOT NULL,
  `viewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `CustomerRecentlyViewed_customerId_productId_key`(`customerId`, `productId`),
  INDEX `CustomerRecentlyViewed_productId_idx`(`productId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `customerrecentlyviewed`
  ADD CONSTRAINT `CustomerRecentlyViewed_customerId_fkey`
  FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `customerrecentlyviewed`
  ADD CONSTRAINT `CustomerRecentlyViewed_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `product`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
