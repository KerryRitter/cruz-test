import type { RouteFactory } from '@cruzjs/core/routing';

export const moderationRoutes: RouteFactory = (helpers) => [
  ...helpers.prefix('r', [
    helpers.route(':name/mod', 'features/moderation/routes/moderation.mod.tsx'),
  ]),
];
