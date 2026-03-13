import { useState } from 'react';
import { useNavigate } from 'react-router';
import { trpc } from '@/trpc/client';

export default function CreateSubredditPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.subreddits.create.useMutation({
    onSuccess: (subreddit) => {
      navigate(`/r/${subreddit.name}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      name,
      title,
      description: description || undefined,
    });
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create a Community</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Community Name
          </label>
          <div className="flex items-center">
            <span className="text-slate-500 mr-1">r/</span>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="technology"
              pattern="^[a-z0-9_]+$"
              minLength={3}
              maxLength={21}
              required
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <p className="text-slate-500 text-xs mt-1">
            3-21 characters. Lowercase letters, numbers, and underscores only.
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Display Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Technology"
            maxLength={100}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this community about?"
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
          <p className="text-slate-500 text-xs mt-1">{description.length}/500</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Community'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/subreddits')}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
