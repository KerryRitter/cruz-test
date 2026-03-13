import { trpc } from '@/trpc/client';
import { Link } from 'react-router';

export default function SubredditsIndexPage() {
  const { data: subreddits, isLoading, refetch } = trpc.subreddits.list.useQuery();
  const { data: subscriptions } = trpc.subreddits.mySubscriptions.useQuery(undefined, {
    retry: false,
  });

  const joinMutation = trpc.subreddits.join.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const leaveMutation = trpc.subreddits.leave.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const subscribedIds = new Set(subscriptions?.map((s) => s.id) ?? []);

  const handleJoin = (subredditId: string) => {
    joinMutation.mutate({ subredditId });
  };

  const handleLeave = (subredditId: string) => {
    leaveMutation.mutate({ subredditId });
  };

  if (isLoading) {
    return <div className="p-8">Loading communities...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communities</h1>
          <p className="text-slate-600 mt-1">Discover and join communities</p>
        </div>
        <Link
          to="/subreddits/create"
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          Create Community
        </Link>
      </div>

      {!subreddits || subreddits.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No communities yet.</p>
          <p className="mt-2">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {subreddits.map((subreddit) => {
            const isMember = subscribedIds.has(subreddit.id);
            return (
              <div
                key={subreddit.id}
                className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 flex items-start justify-between"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/r/${subreddit.name}`}
                    className="text-lg font-semibold text-brand-600 hover:text-brand-700"
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
                      onClick={() => handleLeave(subreddit.id)}
                      disabled={leaveMutation.isPending}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                      Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(subreddit.id)}
                      disabled={joinMutation.isPending}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
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
