import { Injectable, Inject } from '@cruzjs/core/di';
import { DRIZZLE, type DrizzleDatabase } from '@cruzjs/core/shared/database/drizzle.service';
import { eq, and, sql, asc, inArray } from 'drizzle-orm';
import { comments, commentVotes } from './comments.schema';
import { posts } from '@/features/posts/posts.schema';
import type { Comment } from './comments.schema';

export type CreateCommentInput = {
  postId: string;
  body: string;
  parentCommentId?: string | null;
};

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
  ) {}

  async listByPost(postId: string): Promise<Comment[]> {
    return this.db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));
  }

  async create(authorId: string, input: CreateCommentInput): Promise<Comment> {
    let depth = 0;

    if (input.parentCommentId) {
      const [parent] = await this.db
        .select({ depth: comments.depth })
        .from(comments)
        .where(eq(comments.id, input.parentCommentId))
        .limit(1);

      if (!parent) {
        throw new Error('Parent comment not found');
      }

      depth = parent.depth + 1;
    }

    const [comment] = await this.db
      .insert(comments)
      .values({
        postId: input.postId,
        authorId,
        parentCommentId: input.parentCommentId ?? null,
        body: input.body,
        depth,
      })
      .returning();

    await this.db
      .update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, input.postId));

    return comment;
  }

  async voteComment(userId: string, commentId: string, value: 1 | -1): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(commentVotes)
      .where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)))
      .limit(1);

    if (!existing) {
      await this.db.insert(commentVotes).values({ commentId, userId, value });
      await this.db
        .update(comments)
        .set({ score: sql`${comments.score} + ${value}` })
        .where(eq(comments.id, commentId));
    } else if (existing.value === value) {
      await this.db
        .delete(commentVotes)
        .where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)));
      await this.db
        .update(comments)
        .set({ score: sql`${comments.score} - ${value}` })
        .where(eq(comments.id, commentId));
    } else {
      const delta = value - existing.value;
      await this.db
        .update(commentVotes)
        .set({ value })
        .where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)));
      await this.db
        .update(comments)
        .set({ score: sql`${comments.score} + ${delta}` })
        .where(eq(comments.id, commentId));
    }
  }

  async getUserVotesForComments(userId: string, commentIds: string[]): Promise<Record<string, number>> {
    if (commentIds.length === 0) {
      return {};
    }

    const votes = await this.db
      .select({ commentId: commentVotes.commentId, value: commentVotes.value })
      .from(commentVotes)
      .where(and(eq(commentVotes.userId, userId), inArray(commentVotes.commentId, commentIds)));

    const result: Record<string, number> = {};
    for (const vote of votes) {
      result[vote.commentId] = vote.value;
    }
    return result;
  }
}
