import { Injectable, Inject } from '@cruzjs/core/di';
import { DRIZZLE, type DrizzleDatabase } from '@cruzjs/core/shared/database/drizzle.service';
import { eq, sql } from 'drizzle-orm';
import { postVotes } from '@/features/votes/votes.schema';
import { posts } from '@/features/posts/posts.schema';
import { comments, commentVotes } from '@/features/comments/comments.schema';

export type KarmaBreakdown = {
  postKarma: number;
  commentKarma: number;
  totalKarma: number;
};

@Injectable()
export class KarmaService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
  ) {}

  async getKarma(userId: string): Promise<KarmaBreakdown> {
    const [postResult] = await this.db
      .select({
        postKarma: sql<number>`COALESCE(SUM(${postVotes.value}), 0)`,
      })
      .from(postVotes)
      .innerJoin(posts, eq(postVotes.postId, posts.id))
      .where(eq(posts.authorId, userId));

    const [commentResult] = await this.db
      .select({
        commentKarma: sql<number>`COALESCE(SUM(${commentVotes.value}), 0)`,
      })
      .from(commentVotes)
      .innerJoin(comments, eq(commentVotes.commentId, comments.id))
      .where(eq(comments.authorId, userId));

    const postKarma = Number(postResult?.postKarma ?? 0);
    const commentKarma = Number(commentResult?.commentKarma ?? 0);

    return {
      postKarma,
      commentKarma,
      totalKarma: postKarma + commentKarma,
    };
  }

  async getBatchKarma(userIds: string[]): Promise<Record<string, number>> {
    if (userIds.length === 0) {
      return {};
    }

    const result: Record<string, number> = {};

    for (const userId of userIds) {
      const karma = await this.getKarma(userId);
      result[userId] = karma.totalKarma;
    }

    return result;
  }
}
