#!/usr/bin/env node
/**
 * Post-build step: copies the React Router server bundle into dist/client
 * and generates the Cloudflare Pages _worker.js entry point.
 */
import { copyFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const WORKER_JS = `import { createRequestHandler } from "@react-router/cloudflare";
import * as serverBuild from "./_server.js";

const requestHandler = createRequestHandler({ build: serverBuild, mode: "production" });

export default {
  async fetch(request, env, ctx) {
    try {
      if (request.method === "GET" && env.ASSETS) {
        try {
          const assetResponse = await env.ASSETS.fetch(request.url, { headers: request.headers });
          if (assetResponse.status >= 200 && assetResponse.status < 400) return assetResponse;
        } catch {}
      }
      const context = { request, env, waitUntil: ctx.waitUntil.bind(ctx), passThroughOnException: ctx.passThroughOnException?.bind(ctx) || (() => {}) };
      return await requestHandler(context);
    } catch (error) {
      console.error("[Worker] Error:", error.message || error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};`;

const distClient = resolve(rootDir, 'dist/client');
const distServer = resolve(rootDir, 'dist/server');

if (!existsSync(distClient)) {
  console.error('dist/client not found — run react-router build first');
  process.exit(1);
}
if (!existsSync(resolve(distServer, 'index.js'))) {
  console.error('dist/server/index.js not found — build may have failed');
  process.exit(1);
}

copyFileSync(resolve(distServer, 'index.js'), resolve(distClient, '_server.js'));

const serverAssetsDir = resolve(distServer, 'assets');
if (existsSync(serverAssetsDir)) {
  const assetsOut = resolve(distClient, 'assets');
  if (!existsSync(assetsOut)) mkdirSync(assetsOut, { recursive: true });
  for (const file of readdirSync(serverAssetsDir)) {
    copyFileSync(resolve(serverAssetsDir, file), resolve(assetsOut, file));
  }
}

writeFileSync(resolve(distClient, '_worker.js'), WORKER_JS);
console.log('✓ _worker.js generated');
