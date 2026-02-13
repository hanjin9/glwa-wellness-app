CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_diagnostics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`timePeriod` enum('20years','10years','5years','3years','current') NOT NULL,
	`checklistData` json,
	`constitutionAnalysis` json,
	`inflammationScore` int,
	`gravityScore` int,
	`cardiopulmonaryScore` int,
	`digestiveScore` int,
	`musculoskeletalScore` int,
	`mentalHealthScore` int,
	`overallScore` int,
	`aiAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_diagnostics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`targetValue` float,
	`currentValue` float DEFAULT 0,
	`unit` varchar(50),
	`category` varchar(50),
	`deadline` varchar(10),
	`status` enum('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`category` enum('breathing','rest','posture','stretching','mental','exercise','nutrition') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`dueDate` varchar(10),
	`status` enum('pending','in_progress','submitted','completed','failed') NOT NULL DEFAULT 'pending',
	`photoUrl` text,
	`aiAnalysisResult` text,
	`completionRate` int DEFAULT 0,
	`paybackRate` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `health_missions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recordDate` varchar(10) NOT NULL,
	`systolicBP` int,
	`diastolicBP` int,
	`heartRate` int,
	`bloodSugar` float,
	`weight` float,
	`bodyFat` float,
	`exerciseMinutes` int,
	`exerciseType` varchar(100),
	`sleepHours` float,
	`sleepQuality` int,
	`waterIntake` float,
	`stressLevel` int,
	`painLevel` int,
	`painLocation` varchar(200),
	`mood` enum('great','good','neutral','bad','terrible'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`birthDate` varchar(10),
	`gender` enum('male','female','other'),
	`height` float,
	`weight` float,
	`bloodType` varchar(10),
	`medicalHistory` json,
	`allergies` json,
	`medications` json,
	`emergencyContact` varchar(100),
	`constitutionType` varchar(50),
	`memberGrade` enum('free','standard','vip','platinum') NOT NULL DEFAULT 'free',
	`beltRank` varchar(50) DEFAULT 'white',
	`beltStartDate` timestamp,
	`totalDays` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `member_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `program_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stage` enum('breathing','rest','posture','stretching','mental') NOT NULL,
	`lessonId` int DEFAULT 0,
	`progress` int DEFAULT 0,
	`isCompleted` int DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `program_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`reminderType` enum('medication','exercise','checkup','water','sleep','custom') NOT NULL,
	`time` varchar(5) NOT NULL,
	`days` json,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
