CREATE TABLE `auto_trading_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`ruleType` varchar(50) NOT NULL,
	`condition` varchar(200) NOT NULL,
	`autoTradeType` enum('buy','sell') NOT NULL,
	`quantity` varchar(50) NOT NULL,
	`maxLoss` varchar(50),
	`takeProfit` varchar(50),
	`isActive` int NOT NULL DEFAULT 1,
	`executedCount` int NOT NULL DEFAULT 0,
	`lastExecutedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auto_trading_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crypto_trading_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`tradeType` enum('buy','sell') NOT NULL,
	`quantity` varchar(50) NOT NULL,
	`price` varchar(50) NOT NULL,
	`totalAmount` varchar(50) NOT NULL,
	`fee` varchar(50) DEFAULT '0',
	`profitLoss` varchar(50),
	`tradeStatus` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`tradeDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crypto_trading_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crypto_watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`alertPrice` varchar(50),
	`alertType` enum('above','below'),
	CONSTRAINT `crypto_watchlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_gifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamId` int NOT NULL,
	`senderId` int NOT NULL,
	`giftType` varchar(50) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`pointsSpent` int NOT NULL,
	`message` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `live_gifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_streams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`thumbnailUrl` varchar(500),
	`category` varchar(50) NOT NULL,
	`liveStatus` enum('scheduled','live','ended') NOT NULL DEFAULT 'scheduled',
	`viewerCount` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`totalDuration` int,
	`totalGiftsAmount` int NOT NULL DEFAULT 0,
	`totalViewers` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_streams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_viewers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`streamId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`leftAt` timestamp,
	`watchDuration` int,
	`giftsSent` int NOT NULL DEFAULT 0,
	`pointsContributed` int NOT NULL DEFAULT 0,
	CONSTRAINT `live_viewers_id` PRIMARY KEY(`id`)
);
