CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` int NOT NULL,
	`minOrderAmount` int DEFAULT 0,
	`maxDiscountAmount` int,
	`applicableCategory` varchar(50),
	`couponTier` enum('silver','gold','diamond','platinum'),
	`totalQuantity` int,
	`usedQuantity` int DEFAULT 0,
	`couponStartDate` timestamp NOT NULL DEFAULT (now()),
	`couponEndDate` timestamp,
	`couponIsActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_participations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`participationStatus` enum('joined','completed','rewarded') NOT NULL DEFAULT 'joined',
	`rewardGiven` int DEFAULT 0,
	`participationCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_participations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`eventContent` text,
	`eventImageUrl` text,
	`eventType` enum('promotion','seasonal','tier_exclusive','referral','challenge','special') NOT NULL,
	`eventTier` enum('silver','gold','diamond','platinum'),
	`rewardType` enum('points','coupon','product','mileage','badge'),
	`rewardValue` int,
	`eventStartDate` timestamp NOT NULL,
	`eventEndDate` timestamp,
	`maxParticipants` int,
	`currentParticipants` int DEFAULT 0,
	`eventIsActive` int DEFAULT 1,
	`isFeatured` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membership_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tier` enum('silver','gold','diamond','platinum') NOT NULL,
	`name` varchar(50) NOT NULL,
	`monthlyFee` int DEFAULT 0,
	`shopDiscountRate` int DEFAULT 0,
	`paybackRate` int DEFAULT 50,
	`pointMultiplier` float DEFAULT 1,
	`consultPriority` int DEFAULT 0,
	`premiumContent` int DEFAULT 0,
	`exclusiveEvents` int DEFAULT 0,
	`monthlyFreeCoupons` int DEFAULT 0,
	`description` text,
	`benefits` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `membership_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mileage_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mileageType` enum('earn','use') NOT NULL,
	`mileageAmount` int NOT NULL,
	`mileageBalance` int NOT NULL,
	`mileageSource` varchar(100) NOT NULL,
	`mileageDescription` varchar(300),
	`mileageReferenceId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mileage_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `points_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pointType` enum('earn','use','expire','refund') NOT NULL,
	`amount` int NOT NULL,
	`balance` int NOT NULL,
	`pointSource` enum('purchase','mission','event','referral','review','attendance','signup_bonus','tier_bonus','admin','shop_payment','coupon_exchange','expiry') NOT NULL,
	`description` varchar(300),
	`referenceId` varchar(100),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`couponId` int NOT NULL,
	`couponStatus` enum('available','used','expired') NOT NULL DEFAULT 'available',
	`usedAt` timestamp,
	`usedOrderId` int,
	`acquiredAt` timestamp NOT NULL DEFAULT (now()),
	`couponExpiresAt` timestamp,
	CONSTRAINT `user_coupons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`memberTier` enum('silver','gold','diamond','platinum') NOT NULL DEFAULT 'silver',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`isActive` int DEFAULT 1,
	`autoRenew` int DEFAULT 1,
	`stripeSubscriptionId` varchar(200),
	`totalPointsEarned` int DEFAULT 0,
	`totalPointsUsed` int DEFAULT 0,
	`currentPoints` int DEFAULT 0,
	`totalMileage` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_memberships_id` PRIMARY KEY(`id`)
);
