CREATE TABLE `PostVotes` (
	`id` text PRIMARY KEY NOT NULL,
	`postId` text NOT NULL,
	`userId` text NOT NULL,
	`value` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `Posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `AuthIdentity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `PostVotes_postId_userId_unique` ON `PostVotes` (`postId`,`userId`);
