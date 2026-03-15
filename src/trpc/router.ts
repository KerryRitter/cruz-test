import { router } from "@cruzjs/core/trpc/context";
import { registerCruzCoreTrpcRouters } from "@cruzjs/core/trpc/routers";
import { registerCruzStartTrpcRouters } from "@cruzjs/start/trpc/routers";
import type { RouterProcedures } from "@cruzjs/core";
import type { SubredditsTrpc } from "@/features/subreddits/subreddits.trpc";
import type { PostsTrpc } from "@/features/posts/posts.trpc";
import type { VotesTrpc } from "@/features/votes/votes.trpc";
import type { CommentsTrpc } from "@/features/comments/comments.trpc";
import type { KarmaTrpc } from "@/features/karma/karma.trpc";
import type { ModerationTrpc } from "@/features/moderation/moderation.trpc";

// App routers are registered at runtime via @Module({ routers }) and DI.
// This file exists solely to compose the AppRouter type for client-side type inference.
const appRouter = router({
  ...registerCruzCoreTrpcRouters(),
  ...registerCruzStartTrpcRouters(),
  subreddits: router({} as RouterProcedures<SubredditsTrpc>),
  posts: router({} as RouterProcedures<PostsTrpc>),
  votes: router({} as RouterProcedures<VotesTrpc>),
  comments: router({} as RouterProcedures<CommentsTrpc>),
  karma: router({} as RouterProcedures<KarmaTrpc>),
  moderation: router({} as RouterProcedures<ModerationTrpc>),
});

export type AppRouter = typeof appRouter;
