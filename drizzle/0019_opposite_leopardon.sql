CREATE TABLE `workout_pose_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseName` varchar(100) NOT NULL,
	`targetPose` varchar(50) NOT NULL,
	`accuracy` int NOT NULL,
	`hanJinLevel` int NOT NULL,
	`feedback` text,
	`isCorrect` boolean DEFAULT false,
	`duration` int,
	`videoUrl` text,
	`aiAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workout_pose_analysis_id` PRIMARY KEY(`id`)
);
