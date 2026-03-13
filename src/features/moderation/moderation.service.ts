import { Injectable, Inject } from '@cruzjs/core/di';
import { DRIZZLE, type DrizzleDatabase } from '@cruzjs/core/shared/database/drizzle.service';
import { eq, and } from 'drizzle-orm';
import { subredditBans } from './moderation.schema';
import { subredditMembers } from '@/features/subreddits/subreddits.schema';
import { posts } from '@/features/posts/posts.schema';
import type { SubredditBan } from './moderation.schema';
import type { SubredditMember } from '@/features/subreddits/subreddits.schema';

@Injectable()
export class ModerationService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
  ) {}

  async banUser(actorId: string, subredditId: string, userId: string, reason?: string): Promise<void> {
    await this.requireModerator(actorId, subredditId);

    const [targetMembership] = await this.db
      .select()
      .from(subredditMembers)
      .where(
        and(
          eq(subredditMembers.subredditId, subredditId),
          eq(subredditMembers.userId, userId),
        ),
      )
      .limit(1);

    if (targetMembership?.role === 'moderator') {
      throw new Error('Cannot ban a moderator');
    }

    await this.db.insert(subredditBans).values({
      subredditId,
      userId,
      bannedById: actorId,
      reason: reason ?? null,
    });

    if (targetMembership) {
      await this.db
        .delete(subredditMembers)
        .where(
          and(
            eq(subredditMembers.subredditId, subredditId),
            eq(subredditMembers.userId, userId),
          ),
        );
    }
  }

  async unbanUser(actorId: string, subredditId: string, userId: string): Promise<void> {
    await this.requireModerator(actorId, subredditId);

    await this.db
      .delete(subredditBans)
      .where(
        and(
          eq(subredditBans.subredditId, subredditId),
          eq(subredditBans.userId, userId),
        ),
      );
  }

  async removePost(actorId: string, subredditId: string, postId: string): Promise<void> {
    await this.requireModerator(actorId, subredditId);

    const [post] = await this.db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.subredditId, subredditId)))
      .limit(1);

    if (!post) {
      throw new Error('Post not found in this subreddit');
    }

    await this.db
      .update(posts)
      .set({ isRemoved: true })
      .where(eq(posts.id, postId));
  }

  async restorePost(actorId: string, subredditId: string, postId: string): Promise<void> {
    await this.requireModerator(actorId, subredditId);

    await this.db
      .update(posts)
      .set({ isRemoved: false })
      .where(and(eq(posts.id, postId), eq(posts.subredditId, subredditId)));
  }

  async promoteModerator(actorId: string, subredditId: string, userId: string): Promise<void> {
    await this.requireModerator(actorId, subredditId);

    const [membership] = await this.db
      .select()
      .from(subredditMembers)
      .where(
        and(
          eq(subredditMembers.subredditId, subredditId),
          eq(subredditMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new Error('User is not a member of this subreddit');
    }

    if (membership.role === 'moderator') {
      throw new Error('User is already a moderator');
    }

    await this.db
      .update(subredditMembers)
      .set({ role: 'moderator' })
      .where(
        and(
          eq(subredditMembers.subredditId, subredditId),
          eq(subredditMembers.userId, userId),
        ),
      );
  }

  async listBans(actorId: string, subredditId: string): Promise<SubredditBan[]> {
    await this.requireModerator(actorId, subredditId);

    return this.db
      .select()
      .from(subredditBans)
      .where(eq(subredditBans.subredditId, subredditId));
  }

  async listMembers(actorId: string, subredditId: string): Promise<SubredditMember[]> {
    await this.requireModerator(actorId, subredditId);

    return this.db
      .select()
      .from(subredditMembers)
      .where(eq(subredditMembers.subredditId, subredditId));
  }

  async isBanned(userId: string, subredditId: string): Promise<boolean> {
    const [ban] = await this.db
      .select()
      .from(subredditBans)
      .where(
        and(
          eq(subredditBans.subredditId, subredditId),
          eq(subredditBans.userId, userId),
        ),
      )
      .limit(1);

    return !!ban;
  }

  private async requireModerator(actorId: string, subredditId: string): Promise<void> {
    const [membership] = await this.db
      .select()
      .from(subredditMembers)
      .where(
        and(
          eq(subredditMembers.subredditId, subredditId),
          eq(subredditMembers.userId, actorId),
        ),
      )
      .limit(1);

    if (!membership || membership.role !== 'moderator') {
      throw new Error('You must be a moderator to perform this action');
    }
  }
}
