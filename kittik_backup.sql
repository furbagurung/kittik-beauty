-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: kittik
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('1f710e83-0cfa-4813-a9c1-e3b7143ed4e3','d3dc262bbdfc81d66adb623d2e5664e696db2fd25ab6db2111342c1aa5d8be58','2026-04-21 12:40:03.465','20260421143000_add_reels',NULL,NULL,'2026-04-21 12:40:03.231',1),('1f8630e9-cfb2-413f-a7ef-75e4cb87b981','92171fe140bad018525d83af1d9a9e5d1d1d752b4949703a33e0f6a9e1f07cbd','2026-04-21 09:38:16.329','20260419123500_add_missing_product_rating_column','',NULL,'2026-04-21 09:38:16.329',0),('1fbfb0ac-4857-44e6-922c-ad5ab6c79fc8','c2f5c73de4d375e102b3fc4d12ae424d4183427877303767e8bc51897bc066be','2026-04-21 12:57:50.956','20260421153000_add_reel_events',NULL,NULL,'2026-04-21 12:57:50.882',1),('602c13a6-e43a-4d87-a00c-a46acb44a2e0','0584502e7908f5edd65c391fc4bb3800ea1b2e0086d230a94a19e9f7be568d26','2026-04-21 09:38:13.729','20260411152334_add_core_models','',NULL,'2026-04-21 09:38:13.729',0),('69bb6dd9-9000-491a-9903-98d8e7ec2d8c','d925bd38ce6ec3bb8346d8c85865a46782106908f05d546cd4636cf1b48115b9','2026-04-21 09:38:15.032','20260419120000_add_product_gallery_images','',NULL,'2026-04-21 09:38:15.032',0),('a5a91318-96ee-4798-a01e-84417dc2038c','c3badf492efb496807cc0f5d7a353ffd2c567d1f3b1df2a5f8140954ef6bd184','2026-04-21 09:38:17.672','20260421120000_add_product_variants','',NULL,'2026-04-21 09:38:17.672',0),('db6936ce-d314-447c-9496-3eb1052fb488','4514f1ae4bc35c2f3522e67919ab68ed030df169ee2b5bf9f2e70da4ab4ca062','2026-04-22 11:08:04.151','20260422160000_add_product_categories',NULL,NULL,'2026-04-22 11:08:04.119',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` double NOT NULL,
  `deliveryFee` double NOT NULL,
  `total` double NOT NULL,
  `totalItems` int NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_payment',
  `stockRestored` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Order_userId_fkey` (`userId`),
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitem`
--

DROP TABLE IF EXISTS `orderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `variantId` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_fkey` (`orderId`),
  KEY `OrderItem_variantId_fkey` (`variantId`),
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitem`
--

LOCK TABLES `orderitem` WRITE;
/*!40000 ALTER TABLE `orderitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `shortDescription` text COLLATE utf8mb4_unicode_ci,
  `status` enum('DRAFT','ACTIVE','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `productType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `featuredImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seoTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seoDescription` text COLLATE utf8mb4_unicode_ci,
  `rating` double NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Glow Serum','glow-serum',NULL,NULL,'ACTIVE',NULL,NULL,'Skincare','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',NULL,NULL,4.8,'2026-04-21 07:03:04.789','2026-04-21 07:03:04.789'),(2,'Velvet Lipstick','velvet-lipstick',NULL,NULL,'ACTIVE',NULL,NULL,'Makeup','https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop',NULL,NULL,4.7,'2026-04-21 07:03:04.799','2026-04-21 07:03:04.799'),(3,'Hydrating Cream','hydrating-cream',NULL,NULL,'ACTIVE',NULL,NULL,'Skincare','https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop',NULL,NULL,4.9,'2026-04-21 07:03:04.809','2026-04-21 07:03:04.809'),(4,'Hair Repair Oil','hair-repair-oil',NULL,NULL,'ACTIVE',NULL,NULL,'Haircare','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',NULL,NULL,4.6,'2026-04-21 07:03:04.813','2026-04-21 07:03:04.813'),(5,'eSewa Test Product','esewa-test-product',NULL,NULL,'ACTIVE',NULL,NULL,'Skincare','https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',NULL,NULL,5,'2026-04-21 07:03:04.818','2026-04-21 11:42:52.775');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productcategory`
--

DROP TABLE IF EXISTS `productcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productcategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductCategory_name_key` (`name`),
  UNIQUE KEY `ProductCategory_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productcategory`
--

LOCK TABLES `productcategory` WRITE;
/*!40000 ALTER TABLE `productcategory` DISABLE KEYS */;
INSERT INTO `productcategory` VALUES (1,'Haircare','category-4',2,'2026-04-22 16:53:04.142','2026-04-22 16:53:04.142'),(2,'Makeup','category-2',1,'2026-04-22 16:53:04.142','2026-04-22 16:53:04.142'),(3,'Skincare','category-1',0,'2026-04-22 16:53:04.142','2026-04-22 16:53:04.142');
/*!40000 ALTER TABLE `productcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productmedia`
--

DROP TABLE IF EXISTS `productmedia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productmedia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `altText` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('IMAGE','VIDEO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IMAGE',
  `position` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ProductMedia_productId_position_idx` (`productId`,`position`),
  CONSTRAINT `ProductMedia_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productmedia`
--

LOCK TABLES `productmedia` WRITE;
/*!40000 ALTER TABLE `productmedia` DISABLE KEYS */;
INSERT INTO `productmedia` VALUES (1,1,'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop','Glow Serum','IMAGE',0,'2026-04-21 07:03:04.789'),(2,2,'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop','Velvet Lipstick','IMAGE',0,'2026-04-21 07:03:04.799'),(3,3,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop','Hydrating Cream','IMAGE',0,'2026-04-21 07:03:04.809'),(4,4,'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop','Hair Repair Oil','IMAGE',0,'2026-04-21 07:03:04.813'),(9,5,'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop','eSewa Test Product','IMAGE',0,'2026-04-21 11:42:52.775');
/*!40000 ALTER TABLE `productmedia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productoption`
--

DROP TABLE IF EXISTS `productoption`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productoption` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductOption_productId_name_key` (`productId`,`name`),
  KEY `ProductOption_productId_position_idx` (`productId`,`position`),
  CONSTRAINT `ProductOption_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productoption`
--

LOCK TABLES `productoption` WRITE;
/*!40000 ALTER TABLE `productoption` DISABLE KEYS */;
/*!40000 ALTER TABLE `productoption` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productoptionvalue`
--

DROP TABLE IF EXISTS `productoptionvalue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productoptionvalue` (
  `id` int NOT NULL AUTO_INCREMENT,
  `optionId` int NOT NULL,
  `value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductOptionValue_optionId_value_key` (`optionId`,`value`),
  KEY `ProductOptionValue_optionId_position_idx` (`optionId`,`position`),
  CONSTRAINT `ProductOptionValue_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `productoption` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productoptionvalue`
--

LOCK TABLES `productoptionvalue` WRITE;
/*!40000 ALTER TABLE `productoptionvalue` DISABLE KEYS */;
/*!40000 ALTER TABLE `productoptionvalue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producttag`
--

DROP TABLE IF EXISTS `producttag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producttag` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductTag_productId_value_key` (`productId`,`value`),
  KEY `ProductTag_productId_idx` (`productId`),
  CONSTRAINT `ProductTag_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producttag`
--

LOCK TABLES `producttag` WRITE;
/*!40000 ALTER TABLE `producttag` DISABLE KEYS */;
/*!40000 ALTER TABLE `producttag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productvariant`
--

DROP TABLE IF EXISTS `productvariant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productvariant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double NOT NULL,
  `compareAtPrice` double DEFAULT NULL,
  `costPerItem` double DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `trackQuantity` tinyint(1) NOT NULL DEFAULT '1',
  `continueSellingWhenOutOfStock` tinyint(1) NOT NULL DEFAULT '0',
  `weight` double DEFAULT NULL,
  `weightUnit` enum('KG','G','LB','OZ') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `position` int NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','ARCHIVED','OUT_OF_STOCK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductVariant_sku_key` (`sku`),
  KEY `ProductVariant_productId_position_idx` (`productId`,`position`),
  KEY `ProductVariant_productId_status_idx` (`productId`,`status`),
  CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productvariant`
--

LOCK TABLES `productvariant` WRITE;
/*!40000 ALTER TABLE `productvariant` DISABLE KEYS */;
INSERT INTO `productvariant` VALUES (1,1,'Default Title',NULL,NULL,1299,NULL,NULL,25,1,0,NULL,NULL,'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',1,0,'ACTIVE','2026-04-21 07:03:04.789','2026-04-21 07:03:04.789'),(2,2,'Default Title',NULL,NULL,899,NULL,NULL,25,1,0,NULL,NULL,'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop',1,0,'ACTIVE','2026-04-21 07:03:04.799','2026-04-21 07:03:04.799'),(3,3,'Default Title',NULL,NULL,1599,NULL,NULL,25,1,0,NULL,NULL,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop',1,0,'ACTIVE','2026-04-21 07:03:04.809','2026-04-21 07:03:04.809'),(4,4,'Default Title',NULL,NULL,1099,NULL,NULL,25,1,0,NULL,NULL,'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',1,0,'ACTIVE','2026-04-21 07:03:04.813','2026-04-21 07:03:04.813'),(7,5,'Pink',NULL,NULL,100,NULL,NULL,50,1,0,NULL,NULL,NULL,1,0,'ACTIVE','2026-04-21 09:56:35.880','2026-04-21 11:42:52.811');
/*!40000 ALTER TABLE `productvariant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reel`
--

DROP TABLE IF EXISTS `reel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caption` text COLLATE utf8mb4_unicode_ci,
  `videoUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnailUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `status` enum('DRAFT','ACTIVE','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `sortOrder` int NOT NULL DEFAULT '0',
  `viewCount` int NOT NULL DEFAULT '0',
  `createdById` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Reel_feed_idx` (`status`,`featured`,`sortOrder`,`createdAt`),
  KEY `Reel_createdById_idx` (`createdById`),
  CONSTRAINT `Reel_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reel`
--

LOCK TABLES `reel` WRITE;
/*!40000 ALTER TABLE `reel` DISABLE KEYS */;
INSERT INTO `reel` VALUES (4,'Saachi Brand Pink Kurtha','Saachi Brand Pink Kurtha Set available now on all sizes\r\nDelivery all over nepal\r\n#kittik #saachi #kurthanepal #kurthaset♥️ #kurtaset','/uploads/reels/1777011104269-430184015-saachi-brand-pink-kurtha-set-available-now-on-all-sizesdelivery-all-over-nepal-kittik-saachi-k.mp4',NULL,NULL,'ACTIVE',0,0,0,1,'2026-04-24 06:11:44.433','2026-04-24 06:11:44.433');
/*!40000 ALTER TABLE `reel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reelevent`
--

DROP TABLE IF EXISTS `reelevent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reelevent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reelId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `productId` int DEFAULT NULL,
  `variantId` int DEFAULT NULL,
  `reelProductTagId` int DEFAULT NULL,
  `type` enum('SHARE','PRODUCT_CLICK') COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ReelEvent_reelId_type_createdAt_idx` (`reelId`,`type`,`createdAt`),
  KEY `ReelEvent_userId_idx` (`userId`),
  KEY `ReelEvent_productId_idx` (`productId`),
  KEY `ReelEvent_variantId_idx` (`variantId`),
  KEY `ReelEvent_reelProductTagId_idx` (`reelProductTagId`),
  CONSTRAINT `ReelEvent_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ReelEvent_reelId_fkey` FOREIGN KEY (`reelId`) REFERENCES `reel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReelEvent_reelProductTagId_fkey` FOREIGN KEY (`reelProductTagId`) REFERENCES `reelproducttag` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ReelEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ReelEvent_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reelevent_chk_1` CHECK (json_valid(`metadata`))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reelevent`
--

LOCK TABLES `reelevent` WRITE;
/*!40000 ALTER TABLE `reelevent` DISABLE KEYS */;
/*!40000 ALTER TABLE `reelevent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reellike`
--

DROP TABLE IF EXISTS `reellike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reellike` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reelId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ReelLike_reelId_userId_key` (`reelId`,`userId`),
  KEY `ReelLike_userId_idx` (`userId`),
  CONSTRAINT `ReelLike_reelId_fkey` FOREIGN KEY (`reelId`) REFERENCES `reel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReelLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reellike`
--

LOCK TABLES `reellike` WRITE;
/*!40000 ALTER TABLE `reellike` DISABLE KEYS */;
/*!40000 ALTER TABLE `reellike` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reelproducttag`
--

DROP TABLE IF EXISTS `reelproducttag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reelproducttag` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reelId` int NOT NULL,
  `productId` int NOT NULL,
  `variantId` int DEFAULT NULL,
  `ctaLabel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Shop now',
  `sortOrder` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ReelProductTag_reelId_sortOrder_idx` (`reelId`,`sortOrder`),
  KEY `ReelProductTag_productId_idx` (`productId`),
  KEY `ReelProductTag_variantId_idx` (`variantId`),
  CONSTRAINT `ReelProductTag_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReelProductTag_reelId_fkey` FOREIGN KEY (`reelId`) REFERENCES `reel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReelProductTag_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reelproducttag`
--

LOCK TABLES `reelproducttag` WRITE;
/*!40000 ALTER TABLE `reelproducttag` DISABLE KEYS */;
/*!40000 ALTER TABLE `reelproducttag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reelsave`
--

DROP TABLE IF EXISTS `reelsave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reelsave` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reelId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ReelSave_reelId_userId_key` (`reelId`,`userId`),
  KEY `ReelSave_userId_idx` (`userId`),
  CONSTRAINT `ReelSave_reelId_fkey` FOREIGN KEY (`reelId`) REFERENCES `reel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReelSave_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reelsave`
--

LOCK TABLES `reelsave` WRITE;
/*!40000 ALTER TABLE `reelsave` DISABLE KEYS */;
/*!40000 ALTER TABLE `reelsave` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reelview`
--

DROP TABLE IF EXISTS `reelview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reelview` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reelId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `watchedSeconds` int NOT NULL DEFAULT '0',
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ReelView_reelId_createdAt_idx` (`reelId`,`createdAt`),
  KEY `ReelView_userId_idx` (`userId`),
  CONSTRAINT `ReelView_reelId_fkey` FOREIGN KEY (`reelId`) REFERENCES `reel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ReelView_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reelview`
--

LOCK TABLES `reelview` WRITE;
/*!40000 ALTER TABLE `reelview` DISABLE KEYS */;
/*!40000 ALTER TABLE `reelview` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Admin','admin@kittik.com','$2b$10$BQHPvbRCtjZRdHVXjeX5d.eslNMo0WN8WinLr85gAkwSXfndl2jfW','admin','2026-04-21 07:06:57.628');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variantoptionselection`
--

DROP TABLE IF EXISTS `variantoptionselection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variantoptionselection` (
  `id` int NOT NULL AUTO_INCREMENT,
  `variantId` int NOT NULL,
  `optionId` int NOT NULL,
  `optionValueId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `VariantOptionSelection_variantId_optionId_key` (`variantId`,`optionId`),
  KEY `VariantOptionSelection_optionId_optionValueId_idx` (`optionId`,`optionValueId`),
  KEY `VariantOptionSelection_variantId_idx` (`variantId`),
  KEY `VariantOptionSelection_optionValueId_fkey` (`optionValueId`),
  CONSTRAINT `VariantOptionSelection_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `productoption` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `VariantOptionSelection_optionValueId_fkey` FOREIGN KEY (`optionValueId`) REFERENCES `productoptionvalue` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `VariantOptionSelection_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variantoptionselection`
--

LOCK TABLES `variantoptionselection` WRITE;
/*!40000 ALTER TABLE `variantoptionselection` DISABLE KEYS */;
/*!40000 ALTER TABLE `variantoptionselection` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-24  6:34:00
