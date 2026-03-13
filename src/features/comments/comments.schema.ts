import { sqliteTable, text, integer, unique, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { authIdentity } from '@cruzjs/core/database/schema';
import { posts } from '@/features/posts/posts.schema';

export const comments = sqliteTable('Comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  postId: text('postId')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('authorId')
    .notNull()
    .references(() => authIdentity.id, { onDelete: 'cascade' }),
  parentCommentId: text('parentCommentId')
    .references((): AnySQLiteColumn => comments.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  score: integer('score').notNull().default(0),
  depth: integer('depth').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const commentVotes = sqliteTable('CommentVotes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  commentId: text('commentId')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => authIdentity.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(), // +1 or -1
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (t) => ({
  uniqueCommentVote: unique().on(t.commentId, t.userId),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type CommentVote = typeof commentVotes.$inferSelect;
export type NewCommentVote = typeof commentVotes.$inferInsert;
