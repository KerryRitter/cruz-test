import "reflect-metadata";

import { DrizzleService } from "@cruzjs/core/shared/database/drizzle.service";
import { setUserProviders } from "@cruzjs/core/framework/application.server";
import type { ServiceProvider } from "@cruzjs/core/framework/service-provider";
import * as schema from "@/database/schema";
import { StartProvider } from "@cruzjs/start/start.provider";

// Feature modules (no more ServiceProvider wrappers needed)
import { SubredditsModule } from "@/features/subreddits/subreddits.module";
import { PostsModule } from "@/features/posts/posts.module";
import { VotesModule } from "@/features/votes/votes.module";
import { CommentsModule } from "@/features/comments/comments.module";
import { KarmaModule } from "@/features/karma/karma.module";
import { ModerationModule } from "@/features/moderation/moderation.module";

DrizzleService.setSchema(schema);

export const userModules = [
  SubredditsModule,
  PostsModule,
  VotesModule,
  CommentsModule,
  KarmaModule,
  ModerationModule,
];

// StartProvider uses legacy ServiceProvider pattern for boot/event hooks
export const startProvider = new StartProvider();

// Legacy: setUserProviders for tRPC handler and middleware backward compat
setUserProviders(() => [
  startProvider,
  ...userModules.map((m): ServiceProvider => ({ module: m })),
]);
