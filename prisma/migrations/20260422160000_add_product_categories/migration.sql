CREATE TABLE `ProductCategory` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `ProductCategory_name_key`(`name`),
  UNIQUE INDEX `ProductCategory_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `ProductCategory` (`name`, `slug`, `sortOrder`)
SELECT
  categories.`name`,
  CONCAT('category-', categories.`firstProductId`),
  categories.`sortOrder`
FROM (
  SELECT
    TRIM(`category`) AS `name`,
    MIN(`id`) AS `firstProductId`,
    ROW_NUMBER() OVER (ORDER BY MIN(`id`)) - 1 AS `sortOrder`
  FROM `Product`
  WHERE `category` IS NOT NULL AND TRIM(`category`) <> ''
  GROUP BY TRIM(`category`)
) AS categories;
