CREATE TABLE `mental_health_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationTime` varchar(5) NOT NULL,
	`musicGenre` varchar(50),
	`isEnabled` int NOT NULL DEFAULT 1,
	`lastSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mental_health_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `song_of_the_day` (
	`id` int AUTO_INCREMENT NOT NULL,
	`songUrl` text NOT NULL,
	`songTitle` varchar(200) NOT NULL,
	`artistName` varchar(100) NOT NULL,
	`genre` varchar(50),
	`selectedDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `song_of_the_day_id` PRIMARY KEY(`id`),
	CONSTRAINT `song_of_the_day_selectedDate_unique` UNIQUE(`selectedDate`)
);
