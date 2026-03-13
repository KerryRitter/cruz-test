import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { authIdentity } from '@cruzjs/core/database/schema';
import { posts } from '@/features/posts/posts.schema';

export const postVotes = sqliteTable('PostVotes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  postId: text('postId')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => authIdentity.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(), // +1 or -1
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (t) => ({
  uniqueVote: unique().on(t.postId, t.userId),
}));

export type PostVote = typeof postVotes.$inferSelect;
export type NewPostVote = typeof postVotes.$inferInsert;
