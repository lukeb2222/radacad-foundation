ALTER TABLE `applications` ADD `scholarshipType` enum('need_based','merit_jhsc') DEFAULT 'need_based' NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `gradeLevel` varchar(32);--> statement-breakpoint
ALTER TABLE `applications` ADD `division` varchar(32);--> statement-breakpoint
ALTER TABLE `applications` ADD `currentSchool` varchar(256);--> statement-breakpoint
ALTER TABLE `applications` ADD `parentName` varchar(256);--> statement-breakpoint
ALTER TABLE `applications` ADD `parentEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `applications` ADD `parentPhone` varchar(32);--> statement-breakpoint
ALTER TABLE `applications` ADD `householdIncome` varchar(128);--> statement-breakpoint
ALTER TABLE `applications` ADD `householdSize` varchar(16);--> statement-breakpoint
ALTER TABLE `applications` ADD `mfiPercentage` varchar(64);--> statement-breakpoint
ALTER TABLE `applications` ADD `financialAttestation` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `applications` ADD `activeJhscMember` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `applications` ADD `essay2` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `essay3` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `essay4` text;--> statement-breakpoint
ALTER TABLE `applications` ADD `parentStatement` text;--> statement-breakpoint
ALTER TABLE `committeeReviews` ADD `rubricScores` text;