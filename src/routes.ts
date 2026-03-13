import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";
import { createCruzRoutes } from "@cruzjs/core/routing/create-routes";
import { registerCruzStartRoutes } from "@cruzjs/start/routing";
import { SubredditsModule } from "./features/subreddits/subreddits.module";
import { PostsModule } from "./features/posts/posts.module";
import { ModerationModule } from "./features/moderation/moderation.module";
import { KarmaModule } from "./features/karma/karma.module";

export default createCruzRoutes({
  route,
  index,
  layout,
  prefix,
  dir: import.meta.dirname,
  framework: {
    registrars: [registerCruzStartRoutes],
  },
  modules: [SubredditsModule, PostsModule, ModerationModule, KarmaModule],
  routes: [
    index("routes/index.tsx"),
  ],
}) satisfies RouteConfig;
