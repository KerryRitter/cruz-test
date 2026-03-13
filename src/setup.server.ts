import "reflect-metadata";

import { DrizzleService } from "@cruzjs/core/shared/database/drizzle.service";
import { setUserProviders } from "@cruzjs/core/framework/application.server";
import type { ServiceProvider } from "@cruzjs/core/framework/service-provider";
import * as schema from "@/database/schema";
import { StartProvider } from "@cruzjs/start/start.provider";
import { SubredditsProvider } from "@/features/subreddits/subreddits.provider";
import { PostsProvider } from "@/features/posts/posts.provider";

DrizzleService.setSchema(schema);

export const userProviders: ServiceProvider[] = [new StartProvider(), SubredditsProvider, PostsProvider];

setUserProviders(() => userProviders);
