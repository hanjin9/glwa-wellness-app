CREATE TABLE `ai_health_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`analysisType` enum('daily','weekly','monthly','alert') NOT NULL,
	`riskLevel` enum('normal','caution','warning','critical') NOT NULL,
	`summary` text NOT NULL,
	`details` json,
	`recommendations` json,
	`dataSnapshot` json,
	`isReviewedByAdmin` int NOT NULL DEFAULT 0,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_health_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`coachId` int,
	`coachMsgType` enum('ai_auto','coach_manual','scheduled') NOT NULL,
	`coachMsgCategory` enum('health_analysis','exercise','nutrition','mental','lifestyle','motivation','general') NOT NULL,
	`title` varchar(300) NOT NULL,
	`content` text NOT NULL,
	`analysisId` int,
	`isRead` int NOT NULL DEFAULT 0,
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_coaching` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`targetUserIds` json,
	`targetGrade` varchar(50),
	`title` varchar(300) NOT NULL,
	`content` text NOT NULL,
	`schedCoachCategory` enum('health_analysis','exercise','nutrition','mental','lifestyle','motivation','general') NOT NULL,
	`scheduleType` enum('once','daily','weekly','monthly') NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`lastSentAt` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_coaching_id` PRIMARY KEY(`id`)
);
