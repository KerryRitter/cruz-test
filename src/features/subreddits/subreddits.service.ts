import { Injectable, Inject } from '@cruzjs/core/di';
import { DRIZZLE, type DrizzleDatabase } from '@cruzjs/core/shared/database/drizzle.service';
import { eq, and, count, sql } from 'drizzle-orm';
import { subreddits, subredditMembers } from './subreddits.schema';
import type { CreateSubredditInput } from './subreddits.validation';

@Injectable()
export class SubredditsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
  ) {}

  async create(userId: string, input: CreateSubredditInput) {
    return this.db.transaction(async (tx) => {
      const [subreddit] = await tx.insert(subreddits)
        .values({
          name: input.name,
          title: input.title,
          description: input.description,
          createdById: userId,
        })
        .returning();

      await tx.insert(subredditMembers)
        .values({
          subredditId: subreddit.id,
          userId,
          role: 'moderator',
        });

      return subreddit;
    });
  }

  async list() {
    const memberCountSq = this.db
      .select({
        subredditId: subredditMembers.subredditId,
        memberCount: count().as('memberCount'),
      })
      .from(subredditMembers)
      .groupBy(subredditMembers.subredditId)
      .as('memberCounts');

    const results = await this.db
      .select({
        id: subreddits.id,
        name: subreddits.name,
        title: subreddits.title,
        description: subreddits.description,
        createdById: subreddits.createdById,
        createdAt: subreddits.createdAt,
        updatedAt: subreddits.updatedAt,
        memberCount: sql<number>`coalesce(${memberCountSq.memberCount}, 0)`.as('memberCount'),
      })
      .from(subreddits)
      .leftJoin(memberCountSq, eq(subreddits.id, memberCountSq.subredditId))
      .orderBy(subreddits.name);

    return results;
  }

  async getByName(name: string) {
    const [subreddit] = await this.db
      .select()
      .from(subreddits)
      .where(eq(subreddits.name, name))
      .limit(1);

    if (!subreddit) {
      return null;
    }

    const [memberCountResult] = await this.db
      .select({ count: count() })
      .from(subredditMembers)
      .where(eq(subredditMembers.subredditId, subreddit.id));

    return {
      ...subreddit,
      memberCount: memberCountResult?.count ?? 0,
    };
  }

  async join(userId: string, subredditId: string) {
    const [existing] = await this.db
      .select()
      .from(subredditMembers)
      .where(
        and(
          eq(subredditMembers.subredditId, subredditId),
          eq(subredditMembers.userId, userId),
        ),
      )
      .limit(1);

    if (existing) {
      return existing;
    }

    const [membership] = await this.db
      .insert(subredditMembers)
      .values({
        subredditId,
        userId,
        role: 'member',
      })
      .returning();

    return membership;
  }

  async leave(userId: string, subredditId: string) {
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
      throw new Error('Not a member of this subreddit');
    }

    if (membership.role === 'moderator') {
      const [modCount] = await this.db
        .select({ count: count() })
        .from(subredditMembers)
        .where(
          and(
            eq(subredditMembers.subredditId, subredditId),
            eq(subredditMembers.role, 'moderator'),
          ),
        );

      if ((modCount?.count ?? 0) <= 1) {
        throw new Error('Cannot leave: you are the only moderator');
      }
    }

    await this.db
      .delete(subredditMembers)
      .where(
        and(
          eq(subredditMembers.subredditId, subredditId),
          eq(subredditMembers.userId, userId),
        ),
      );

    return { success: true };
  }

  async getMembership(userId: string, subredditId: string) {
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

    return membership ?? null;
  }

  async listUserSubscriptions(userId: string) {
    return this.db
      .select({
        id: subreddits.id,
        name: subreddits.name,
        title: subreddits.title,
        description: subreddits.description,
        createdById: subreddits.createdById,
        createdAt: subreddits.createdAt,
        updatedAt: subreddits.updatedAt,
        role: subredditMembers.role,
        joinedAt: subredditMembers.joinedAt,
      })
      .from(subredditMembers)
      .innerJoin(subreddits, eq(subredditMembers.subredditId, subreddits.id))
      .where(eq(subredditMembers.userId, userId))
      .orderBy(subreddits.name);
  }
}
