# Build Context: Reddit-like Community Platform

## What We're Building

A community-driven content aggregator and discussion platform modeled after Reddit. Users organize into niche communities called subreddits to share text content and engage in threaded discussions. The platform supports three user archetypes: content creators who post and comment, lurkers who read without contributing, and moderators who maintain community health.

## User Requirements

### Core Purpose
Allow users to organize into niche communities (subreddits) to share content and debate via threaded discussions.

### Main Entities
- **Users**: Profiles, reputation (Karma), and subscriptions
- **Subreddits**: Containers for posts, each with its own rules and moderators
- **Posts**: Unit of content (text-based for MVP; links/media post-MVP)
- **Comments**: Recursive — comments on comments (nested threads)
- **Votes**: Polymorphic — upvotes/downvotes across posts and comments

### Data Scoping
Community-scoped platform. Data is partitioned by subreddit. A user's experience is defined by the communities they follow, creating a personalized "Home" feed. `subredditId` functions as the partition key (analogous to `orgId` in CruzJS patterns).

### Async Work
- Background jobs for "Hot" and "Trending" ranking recalculation (every few minutes)
- Image hosting via R2 or Cloudinary
- Email/push notifications for mentions, replies, community invites
- Search indexing via Algolia/Elasticsearch

### MVP Scope
1. Authentication (already built in CruzJS)
2. Subreddits — create and join communities
3. Posts — submit text posts
4. Votes — upvote/downvote
5. Basic feed — sorted by Newest or Most Upvoted

### Post-MVP (Nice-to-Haves)
- Rich text / Markdown editor
- Nested comments (deep threading)
- Moderation tools (ban users, remove posts)
- Live updates via WebSockets
- Karma system with visual score

## Key Decisions

| Decision | Value | Reasoning |
|----------|-------|-----------|
| Data ownership | Community-scoped (subredditId) | Platform is public multi-community, not org/workspace multi-tenant |
| Auth | Use existing CruzJS auth | Already built; skip |
| Post types (v1) | Text only | Simplifies schema; links/media post-MVP |
| Comment threading | Recursive with parentCommentId FK | Standard adjacency list; unlimited depth |
| Vote uniqueness | Unique constraint (userId, postId) and (userId, commentId) | Prevent double-voting at DB level |
| Karma calculation | Computed from votes table on read (or denormalized) | Start simple; optimize later |
| Moderation | Subreddit-scoped bans + post removal | Feature 7; moderator role per subreddit |
