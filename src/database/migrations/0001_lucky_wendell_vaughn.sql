CREATE TABLE `SubredditMembers` (
	`id` text PRIMARY KEY NOT NULL,
	`subredditId` text NOT NULL,
	`userId` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joinedAt` integer NOT NULL,
	FOREIGN KEY (`subredditId`) REFERENCES `Subreddits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `AuthIdentity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `SubredditMembers_subredditId_userId_unique` ON `SubredditMembers` (`subredditId`,`userId`);--> statement-breakpoint
CREATE TABLE `Subreddits` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`createdById` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`createdById`) REFERENCES `AuthIdentity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Subreddits_name_unique` ON `Subreddits` (`name`);--> statement-breakpoint
CREATE TABLE `Posts` (
	`id` text PRIMARY KEY NOT NULL,
	`subredditId` text NOT NULL,
	`authorId` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`score` integer DEFAULT 0 NOT NULL,
	`commentCount` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`subredditId`) REFERENCES `Subreddits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`authorId`) REFERENCES `AuthIdentity`(`id`) ON UPDATE no action ON DELETE cascade
);
