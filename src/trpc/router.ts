import { router } from "@cruzjs/core/trpc/context";
import { registerCruzCoreTrpcRouters } from "@cruzjs/core/trpc/routers";
import { registerCruzStartTrpcRouters } from "@cruzjs/start/trpc/routers";
import { subredditsTrpc } from "@/features/subreddits/subreddits.trpc";
import { postsTrpc } from "@/features/posts/posts.trpc";
import { votesTrpc } from "@/features/votes/votes.trpc";

const appRouter = router({
  ...registerCruzCoreTrpcRouters(),
  ...registerCruzStartTrpcRouters(),
  subreddits: subredditsTrpc,
  posts: postsTrpc,
  votes: votesTrpc,
});

export type AppRouter = typeof appRouter;
