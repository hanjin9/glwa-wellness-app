CREATE TABLE `ai_health_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`feedbackDate` varchar(10) NOT NULL,
	`analysisType` enum('daily','weekly','monthly','alert') NOT NULL DEFAULT 'daily',
	`summary` text,
	`recommendations` json,
	`riskAlerts` json,
	`dataSnapshot` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_health_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_sync_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dataType` varchar(50) NOT NULL,
	`value` float,
	`valueJson` json,
	`unit` varchar(20),
	`source` varchar(50),
	`recordedAt` timestamp NOT NULL,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_sync_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_sync_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`syncToken` varchar(64) NOT NULL,
	`platform` enum('samsung_health','apple_health','google_fit','manual') NOT NULL DEFAULT 'samsung_health',
	`isActive` int NOT NULL DEFAULT 1,
	`consentGivenAt` timestamp,
	`lastSyncAt` timestamp,
	`syncCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_sync_tokens_id` PRIMARY KEY(`id`)
);
