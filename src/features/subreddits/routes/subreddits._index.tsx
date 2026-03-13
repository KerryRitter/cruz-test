import { trpc } from '@/trpc/client';
import { Link, useLoaderData } from 'react-router';
import { withLoaderMiddleware } from '@cruzjs/core/routing/middleware';
import { SubredditsService } from '@/features/subreddits/subreddits.service';
import type { LoaderFunctionArgs } from 'react-router';

import '@/setup.server';

export const loader = async (args: LoaderFunctionArgs) =>
  withLoaderMiddleware([args], async ({ container }) => {
    const service = container.resolve(SubredditsService);
    const subreddits = await service.list();
    return { subreddits };
  });

export default function SubredditsIndexPage() {
  const { subreddits: initialSubreddits } = useLoaderData<typeof loader>();

  const { data: querySubreddits, refetch } = trpc.subreddits.list.useQuery();
  const subreddits = querySubreddits ?? initialSubreddits;

  const { data: subscriptions } = trpc.subreddits.mySubscriptions.useQuery(undefined, {
    retry: false,
  });

  const isLoggedIn = subscriptions !== undefined;
  const subscribedIds = new Set(subscriptions?.map((s) => s.id) ?? []);

  const joinMutation = trpc.subreddits.join.useMutation({ onSuccess: () => refetch() });
  const leaveMutation = trpc.subreddits.leave.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communities</h1>
          <p className="text-slate-600 mt-1">Discover and join communities</p>
        </div>
        <Link
          to="/subreddits/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Create Community
        </Link>
      </div>

      {!isLoggedIn && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <p className="text-indigo-900 text-sm font-medium mb-1">
            Want to join and post in communities?
          </p>
          <p className="text-indigo-800 text-sm mb-3">
            Sign in to join communities, create posts, and participate in discussions.
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/auth/register"
              className="inline-block px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {!subreddits || subreddits.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg font-medium">No communities yet.</p>
            <p className="mt-2">Be the first to create one!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {subreddits.map((subreddit) => {
            const isMember = subscribedIds.has(subreddit.id);
            return (
              <div
                key={subreddit.id}
                className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all flex items-start justify-between"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/r/${subreddit.name}`}
                    className="text-lg font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    r/{subreddit.name}
                  </Link>
                  <p className="text-slate-900 font-medium mt-1">{subreddit.title}</p>
                  {subreddit.description && (
                    <p className="text-slate-600 mt-1 text-sm">{subreddit.description}</p>
                  )}
                  <p className="text-slate-500 text-sm mt-2">
                    {subreddit.memberCount} {subreddit.memberCount === 1 ? 'member' : 'members'}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {isMember ? (
                    <button
                      onClick={() => leaveMutation.mutate({ subredditId: subreddit.id })}
                      disabled={leaveMutation.isPending}
                      className="px-4 py-2 border-2 border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-sm font-medium"
                    >
                      Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => joinMutation.mutate({ subredditId: subreddit.id })}
                      disabled={joinMutation.isPending}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
