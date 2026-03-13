CREATE TABLE `Comments` (
	`id` text PRIMARY KEY NOT NULL,
	`postId` text NOT NULL,
	`authorId` text NOT NULL,
	`parentCommentId` text,
	`body` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`depth` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `Posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`authorId`) REFERENCES `AuthIdentity`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parentCommentId`) REFERENCES `Comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `CommentVotes` (
	`id` text PRIMARY KEY NOT NULL,
	`commentId` text NOT NULL,
	`userId` text NOT NULL,
	`value` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`commentId`) REFERENCES `Comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `AuthIdentity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `CommentVotes_commentId_userId_unique` ON `CommentVotes` (`commentId`,`userId`);
