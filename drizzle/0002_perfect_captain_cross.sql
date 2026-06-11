CREATE TABLE `committeeFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`filename` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(128),
	`fileCategory` enum('report_card','recommendation','grades','other') NOT NULL DEFAULT 'other',
	`description` text,
	`uploaderName` varchar(256),
	`extractedText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `committeeFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `committeeMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`email` varchar(320) NOT NULL,
	`lastLogin` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `committeeMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `committeeMembers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `committeeReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`reviewerName` varchar(256) NOT NULL,
	`reviewerEmail` varchar(320),
	`score` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `committeeReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboardAccessTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(128) NOT NULL,
	`label` varchar(256) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dashboardAccessTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `dashboardAccessTokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `fundraisingConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalAmount` decimal(10,2) NOT NULL,
	`currentAmount` decimal(10,2) NOT NULL DEFAULT '0',
	`campaignTitle` varchar(256) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fundraisingConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD `aiAnalysisGeneratedAt` timestamp;--> statement-breakpoint
ALTER TABLE `applications` ADD `overallScore` int;--> statement-breakpoint
ALTER TABLE `applications` ADD `committeeNotes` text;--> statement-breakpoint
ALTER TABLE `donations` ADD `thankYouSent` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `donations` ADD `address` text;--> statement-breakpoint
ALTER TABLE `messages` ADD `isArchived` boolean DEFAULT false NOT NULL;