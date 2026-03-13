CREATE TABLE `SubredditBans` (
	`id` text PRIMARY KEY NOT NULL,
	`subredditId` text NOT NULL,
	`userId` text NOT NULL,
	`bannedById` text NOT NULL,
	`reason` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`subredditId`) REFERENCES `Subreddits`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `AuthIdentity`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bannedById`) REFERENCES `AuthIdentity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `SubredditBans_subredditId_userId_unique` ON `SubredditBans` (`subredditId`,`userId`);
--> statement-breakpoint
ALTER TABLE `Posts` ADD `isRemoved` integer DEFAULT false NOT NULL;
