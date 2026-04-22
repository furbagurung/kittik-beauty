ALTER TABLE `Product`
  ADD COLUMN `title` VARCHAR(191) NULL,
  ADD COLUMN `slug` VARCHAR(191) NULL,
  ADD COLUMN `shortDescription` TEXT NULL,
  ADD COLUMN `productType` VARCHAR(191) NULL,
  ADD COLUMN `vendor` VARCHAR(191) NULL,
  ADD COLUMN `featuredImage` VARCHAR(191) NULL,
  ADD COLUMN `seoTitle` VARCHAR(191) NULL,
  ADD COLUMN `seoDescription` TEXT NULL,
  ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `Product`
SET
  `title` = `name`,
  `slug` = CONCAT(
    TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(`name`, '[^a-zA-Z0-9]+', '-'))),
    '-',
    `id`
  ),
  `featuredImage` = `image`,
  `status` = CASE
    WHEN `status` = 'Active' THEN 'ACTIVE'
    WHEN `status` = 'Archived' THEN 'ARCHIVED'
    ELSE 'DRAFT'
  END;

ALTER TABLE `Product`
  MODIFY `title` VARCHAR(191) NOT NULL,
  MODIFY `slug` VARCHAR(191) NOT NULL,
  MODIFY `description` TEXT NULL,
  MODIFY `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  ADD UNIQUE INDEX `Product_slug_key`(`slug`);

CREATE TABLE `ProductMedia` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `productId` INTEGER NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `altText` VARCHAR(191) NULL,
  `type` ENUM('IMAGE', 'VIDEO') NOT NULL DEFAULT 'IMAGE',
  `position` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `ProductMedia_productId_position_idx`(`productId`, `position`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProductOption` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `productId` INTEGER NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `position` INTEGER NOT NULL DEFAULT 0,

  INDEX `ProductOption_productId_position_idx`(`productId`, `position`),
  UNIQUE INDEX `ProductOption_productId_name_key`(`productId`, `name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProductOptionValue` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `optionId` INTEGER NOT NULL,
  `value` VARCHAR(191) NOT NULL,
  `position` INTEGER NOT NULL DEFAULT 0,

  INDEX `ProductOptionValue_optionId_position_idx`(`optionId`, `position`),
  UNIQUE INDEX `ProductOptionValue_optionId_value_key`(`optionId`, `value`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProductVariant` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `productId` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `sku` VARCHAR(191) NULL,
  `barcode` VARCHAR(191) NULL,
  `price` DOUBLE NOT NULL,
  `compareAtPrice` DOUBLE NULL,
  `costPerItem` DOUBLE NULL,
  `stock` INTEGER NOT NULL DEFAULT 0,
  `trackQuantity` BOOLEAN NOT NULL DEFAULT true,
  `continueSellingWhenOutOfStock` BOOLEAN NOT NULL DEFAULT false,
  `weight` DOUBLE NULL,
  `weightUnit` ENUM('KG', 'G', 'LB', 'OZ') NULL,
  `image` VARCHAR(191) NULL,
  `isDefault` BOOLEAN NOT NULL DEFAULT false,
  `position` INTEGER NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `ProductVariant_sku_key`(`sku`),
  INDEX `ProductVariant_productId_position_idx`(`productId`, `position`),
  INDEX `ProductVariant_productId_status_idx`(`productId`, `status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VariantOptionSelection` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `variantId` INTEGER NOT NULL,
  `optionId` INTEGER NOT NULL,
  `optionValueId` INTEGER NOT NULL,

  UNIQUE INDEX `VariantOptionSelection_variantId_optionId_key`(`variantId`, `optionId`),
  INDEX `VariantOptionSelection_optionId_optionValueId_idx`(`optionId`, `optionValueId`),
  INDEX `VariantOptionSelection_variantId_idx`(`variantId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProductTag` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `productId` INTEGER NOT NULL,
  `value` VARCHAR(191) NOT NULL,

  INDEX `ProductTag_productId_idx`(`productId`),
  UNIQUE INDEX `ProductTag_productId_value_key`(`productId`, `value`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `ProductMedia` (`productId`, `url`, `altText`, `type`, `position`, `createdAt`)
SELECT `id`, `image`, `name`, 'IMAGE', 0, CURRENT_TIMESTAMP(3)
FROM `Product`
WHERE `image` IS NOT NULL AND `image` <> '';

INSERT INTO `ProductMedia` (`productId`, `url`, `altText`, `type`, `position`, `createdAt`)
SELECT `Product`.`id`, gallery.`url`, `Product`.`name`, 'IMAGE', gallery.`ordinal` + 1, CURRENT_TIMESTAMP(3)
FROM `Product`
JOIN JSON_TABLE(
  COALESCE(`Product`.`images`, JSON_ARRAY()),
  '$[*]' COLUMNS (
    `ordinal` FOR ORDINALITY,
    `url` VARCHAR(191) PATH '$'
  )
) AS gallery
WHERE gallery.`url` IS NOT NULL
  AND gallery.`url` <> ''
  AND gallery.`url` <> COALESCE(`Product`.`image`, '');

INSERT INTO `ProductVariant` (
  `productId`,
  `title`,
  `price`,
  `stock`,
  `image`,
  `isDefault`,
  `position`,
  `status`,
  `createdAt`,
  `updatedAt`
)
SELECT
  `id`,
  'Default Title',
  `price`,
  `stock`,
  `image`,
  true,
  0,
  CASE
    WHEN `stock` = 0 THEN 'OUT_OF_STOCK'
    ELSE 'ACTIVE'
  END,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
FROM `Product`;

ALTER TABLE `OrderItem` ADD COLUMN `variantId` INTEGER NULL;

UPDATE `OrderItem`
JOIN `ProductVariant`
  ON `ProductVariant`.`productId` = `OrderItem`.`productId`
  AND `ProductVariant`.`isDefault` = true
SET `OrderItem`.`variantId` = `ProductVariant`.`id`;

ALTER TABLE `OrderItem` MODIFY `variantId` INTEGER NOT NULL;
ALTER TABLE `OrderItem` DROP COLUMN `productId`;

ALTER TABLE `Product`
  DROP COLUMN `name`,
  DROP COLUMN `price`,
  DROP COLUMN `image`,
  DROP COLUMN `images`,
  DROP COLUMN `stock`;

ALTER TABLE `ProductMedia`
  ADD CONSTRAINT `ProductMedia_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductOption`
  ADD CONSTRAINT `ProductOption_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductOptionValue`
  ADD CONSTRAINT `ProductOptionValue_optionId_fkey`
  FOREIGN KEY (`optionId`) REFERENCES `ProductOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductVariant`
  ADD CONSTRAINT `ProductVariant_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `VariantOptionSelection`
  ADD CONSTRAINT `VariantOptionSelection_variantId_fkey`
  FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `VariantOptionSelection_optionId_fkey`
  FOREIGN KEY (`optionId`) REFERENCES `ProductOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `VariantOptionSelection_optionValueId_fkey`
  FOREIGN KEY (`optionValueId`) REFERENCES `ProductOptionValue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductTag`
  ADD CONSTRAINT `ProductTag_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_variantId_fkey`
  FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
