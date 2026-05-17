CREATE TABLE `brand` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `logo` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `Brand_name_key`(`name`),
  UNIQUE INDEX `Brand_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `subcategory` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(191) NULL,
  `categoryId` INTEGER NOT NULL,
  `status` ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `SubCategory_slug_key`(`slug`),
  UNIQUE INDEX `SubCategory_categoryId_name_key`(`categoryId`, `name`),
  INDEX `SubCategory_categoryId_idx`(`categoryId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `product`
  ADD COLUMN `subCategoryId` INTEGER NULL,
  ADD COLUMN `brandId` INTEGER NULL;

CREATE INDEX `Product_subCategoryId_idx` ON `product`(`subCategoryId`);
CREATE INDEX `Product_brandId_idx` ON `product`(`brandId`);

ALTER TABLE `subcategory`
  ADD CONSTRAINT `subcategory_categoryId_fkey`
  FOREIGN KEY (`categoryId`) REFERENCES `productcategory`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `product`
  ADD CONSTRAINT `product_subCategoryId_fkey`
  FOREIGN KEY (`subCategoryId`) REFERENCES `subcategory`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `product`
  ADD CONSTRAINT `product_brandId_fkey`
  FOREIGN KEY (`brandId`) REFERENCES `brand`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
