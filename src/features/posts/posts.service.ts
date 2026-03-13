import { Injectable, Inject } from '@cruzjs/core/di';
import { DRIZZLE, type DrizzleDatabase } from '@cruzjs/core/shared/database/drizzle.service';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import { posts } from './posts.schema';
import { subreddits, subredditMembers } from '@/features/subreddits/subreddits.schema';
import { subredditBans } from '@/features/moderation/moderation.schema';
import type { CreatePostInput } from './posts.validation';
import type { Post } from './posts.schema';

export type FeedPost = Post & { subredditName: string };

@Injectable()
export class PostsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
  ) {}

  async create(authorId: string, input: CreatePostInput) {
    const [ban] = await this.db
      .select()
      .from(subredditBans)
      .where(
        and(
          eq(subredditBans.subredditId, input.subredditId),
          eq(subredditBans.userId, authorId),
        ),
      )
      .limit(1);

    if (ban) {
      throw new Error('You are banned from this subreddit');
    }

    const [membership] = await this.db
      .select()
      .from(subredditMembers)
      .where(
        and(
          eq(subredditMembers.subredditId, input.subredditId),
          eq(subredditMembers.userId, authorId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new Error('You must be a member of this subreddit to create a post');
    }

    const [post] = await this.db
      .insert(posts)
      .values({
        subredditId: input.subredditId,
        authorId,
        title: input.title,
        body: input.body,
      })
      .returning();

    return post;
  }

  async listBySubreddit(subredditId: string, sort: 'new' | 'top') {
    const orderColumn = sort === 'top' ? posts.score : posts.createdAt;

    return this.db
      .select()
      .from(posts)
      .where(and(eq(posts.subredditId, subredditId), eq(posts.isRemoved, false)))
      .orderBy(desc(orderColumn))
      .limit(50);
  }

  async getById(id: string) {
    const [post] = await this.db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    return post ?? null;
  }

  async getFeed(userId: string | null, sort: 'new' | 'top'): Promise<FeedPost[]> {
    let subredditIds: string[] | null = null;

    if (userId) {
      const memberships = await this.db
        .select({ subredditId: subredditMembers.subredditId })
        .from(subredditMembers)
        .where(eq(subredditMembers.userId, userId));

      if (memberships.length > 0) {
        subredditIds = memberships.map((m) => m.subredditId);
      }
    }

    const orderColumn = sort === 'top' ? posts.score : posts.createdAt;

    const conditions = subredditIds
      ? and(inArray(posts.subredditId, subredditIds), eq(posts.isRemoved, false))
      : eq(posts.isRemoved, false);

    const results = await this.db
      .select({
        id: posts.id,
        subredditId: posts.subredditId,
        authorId: posts.authorId,
        title: posts.title,
        body: posts.body,
        score: posts.score,
        commentCount: posts.commentCount,
        isRemoved: posts.isRemoved,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        subredditName: subreddits.name,
      })
      .from(posts)
      .innerJoin(subreddits, eq(posts.subredditId, subreddits.id))
      .where(conditions)
      .orderBy(desc(orderColumn))
      .limit(100);

    return results;
  }

  async listByAuthor(authorId: string): Promise<FeedPost[]> {
    const results = await this.db
      .select({
        id: posts.id,
        subredditId: posts.subredditId,
        authorId: posts.authorId,
        title: posts.title,
        body: posts.body,
        score: posts.score,
        commentCount: posts.commentCount,
        isRemoved: posts.isRemoved,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        subredditName: subreddits.name,
      })
      .from(posts)
      .innerJoin(subreddits, eq(posts.subredditId, subreddits.id))
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt))
      .limit(20);

    return results;
  }
}
