import type { RouteFactory } from '@cruzjs/core/routing';

export const subredditsRoutes: RouteFactory = (helpers) => [
  ...helpers.prefix('subreddits', [
    helpers.index('features/subreddits/routes/subreddits._index.tsx'),
    helpers.route('create', 'features/subreddits/routes/subreddits.create.tsx'),
  ]),
  ...helpers.prefix('r', [
    helpers.route(':name', 'features/subreddits/routes/subreddits.$name.tsx'),
  ]),
];
