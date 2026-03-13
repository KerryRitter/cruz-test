import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { authIdentity } from '@cruzjs/core/database/schema';
import { subreddits } from '@/features/subreddits/subreddits.schema';

export const posts = sqliteTable('Posts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  subredditId: text('subredditId')
    .notNull()
    .references(() => subreddits.id, { onDelete: 'cascade' }),
  authorId: text('authorId')
    .notNull()
    .references(() => authIdentity.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body'),
  score: integer('score').notNull().default(0),
  commentCount: integer('commentCount').notNull().default(0),
  isRemoved: integer('isRemoved', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
