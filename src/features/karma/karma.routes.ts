import type { RouteFactory } from '@cruzjs/core/routing';

export const karmaRoutes: RouteFactory = (helpers) => [
  ...helpers.prefix('u', [
    helpers.route(':userId', 'features/karma/routes/karma.$userId.tsx'),
  ]),
];
