# Service Providers

Service Providers register feature modules with the framework. They are the primary extensibility mechanism.

## Creating a Provider

### Minimal (Most Features)

```typescript
// src/features/notes/notes.provider.ts
import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import { NotesModule } from './notes.module';

export const NotesProvider: ServiceProvider = {
  module: NotesModule,
};
```

The `@Module` on `NotesModule` handles providers, routers, and event listeners automatically.

### With Boot

```typescript
// src/features/blog/blog.provider.ts
import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import type { Container } from 'inversify';
import { BlogModule } from './blog.module';
import { BlogService } from './blog.service';

export const BlogProvider: ServiceProvider = {
  // Routes are declared in blog.routes.ts and referenced in @Module — not here
  module: BlogModule,

  // Optional: Run after all providers loaded
  async boot(container: Container) {
    const blogService = container.resolve(BlogService);
    await blogService.initialize();
  },
};
```

## Registration

In `src/setup.server.ts`:

```typescript
import 'reflect-metadata';
import { DrizzleService } from '@cruzjs/core/shared/database/drizzle.service';
import { setUserProviders } from '@cruzjs/core/framework/application.server';
import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import * as schema from '~/database/schema';
import { StartProvider } from '@cruzjs/start/start.provider';
import { NotesProvider } from '~/features/notes';
import { BlogProvider } from '~/features/blog';

DrizzleService.setSchema(schema);

export const userProviders: ServiceProvider[] = [
  new StartProvider(),
  NotesProvider,
  BlogProvider,
];

setUserProviders(() => userProviders);
```

## Provider Lifecycle

```
1. DrizzleService.setSchema(schema)       # Set database schema
2. setUserProviders([providers])           # Queue providers
3. bootstrapApp()                          # On first request:
   ├── Create CruzContainer
   ├── Load Core + Pro + Start modules
   ├── For each user provider:
   │   ├── loadModule(provider.module)     # @Module providers, routers, events, routes
   │   └── registerEventListeners()        # Additional listeners (optional)
   └── For each user provider:
       └── boot(container)                 # Post-init (optional)
```

## Extending Core Behavior

### User Hydrator

Add custom data to session responses:

```typescript
import { Injectable, Inject } from '@cruzjs/core/di';
import { IUserHydrator, USER_HYDRATOR } from '@cruzjs/core';

@Injectable()
export class UserProfileHydrator implements IUserHydrator {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async hydrate(identityId: string, email: string) {
    const [profile] = await this.db.select().from(userProfiles)
      .where(eq(userProfiles.id, identityId)).limit(1);
    return { profile: profile ?? null };
  }
}

// Register in module
@Module({
  providers: [
    UserProfileService,
    UserProfileHydrator,
    { provide: USER_HYDRATOR, useClass: UserProfileHydrator },
  ],
})
export class UserProfileModule {}
```

### Custom Job Handlers

```typescript
@Module({
  providers: [
    { provide: JOB_HANDLER, useClass: MyJobHandler, multi: true },
  ],
})
export class MyModule {}
```

### Listening to Core Events

```typescript
import { IdentityCreatedEvent } from '@cruzjs/core';
import { OrganizationCreatedEvent } from '@cruzjs/pro';

@Module({
  events: [
    { event: IdentityCreatedEvent, listener: createProfileOnRegistration },
    { event: OrganizationCreatedEvent, listener: setupOrgDefaults },
  ],
})
export class MyModule {}
```

## Complete Feature Structure

```
src/features/blog/
├── index.ts                 # Barrel exports
├── blog.provider.ts         # ServiceProvider
├── blog.module.ts           # @Module (providers, routers, events, routes)
├── blog.routes.ts           # React Router route config
├── blog.trpc.ts             # tRPC router
├── blog.service.ts          # @Injectable business logic
├── blog.schema.ts           # Drizzle table
├── blog.validation.ts       # Zod schemas
├── blog.models.ts           # TypeScript types
├── routes/                  # Route page components
│   ├── blog._index.tsx
│   └── blog.$id.tsx
└── events/                  # Domain events
    ├── index.ts
    └── post-created.event.ts
```

## Rules

1. One provider per feature
2. Use `@Module` for providers, routers, and events (preferred over manual methods)
3. Never modify `@cruzjs/core`, `@cruzjs/start`, or `@cruzjs/pro` -- extend via providers
4. Keep modules focused -- one responsibility per module
5. Register all providers in `setup.server.ts`
