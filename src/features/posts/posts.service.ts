import { Injectable, Inject } from '@cruzjs/core/di';
import { DRIZZLE, type DrizzleDatabase } from '@cruzjs/core/shared/database/drizzle.service';
import { eq, and, desc } from 'drizzle-orm';
import { posts } from './posts.schema';
import { subredditMembers } from '@/features/subreddits/subreddits.schema';
import type { CreatePostInput } from './posts.validation';

@Injectable()
export class PostsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
  ) {}

  async create(authorId: string, input: CreatePostInput) {
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
      .where(eq(posts.subredditId, subredditId))
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
}
