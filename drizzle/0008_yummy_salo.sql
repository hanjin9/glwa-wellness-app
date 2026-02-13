ALTER TABLE `coupons` MODIFY COLUMN `couponTier` enum('silver','gold','blue_sapphire','green_emerald','diamond','blue_diamond','platinum','black_platinum');--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `eventTier` enum('silver','gold','blue_sapphire','green_emerald','diamond','blue_diamond','platinum','black_platinum');--> statement-breakpoint
ALTER TABLE `member_profiles` MODIFY COLUMN `memberGrade` enum('silver','gold','blue_sapphire','green_emerald','diamond','blue_diamond','platinum','black_platinum') NOT NULL DEFAULT 'silver';--> statement-breakpoint
ALTER TABLE `membership_tiers` MODIFY COLUMN `tier` enum('silver','gold','blue_sapphire','green_emerald','diamond','blue_diamond','platinum','black_platinum') NOT NULL;--> statement-breakpoint
ALTER TABLE `user_memberships` MODIFY COLUMN `memberTier` enum('silver','gold','blue_sapphire','green_emerald','diamond','blue_diamond','platinum','black_platinum') NOT NULL DEFAULT 'silver';--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `nameEn` varchar(50);--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `annualFee` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `initiationFee` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `dedicatedManager` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `vipLounge` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `conciergeService` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `annualGiftPackage` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `priorityBooking` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `globalPartnerAccess` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `membershipCardType` varchar(50);--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `maxInvitations` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `tierOrder` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `colorTheme` varchar(50);--> statement-breakpoint
ALTER TABLE `membership_tiers` ADD `iconEmoji` varchar(10);