import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { trpc } from '@/trpc/client';

export default function CreatePostPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: subreddit, isLoading: subredditLoading } = trpc.subreddits.getByName.useQuery(
    { name: name! },
    { enabled: !!name },
  );

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: (post) => {
      navigate(`/r/${name}/comments/${post.id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!subreddit) {
      return;
    }
    createMutation.mutate({
      subredditId: subreddit.id,
      title,
      body: body || undefined,
    });
  };

  if (subredditLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!subreddit) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <p className="text-slate-600">Subreddit not found.</p>
        <Link to="/subreddits" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Browse communities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Create a post in r/{subreddit.name}
      </h1>
      <p className="text-slate-600 mb-6">{subreddit.title}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="An interesting title"
            maxLength={300}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <p className="text-slate-500 text-xs mt-1">{title.length}/300</p>
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-1">
            Body (optional)
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts..."
            maxLength={40000}
            rows={8}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
          <p className="text-slate-500 text-xs mt-1">{body.length}/40000</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? 'Posting...' : 'Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/r/${name}`)}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
