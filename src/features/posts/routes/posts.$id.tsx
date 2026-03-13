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

  const { data: post, isLoading, error } = trpc.posts.getById.useQuery(
    { id: id! },
    { enabled: !!id },
  );

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

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Comments</h2>
        <p className="text-slate-500 text-center py-8">Comments coming soon</p>
      </div>
    </div>
  );
}
