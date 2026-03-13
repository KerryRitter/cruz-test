/// <reference path="./cloudflare.d.ts" />

import * as schema from "./database/schema";
import { userProviders } from "./setup.server";
import { createCruzApp } from "@cruzjs/core/framework/create-cruz-app";

export default createCruzApp({
  schema,
  providers: userProviders,

  // Pages — React Router SSR (virtual module resolved by Vite at build time)
  // @ts-expect-error — virtual module resolved by Vite/wrangler, not visible to tsc
  pages: () => import("virtual:react-router/server-build"),
});
