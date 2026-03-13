# Architecture

## Project Structure

```
src/
├── entry.server.tsx        # SSR entry — initializes CloudflareContext per request
├── entry.client.tsx        # Client-side hydration
├── root.tsx                # Root React component with providers
├── routes.ts               # React Router route config
├── setup.server.ts         # Provider registration + schema setup
├── database/
│   ├── schema.ts           # Central schema (re-exports packages + your tables)
│   └── migrations/         # Generated Drizzle migrations
├── features/               # Feature modules
│   └── <name>/
│       ├── index.ts
│       ├── <name>.provider.ts
│       ├── <name>.module.ts
│       ├── <name>.routes.ts     # React Router route config
│       ├── <name>.trpc.ts
│       ├── <name>.service.ts
│       ├── <name>.schema.ts
│       ├── <name>.validation.ts
│       ├── <name>.models.ts
│       ├── routes/              # Route page components
│       │   ├── <name>._index.tsx
│       │   └── <name>.$id.tsx
│       └── events/              # Domain events (optional)
├── components/              # Shared React components
├── contexts/                # React context providers
└── trpc/
    ├── client.ts            # tRPC React client hooks
    └── router.ts            # Combined AppRouter
external-processes/          # Standalone Workers/Workflows/Queue consumers
cruz.config.ts               # Cloudflare bindings and deployment config
wrangler.toml                # Generated — do not edit manually
```

## Package Boundaries

| Package | Purpose | Modify? |
|---------|---------|---------|
| `@cruzjs/core` | DI, auth, tRPC, database, CF bindings | Never |
| `@cruzjs/start` | UI components, theming, pre-built auth pages | Never |
| `@cruzjs/pro` | Orgs, billing, permissions, admin | Never |
| `src/features/` | Your feature modules | Always |
| `src/components/` | Your shared components | Always |

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Feature dir | `kebab-case` | `user-profile` |
| Service class | `PascalCase` + `Service` | `NotesService` |
| Router | `camelCase` + `Router` | `notesRouter` |
| Module class | `PascalCase` + `Module` | `NotesModule` |
| Provider | `PascalCase` + `Provider` | `NotesProvider` |
| Schema table | `camelCase` | `notes`, `orgMembers` |
| Validation | `camelCase` + `Schema` | `createNoteSchema` |
| Event class | `PascalCase` + `Event` | `NoteCreatedEvent` |

## Bootstrap Flow

```
1. setup.server.ts (imported first)
   ├── DrizzleService.setSchema(schema)
   └── setUserProviders([StartProvider, YourProviders...])

2. entry.server.tsx (per request)
   ├── CloudflareContext.init(loadContext)  # Extract D1/KV/R2 bindings
   └── bootstrapApp()
       ├── Create CruzContainer
       ├── Load Core + Pro + Start modules
       ├── Load your feature modules
       ├── Register tRPC routers
       ├── Register event listeners
       └── Run boot phase
```

## Request Flow

```
Browser → React Router Loader/Action
  → /api/trpc/* endpoint
    → tRPC procedure (public | protected | org)
      → requirePermission() (if org-scoped)
        → Service class (from DI container)
          → Drizzle query (D1 in prod, SQLite locally)
            → JSON response
```

## Feature Module Pattern

Every feature is self-contained. Routes are declared in `<feature>.routes.ts`, referenced in `@Module`, and activated by adding the module to `createCruzRoutes`. **Never** manually wire routes in `routes.ts` with `prefix()`/`route()`.

```typescript
// src/features/notes/notes.routes.ts
import type { CruzRouteHelpers } from '@cruzjs/core/routing';

export function notesRoutes(helpers: CruzRouteHelpers) {
  return [
    ...helpers.prefix('notes', [
      helpers.index('features/notes/routes/notes._index.tsx'),
      helpers.route(':id', 'features/notes/routes/notes.$id.tsx'),
    ]),
  ];
}
```

```typescript
// src/features/notes/notes.module.ts
import { notesRoutes } from './notes.routes';

@Module({ providers: [NotesService], routers: { notes: notesTrpc }, routes: notesRoutes })
export class NotesModule {}
```

```typescript
// src/routes.ts — add module, never wire routes manually
import { createCruzRoutes } from '@cruzjs/core/routing';
import { NotesModule } from './features/notes/notes.module';

export default createCruzRoutes({
  dir: import.meta.dirname,
  modules: [NotesModule],
  routes: [index('routes/index.tsx')],
});
```

Register features in `setup.server.ts`:

```typescript
export const userProviders: ServiceProvider[] = [
  new StartProvider(),
  NotesProvider,
];
setUserProviders(() => userProviders);
```
