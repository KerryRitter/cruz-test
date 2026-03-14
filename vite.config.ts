import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare';
import { reactRouter } from '@react-router/dev/vite';
import { serverOnlyPlugin } from '@cruzjs/core/vite';
import tailwindcss from '@tailwindcss/vite';
import babel from 'vite-plugin-babel';
import * as path from 'path';
import { defineConfig } from 'vite-plus';

// Packages that must stay external (Node-only, CF-unsupported, or optional heavy deps)
const externalPackages: (string | RegExp)[] = [
  'reflect-metadata',
  'better-sqlite3',
  '@dnd-kit/core',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  'recharts',
  'drizzle-orm/better-sqlite3',
  'drizzle-orm/bun-sqlite',
  'drizzle-orm/libsql',
  'drizzle-orm/sql.js',
  'drizzle-orm/node-postgres',
  'drizzle-orm/postgres-js',
  'drizzle-orm/neon-serverless',
  'drizzle-orm/neon-http',
  'drizzle-orm/mysql2',
  'drizzle-orm/planetscale-serverless',
  'drizzle-kit',
];

function isExternal(id: string): boolean {
  return externalPackages.some((pattern) => {
    if (typeof pattern === 'string') {
      return id === pattern || id.startsWith(pattern + '/');
    }
    return pattern.test(id);
  });
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    server: {
      port: 5001,
      watch: {
        ignored: ['**/.wrangler/**'],
      },
    },
    plugins: [
      serverOnlyPlugin(),
      // Run Babel before Oxc so legacy TypeScript decorators (@Injectable, @Inject)
      // are transformed to plain JS before Rolldown sees them.
      babel({
        filter: /\.[jt]sx?$/,
        include: [/\/src\//, /@cruzjs\//],
        optimizeOnSSR: true,
        babelConfig: {
          babelrc: false,
          configFile: false,
          plugins: [
            ['@babel/plugin-syntax-typescript', { allExtensions: true, isTSX: true }],
            'babel-plugin-transform-typescript-metadata',
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-transform-class-properties', { loose: true }],
          ],
        },
      }),
      tailwindcss(),
      cloudflareDevProxy({
        configPath: './wrangler.dev.toml',
        persist: { path: './.wrangler/state/v3' },
      }),
      reactRouter(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rolldownOptions: {
        external: (id: string) => isExternal(id),
      },
    },
    ssr: {
      noExternal: isBuild
        ? ['inversify', /^@cruzjs\//, /^@react-router\//]
        : ['inversify', /^@cruzjs\//],
      external: externalPackages.filter((p): p is string => typeof p === 'string'),
    },
    optimizeDeps: {
      exclude: ['inversify'],
    },
  };
});
