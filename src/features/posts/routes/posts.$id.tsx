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

export default function PostDetailPage() {
  const { name, id } = useParams<{ name: string; id: string }>();

  const { data: post, isLoading, error, refetch: refetchPost } = trpc.posts.getById.useQuery(
    { id: id! },
    { enabled: !!id },
  );

  const { data: userVotes } = trpc.votes.getUserVotesForPosts.useQuery(
    { postIds: id ? [id] : [] },
    { enabled: !!id, retry: false },
  );

  const castVote = trpc.votes.castVote.useMutation({
    onSuccess: () => {
      refetchPost();
    },
  });

  const currentVote = id && userVotes ? (userVotes[id] ?? null) : null;

  const handleVote = (value: 1 | -1) => {
    if (!id || castVote.isPending) {
      return;
    }
    castVote.mutate({ postId: id, value });
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Post not found</h2>
        <Link
          to={`/r/${name}`}
          className="text-brand-600 hover:text-brand-700 mt-4 inline-block"
        >
          Back to r/{name}
        </Link>
      </div>
    );
  }

  const authorDisplay = post.authorId.slice(0, 8) + '...';
  const createdAt = new Date(post.createdAt);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link
        to={`/r/${name}`}
        className="text-brand-600 hover:text-brand-700 text-sm mb-4 inline-block"
      >
        &larr; Back to r/{name}
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex gap-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              disabled={castVote.isPending}
              className={`p-1 rounded transition-colors ${
                currentVote === 1
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
              }`}
              aria-label="Upvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3z" clipRule="evenodd" />
              </svg>
            </button>
            <span className={`text-sm font-bold ${
              currentVote === 1
                ? 'text-orange-500'
                : currentVote === -1
                  ? 'text-blue-500'
                  : 'text-slate-700'
            }`}>
              {post.score}
            </span>
            <button
              onClick={() => handleVote(-1)}
              disabled={castVote.isPending}
              className={`p-1 rounded transition-colors ${
                currentVote === -1
                  ? 'text-blue-500 bg-blue-50'
                  : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'
              }`}
              aria-label="Downvote"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.55-.24l-3.25-3.5a.75.75 0 111.1-1.02L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5A.75.75 0 0110 17z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Post content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <span>Posted by u/{authorDisplay}</span>
              <span>&middot;</span>
              <span>{timeAgo(createdAt)}</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-4">{post.title}</h1>

            {post.body && (
              <div className="text-slate-700 whitespace-pre-wrap mb-4">{post.body}</div>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-100">
              <span className="font-medium">{post.score} points</span>
              <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Comments</h2>
        <p className="text-slate-500 text-center py-8">Comments coming soon</p>
      </div>
    </div>
  );
}
