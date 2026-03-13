import { useParams, Link } from 'react-router';
import { trpc } from '@/trpc/client';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) {
    return 'just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: karma, isLoading: karmaLoading } = trpc.karma.getUserKarma.useQuery(
    { userId: userId! },
    { enabled: !!userId },
  );

  const { data: userPosts, isLoading: postsLoading } = trpc.posts.listByAuthor.useQuery(
    { authorId: userId! },
    { enabled: !!userId },
  );

  const userDisplay = userId ? userId.slice(0, 8) + '...' : '';

  if (karmaLoading) {
    return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">u/{userDisplay}</h1>

        {/* Karma stat cards */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">
              {karma?.postKarma ?? 0}
            </div>
            <div className="text-sm text-slate-500 mt-1">Post Karma</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">
              {karma?.commentKarma ?? 0}
            </div>
            <div className="text-sm text-slate-500 mt-1">Comment Karma</div>
          </div>
          <div className="bg-brand-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-700">
              {karma?.totalKarma ?? 0}
            </div>
            <div className="text-sm text-indigo-600 mt-1">Total Karma</div>
          </div>
        </div>
      </div>

      {/* Recent posts */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Posts</h2>

      {postsLoading ? (
        <div className="p-8 text-center text-slate-500">Loading posts...</div>
      ) : !userPosts || userPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="mt-2">This user hasn't posted anything.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {userPosts.map((post) => {
            const createdAt = new Date(post.createdAt);

            return (
              <Link
                key={post.id}
                to={`/r/${post.subredditName}/comments/${post.id}`}
                className="block bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center text-sm text-slate-500 min-w-[40px]">
                    <span className="font-semibold text-slate-900">{post.score}</span>
                    <span className="text-xs">points</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 mb-1">
                      <Link
                        to={`/r/${post.subredditName}`}
                        className="font-medium text-slate-700 hover:text-indigo-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        r/{post.subredditName}
                      </Link>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 leading-snug">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <span>{timeAgo(createdAt)}</span>
                      <span>&middot;</span>
                      <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
