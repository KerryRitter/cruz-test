import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";
import { createCruzRoutes } from "@cruzjs/core/routing/create-routes";
import { registerCruzStartRoutes } from "@cruzjs/start/routing";

export default createCruzRoutes({
  route,
  index,
  layout,
  prefix,
  dir: import.meta.dirname,
  framework: {
    registrars: [registerCruzStartRoutes],
  },
  featureRoutes: [],
  routes: [
    index("routes/index.tsx"),
    ...prefix("subreddits", [
      index("features/subreddits/routes/subreddits._index.tsx"),
      route("create", "features/subreddits/routes/subreddits.create.tsx"),
    ]),
    ...prefix("r", [
      route(":name", "features/subreddits/routes/subreddits.$name.tsx"),
    ]),
  ],
}) satisfies RouteConfig;
