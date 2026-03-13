import { Injectable, Inject } from '@cruzjs/core/di';
import { DRIZZLE, type DrizzleDatabase } from '@cruzjs/core/shared/database/drizzle.service';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { postVotes } from './votes.schema';
import { posts } from '@/features/posts/posts.schema';

@Injectable()
export class VotesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
  ) {}

  async vote(userId: string, postId: string, value: 1 | -1): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(postVotes)
      .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)))
      .limit(1);

    if (!existing) {
      // No existing vote -- insert and increment score
      await this.db.insert(postVotes).values({ postId, userId, value });
      await this.db
        .update(posts)
        .set({ score: sql`${posts.score} + ${value}` })
        .where(eq(posts.id, postId));
    } else if (existing.value === value) {
      // Same vote -- toggle off (remove)
      await this.db
        .delete(postVotes)
        .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)));
      await this.db
        .update(posts)
        .set({ score: sql`${posts.score} - ${value}` })
        .where(eq(posts.id, postId));
    } else {
      // Different vote -- switch direction (delta is +2 or -2)
      const delta = value - existing.value;
      await this.db
        .update(postVotes)
        .set({ value })
        .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)));
      await this.db
        .update(posts)
        .set({ score: sql`${posts.score} + ${delta}` })
        .where(eq(posts.id, postId));
    }
  }

  async getPostVotes(postId: string): Promise<{ score: number }> {
    const [post] = await this.db
      .select({ score: posts.score })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    return { score: post?.score ?? 0 };
  }

  async getUserVoteForPost(userId: string, postId: string): Promise<{ value: number } | null> {
    const [vote] = await this.db
      .select({ value: postVotes.value })
      .from(postVotes)
      .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)))
      .limit(1);

    return vote ?? null;
  }

  async getUserVotesForPosts(userId: string, postIds: string[]): Promise<Record<string, number>> {
    if (postIds.length === 0) {
      return {};
    }

    const votes = await this.db
      .select({ postId: postVotes.postId, value: postVotes.value })
      .from(postVotes)
      .where(and(eq(postVotes.userId, userId), inArray(postVotes.postId, postIds)));

    const result: Record<string, number> = {};
    for (const vote of votes) {
      result[vote.postId] = vote.value;
    }
    return result;
  }
}
