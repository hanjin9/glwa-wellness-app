CREATE TABLE `user_wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardNumber` varchar(20) NOT NULL,
	`pointBalance` int NOT NULL DEFAULT 0,
	`cashBalance` int NOT NULL DEFAULT 0,
	`coinBalance` float NOT NULL DEFAULT 0,
	`totalSpent` int NOT NULL DEFAULT 0,
	`totalCharged` int NOT NULL DEFAULT 0,
	`walletIsActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletId` int NOT NULL,
	`walletTxType` enum('charge','payment','transfer','refund','reward') NOT NULL,
	`walletCurrency` enum('point','cash','coin') NOT NULL,
	`walletTxAmount` int NOT NULL,
	`walletBalanceAfter` int NOT NULL,
	`walletTxDesc` varchar(300),
	`walletTxRefId` varchar(100),
	`walletPayMethod` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_transactions_id` PRIMARY KEY(`id`)
);
