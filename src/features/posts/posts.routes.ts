import type { RouteFactory } from '@cruzjs/core/routing';

export const postsRoutes: RouteFactory = (helpers) => [
  ...helpers.prefix('r', [
    helpers.route(':name/submit', 'features/posts/routes/posts.create.tsx'),
    helpers.route(':name/comments/:id', 'features/posts/routes/posts.$id.tsx'),
  ]),
];
