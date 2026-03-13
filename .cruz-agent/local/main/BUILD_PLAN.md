# Build Plan: Reddit-like Community Platform

## Overview

A community-driven content aggregator and discussion platform where users organize into niche communities (subreddits) to share content and debate via threaded discussions. Users can create and join communities, submit posts, vote on content, and engage in nested comment threads. Moderators keep communities healthy.

## Architecture

- **Scope**: Community-scoped (subredditId as partition key, analogous to orgId)
- **Core entities**: subreddits, memberships, posts, votes, comments, karma
- **Async/integrations**: Background job for hot/trending score recalculation (post-MVP), image hosting via R2 (post-MVP)

## Features

| # | Feature | Description | Scope | Status | Notes |
|---|---------|-------------|-------|--------|-------|
| 1 | `subreddits` | Create communities, discover and join them, manage membership | community-scoped | pending | |
| 2 | `posts` | Submit text posts to a subreddit, view post detail | community-scoped + user-authored | pending | |
| 3 | `votes` | Upvote/downvote posts; score tracked per post | user-specific | pending | |
| 4 | `feed` | Home feed (subscribed communities) + subreddit feed, sorted by Newest or Top | personalized | pending | |
| 5 | `comments` | Nested threaded comments on posts (recursive, unlimited depth) | community-scoped + user-authored | pending | |
| 6 | `karma` | User karma score (sum of votes received on posts & comments) | user-specific | pending | |
| 7 | `moderation` | Ban users from subreddits, remove posts, promote moderators | community-scoped | pending | |

## Build Order

1. `subreddits` — foundation; all other features reference subredditId
2. `posts` — depends on subreddits
3. `votes` — depends on posts
4. `feed` — depends on posts + votes (needs score data)
5. `comments` — depends on posts; votes on comments also added here
6. `karma` — depends on votes on both posts and comments
7. `moderation` — depends on subreddits + posts + comments

## Out of Scope (v1)

- Link/media post types (text only for MVP)
- Rich text / Markdown editor
- WebSocket live updates
- Search indexing (Algolia/Elasticsearch)
- Email/push notifications
- Awards/coins system
