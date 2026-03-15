/// <reference path="./cloudflare.d.ts" />

import * as schema from "./database/schema";
import { userModules, startProvider } from "./setup.server";
import { createCruzApp } from "@cruzjs/core/framework/create-cruz-app";
import { CloudflareAdapter } from "@cruzjs/adapter-cloudflare";

export default createCruzApp({
  schema,
  modules: userModules,
  providers: [startProvider],
  adapter: new CloudflareAdapter(),

  // Pages — React Router SSR (virtual module resolved by Vite at build time)
  // @ts-expect-error — virtual module resolved by Vite/wrangler, not visible to tsc
  pages: () => import("virtual:react-router/server-build"),
});
