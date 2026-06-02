ALTER TABLE `order`
  ADD COLUMN `customerId` INTEGER NULL;

CREATE INDEX `Order_customerId_idx` ON `order`(`customerId`);

ALTER TABLE `order`
  ADD CONSTRAINT `Order_customerId_fkey`
  FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE `order` AS o
INNER JOIN `user` AS u ON u.`id` = o.`userId`
INNER JOIN `customer` AS c ON c.`email` = u.`email`
SET o.`customerId` = c.`id`
WHERE o.`customerId` IS NULL;

CREATE TABLE `customeraddress` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `customerId` INTEGER NOT NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `addressLine1` VARCHAR(191) NOT NULL,
  `addressLine2` VARCHAR(191) NULL,
  `city` VARCHAR(191) NOT NULL,
  `area` VARCHAR(191) NULL,
  `landmark` VARCHAR(191) NULL,
  `province` VARCHAR(191) NULL,
  `isDefault` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `CustomerAddress_customerId_idx`(`customerId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `customeraddress`
  ADD CONSTRAINT `CustomerAddress_customerId_fkey`
  FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
