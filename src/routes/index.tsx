import { useState } from 'react';
import { Link } from 'react-router';
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

export default function HomePage() {
  const [sort, setSort] = useState<'new' | 'top'>('new');

  const { data: feedPosts, isLoading } = trpc.posts.feed.useQuery({ sort });

  const { data: subscriptions } = trpc.subreddits.mySubscriptions.useQuery(
    undefined,
    { retry: false },
  );

  const isLoggedIn = subscriptions !== undefined;
  const hasSubscriptions = (subscriptions?.length ?? 0) > 0;
  const showPersonalizedNotice = isLoggedIn && !hasSubscriptions;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Home</h1>
          </div>

          {/* Sort tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSort('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === 'new'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setSort('top')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === 'top'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Top
            </button>
          </div>

          {/* Personalized feed notice */}
          {showPersonalizedNotice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                Join some communities to personalize your feed!{' '}
                <Link to="/subreddits" className="font-medium underline hover:text-blue-900">
                  Browse communities
                </Link>
              </p>
            </div>
          )}

          {/* Not logged in banner */}
          {!isLoggedIn && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
              <p className="text-slate-700 text-sm">
                <Link to="/auth/login" className="font-medium text-brand-600 hover:text-brand-700">
                  Sign in
                </Link>{' '}
                to personalize your feed and join communities.
              </p>
            </div>
          )}

          {/* Posts list */}
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading posts...</div>
          ) : !feedPosts || feedPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg font-medium">No posts yet</p>
                <p className="mt-2">
                  Be the first to share something!{' '}
                  <Link to="/subreddits" className="text-brand-600 hover:text-brand-700">
                    Browse communities
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {feedPosts.map((post) => {
                const authorDisplay = post.authorId.slice(0, 8) + '...';
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
                            className="font-medium text-slate-700 hover:text-brand-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            r/{post.subredditName}
                          </Link>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 leading-snug">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                          <span>u/{authorDisplay}</span>
                          <span>&middot;</span>
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

        {/* Sidebar */}
        <div className="hidden md:block w-72 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3 sticky top-20">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Quick Links
            </h2>
            <Link
              to="/subreddits/create"
              className="block w-full px-4 py-2 bg-brand-600 text-white text-center rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
            >
              Create Community
            </Link>
            <Link
              to="/subreddits"
              className="block w-full px-4 py-2 border border-slate-300 text-slate-700 text-center rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              Browse Communities
            </Link>

            {isLoggedIn && hasSubscriptions && (
              <div className="pt-3 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  My Communities
                </h3>
                <div className="space-y-1">
                  {subscriptions?.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/r/${sub.name}`}
                      className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors"
                    >
                      r/{sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
