CREATE TABLE `game_chat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_chat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gameType` enum('chess','baduk','omok','yukmok','janggi') NOT NULL,
	`player1Id` int NOT NULL,
	`player2Id` int,
	`player1Rating` int DEFAULT 1000,
	`player2Rating` int DEFAULT 1000,
	`gameDifficulty` enum('easy','medium','hard'),
	`badukLevel` varchar(10),
	`matchStatus` enum('waiting','ongoing','completed','cancelled') NOT NULL DEFAULT 'waiting',
	`winner` int,
	`loser` int,
	`moves` json,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`durationSeconds` int,
	`player1Points` int DEFAULT 0,
	`player2Points` int DEFAULT 0,
	`ratingChange1` int DEFAULT 0,
	`ratingChange2` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_rankings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rankingGameType` enum('chess','baduk','omok','yukmok','janggi') NOT NULL,
	`rating` int DEFAULT 1000,
	`wins` int DEFAULT 0,
	`losses` int DEFAULT 0,
	`draws` int DEFAULT 0,
	`winRate` float DEFAULT 0,
	`rank` int DEFAULT 0,
	`totalPoints` int DEFAULT 0,
	`lastPlayedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_rankings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalMatches` int DEFAULT 0,
	`totalWins` int DEFAULT 0,
	`totalLosses` int DEFAULT 0,
	`totalDraws` int DEFAULT 0,
	`totalPoints` int DEFAULT 0,
	`averageGameDuration` int DEFAULT 0,
	`favoriteGame` varchar(50),
	`highestRating` int DEFAULT 1000,
	`currentStreak` int DEFAULT 0,
	`longestStreak` int DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_statistics_id` PRIMARY KEY(`id`)
);
