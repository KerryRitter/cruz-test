import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { authIdentity } from '@cruzjs/core/database/schema';
import { subreddits } from '@/features/subreddits/subreddits.schema';

export const subredditBans = sqliteTable('SubredditBans', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  subredditId: text('subredditId')
    .notNull()
    .references(() => subreddits.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => authIdentity.id, { onDelete: 'cascade' }),
  bannedById: text('bannedById')
    .notNull()
    .references(() => authIdentity.id, { onDelete: 'cascade' }),
  reason: text('reason'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (t) => ({
  uniqueBan: unique().on(t.subredditId, t.userId),
}));

export type SubredditBan = typeof subredditBans.$inferSelect;
export type NewSubredditBan = typeof subredditBans.$inferInsert;
