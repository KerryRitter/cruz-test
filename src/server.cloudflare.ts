/// <reference path="./cloudflare.d.ts" />

import * as schema from "./database/schema";
import { createCruzApp } from "@cruzjs/core/framework/create-cruz-app";
import { CloudflareAdapter } from "@cruzjs/adapter-cloudflare";
import { StartModule } from "@cruzjs/start";
import { SubredditsModule } from "./features/subreddits/subreddits.module";
import { PostsModule } from "./features/posts/posts.module";
import { VotesModule } from "./features/votes/votes.module";
import { CommentsModule } from "./features/comments/comments.module";
import { KarmaModule } from "./features/karma/karma.module";
import { ModerationModule } from "./features/moderation/moderation.module";

export default createCruzApp({
  schema,
  modules: [
    StartModule,
    SubredditsModule,
    PostsModule,
    VotesModule,
    CommentsModule,
    KarmaModule,
    ModerationModule,
  ],
  adapter: new CloudflareAdapter(),
  // @ts-expect-error — virtual module resolved by Vite/wrangler, not visible to tsc
  pages: () => import("virtual:react-router/server-build"),
});
