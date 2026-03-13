import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { authIdentity } from '@cruzjs/core/database/schema';

export const subreddits = sqliteTable('Subreddits', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  createdById: text('createdById')
    .notNull()
    .references(() => authIdentity.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const subredditMembers = sqliteTable('SubredditMembers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  subredditId: text('subredditId')
    .notNull()
    .references(() => subreddits.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => authIdentity.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['member', 'moderator'] }).notNull().default('member'),
  joinedAt: integer('joinedAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (t) => ({
  uniqueMembership: unique().on(t.subredditId, t.userId),
}));

export type Subreddit = typeof subreddits.$inferSelect;
export type NewSubreddit = typeof subreddits.$inferInsert;
export type SubredditMember = typeof subredditMembers.$inferSelect;
export type NewSubredditMember = typeof subredditMembers.$inferInsert;
