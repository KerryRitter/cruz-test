import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";
import { createCruzRoutes } from "@cruzjs/core/routing/create-routes";
import { registerCruzStartRoutes } from "@cruzjs/start/routing";
import { subredditsRoutes } from "./features/subreddits/subreddits.routes";
import { postsRoutes } from "./features/posts/posts.routes";
import { moderationRoutes } from "./features/moderation/moderation.routes";
import { karmaRoutes } from "./features/karma/karma.routes";

export default createCruzRoutes({
  route,
  index,
  layout,
  prefix,
  dir: import.meta.dirname,
  framework: {
    registrars: [registerCruzStartRoutes],
  },
  featureRoutes: [subredditsRoutes, postsRoutes, moderationRoutes, karmaRoutes],
  routes: [
    index("routes/index.tsx"),
  ],
}) satisfies RouteConfig;
