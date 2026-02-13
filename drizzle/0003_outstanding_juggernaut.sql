CREATE TABLE `seller_settlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`periodStart` varchar(10) NOT NULL,
	`periodEnd` varchar(10) NOT NULL,
	`totalSales` int NOT NULL,
	`commission` int NOT NULL,
	`netAmount` int NOT NULL,
	`settlementStatus` enum('pending','processing','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seller_settlements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sellers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeName` varchar(200) NOT NULL,
	`storeDescription` text,
	`storeLogoUrl` text,
	`storeBannerUrl` text,
	`businessNumber` varchar(50),
	`contactPhone` varchar(20),
	`contactEmail` varchar(320),
	`bankName` varchar(50),
	`bankAccount` varchar(100),
	`bankHolder` varchar(100),
	`commissionRate` float DEFAULT 10,
	`sellerStatus` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`totalSales` int DEFAULT 0,
	`productCount` int DEFAULT 0,
	`sellerRating` float DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sellers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD `sellerId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `sellerSettled` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentId` varchar(200);--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentStatus` enum('pending','completed','failed','refunded') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `products` ADD `sellerId` int NOT NULL;