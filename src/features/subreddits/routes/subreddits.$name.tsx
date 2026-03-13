import { useParams } from 'react-router';
import { Link } from 'react-router';
import { trpc } from '@/trpc/client';

export default function SubredditPage() {
  const { name } = useParams<{ name: string }>();
  const { data: subreddit, isLoading, error } = trpc.subreddits.getByName.useQuery(
    { name: name! },
    { enabled: !!name },
  );

  const { data: membership, refetch: refetchMembership } = trpc.subreddits.mySubscriptions.useQuery(
    undefined,
    { retry: false },
  );

  const joinMutation = trpc.subreddits.join.useMutation({
    onSuccess: () => {
      refetchMembership();
    },
  });

  const leaveMutation = trpc.subreddits.leave.useMutation({
    onSuccess: () => {
      refetchMembership();
    },
  });

  const isMember = membership?.some((s) => s.id === subreddit?.id) ?? false;
  const userRole = membership?.find((s) => s.id === subreddit?.id)?.role;

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900">Community not found</h2>
          <p className="text-slate-600 mt-2">r/{name} does not exist.</p>
          <Link
            to="/subreddits"
            className="text-brand-600 hover:text-brand-700 mt-4 inline-block"
          >
            Browse communities
          </Link>
        </div>
      </div>
    );
  }

  if (!subreddit) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Community header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">r/{subreddit.name}</h1>
            <p className="text-lg text-slate-700 mt-1">{subreddit.title}</p>
            {subreddit.description && (
              <p className="text-slate-600 mt-2">{subreddit.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <span>
                {subreddit.memberCount} {subreddit.memberCount === 1 ? 'member' : 'members'}
              </span>
              {userRole && (
                <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-xs font-medium capitalize">
                  {userRole}
                </span>
              )}
            </div>
          </div>
          <div>
            {isMember ? (
              <button
                onClick={() => leaveMutation.mutate({ subredditId: subreddit.id })}
                disabled={leaveMutation.isPending}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Leave
              </button>
            ) : (
              <button
                onClick={() => joinMutation.mutate({ subredditId: subreddit.id })}
                disabled={joinMutation.isPending}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                Join
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts area - placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="mt-2">Be the first to share something in r/{subreddit.name}!</p>
        </div>
      </div>
    </div>
  );
}
