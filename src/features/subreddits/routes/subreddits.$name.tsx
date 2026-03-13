import { useState } from 'react';
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

export default function SubredditPage() {
  const { name } = useParams<{ name: string }>();
  const [sort, setSort] = useState<'new' | 'top'>('new');

  const { data: subreddit, isLoading, error } = trpc.subreddits.getByName.useQuery(
    { name: name! },
    { enabled: !!name },
  );

  const { data: membership, refetch: refetchMembership } = trpc.subreddits.mySubscriptions.useQuery(
    undefined,
    { retry: false },
  );

  const { data: postsList, isLoading: postsLoading, refetch: refetchPosts } = trpc.posts.listBySubreddit.useQuery(
    { subredditId: subreddit?.id ?? '', sort },
    { enabled: !!subreddit?.id },
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

  const removePostMutation = trpc.moderation.removePost.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  const isMember = membership?.some((s) => s.id === subreddit?.id) ?? false;
  const userRole = membership?.find((s) => s.id === subreddit?.id)?.role;
  const isModerator = userRole === 'moderator';
  const isLoggedIn = !!membership;

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
          <div className="flex items-center gap-2">
            {isModerator && (
              <Link
                to={`/r/${name}/mod`}
                className="px-4 py-2 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
              >
                Mod Tools
              </Link>
            )}
            {isLoggedIn && isMember && (
              <Link
                to={`/r/${name}/submit`}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                New Post
              </Link>
            )}
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

      {/* Posts list */}
      {postsLoading ? (
        <div className="p-8 text-center text-slate-500">Loading posts...</div>
      ) : !postsList || postsList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="mt-2">Be the first to share something in r/{subreddit.name}!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {postsList.map((post) => {
            const authorDisplay = post.authorId.slice(0, 8) + '...';
            const createdAt = new Date(post.createdAt);

            return (
              <Link
                key={post.id}
                to={`/r/${name}/comments/${post.id}`}
                className="block bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center text-sm text-slate-500 min-w-[40px]">
                    <span className="font-semibold text-slate-900">{post.score}</span>
                    <span className="text-xs">points</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-slate-900 leading-snug">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <Link
                        to={`/u/${post.authorId}`}
                        className="hover:text-brand-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        u/{authorDisplay}
                      </Link>
                      <span>&middot;</span>
                      <span>{timeAgo(createdAt)}</span>
                      <span>&middot;</span>
                      <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
                      {isModerator && subreddit && (
                        <>
                          <span>&middot;</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removePostMutation.mutate({ subredditId: subreddit.id, postId: post.id });
                            }}
                            disabled={removePostMutation.isPending}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </>
                      )}
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
