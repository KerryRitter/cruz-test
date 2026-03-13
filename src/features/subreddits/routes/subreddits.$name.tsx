import { useState } from 'react';
import { useParams, Link, useLoaderData } from 'react-router';
import { trpc } from '@/trpc/client';
import { withLoaderMiddleware } from '@cruzjs/core/routing/middleware';
import { SubredditsService } from '@/features/subreddits/subreddits.service';
import { PostsService } from '@/features/posts/posts.service';
import type { LoaderFunctionArgs } from 'react-router';

export const loader = async (args: LoaderFunctionArgs) => {
  await import('@/setup.server');
  return withLoaderMiddleware([args], async ({ params, container }) => {
    const subredditsService = container.resolve(SubredditsService);
    const postsService = container.resolve(PostsService);

    const subreddit = await subredditsService.getByName(params.name!);
    if (!subreddit) {
      throw new Response('Not Found', { status: 404 });
    }

    const posts = await postsService.listBySubreddit(subreddit.id, 'new');
    return { subreddit, posts };
  });
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SubredditPage() {
  const { subreddit: initialSubreddit, posts: initialPosts } = useLoaderData<typeof loader>();
  const { name } = useParams<{ name: string }>();
  const [sort, setSort] = useState<'new' | 'top'>('new');
  const [showJoinMessage, setShowJoinMessage] = useState(false);

  const { data: querySubreddit } = trpc.subreddits.getByName.useQuery(
    { name: name! },
    { enabled: !!name },
  );
  const subreddit = querySubreddit ?? initialSubreddit;

  const { data: membership, refetch: refetchMembership } = trpc.subreddits.mySubscriptions.useQuery(
    undefined,
    { retry: false },
  );

  const { data: queryPosts, refetch: refetchPosts } = trpc.posts.listBySubreddit.useQuery(
    { subredditId: subreddit?.id ?? '', sort },
    { enabled: !!subreddit?.id },
  );
  const postsList = queryPosts ?? (sort === 'new' ? initialPosts : undefined);

  const joinMutation = trpc.subreddits.join.useMutation({ onSuccess: () => refetchMembership() });
  const leaveMutation = trpc.subreddits.leave.useMutation({ onSuccess: () => refetchMembership() });
  const removePostMutation = trpc.moderation.removePost.useMutation({ onSuccess: () => refetchPosts() });

  const isMember = membership?.some((s) => s.id === subreddit?.id) ?? false;
  const userRole = membership?.find((s) => s.id === subreddit?.id)?.role;
  const isModerator = userRole === 'moderator';
  const isLoggedIn = !!membership;

  const handleNewPostClick = () => {
    if (isLoggedIn && !isMember) {
      setShowJoinMessage(true);
      setTimeout(() => setShowJoinMessage(false), 3000);
    }
  };

  if (!subreddit) return null;

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
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium capitalize">
                  {userRole}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isModerator && (
              <Link
                to={`/r/${name}/mod`}
                className="px-4 py-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
              >
                Mod Tools
              </Link>
            )}
            {isLoggedIn && isMember ? (
              <Link
                to={`/r/${name}/submit`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                New Post
              </Link>
            ) : isLoggedIn && !isMember ? (
              <button
                onClick={handleNewPostClick}
                className="px-4 py-2 bg-indigo-400 text-white rounded-lg cursor-not-allowed font-medium"
                title="Join this community to post"
              >
                New Post
              </button>
            ) : (
              <Link
                to="/auth/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                New Post
              </Link>
            )}
            {isMember ? (
              <button
                onClick={() => leaveMutation.mutate({ subredditId: subreddit.id })}
                disabled={leaveMutation.isPending}
                className="px-4 py-2 border-2 border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors font-medium"
              >
                Leave
              </button>
            ) : (
              <button
                onClick={() => joinMutation.mutate({ subredditId: subreddit.id })}
                disabled={joinMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Join
              </button>
            )}
          </div>
        </div>

        {showJoinMessage && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm">
              Join this community first to create a post.{' '}
              <button
                onClick={() => joinMutation.mutate({ subredditId: subreddit.id })}
                className="font-medium underline hover:text-amber-900"
              >
                Join now
              </button>
            </p>
          </div>
        )}

        {!isLoggedIn && (
          <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-indigo-800 text-sm">
              <Link to="/auth/login" className="font-medium text-indigo-700 hover:text-indigo-800 underline">
                Sign in
              </Link>{' '}
              to join this community, create posts, and vote.{' '}
              <Link to="/auth/register" className="font-medium text-indigo-700 hover:text-indigo-800 underline">
                Create an account
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Sort tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setSort('new')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sort === 'new'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          New
        </button>
        <button
          onClick={() => setSort('top')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sort === 'top'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Top
        </button>
      </div>

      {/* Posts list */}
      {!postsList || postsList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="mt-2">Be the first to share something in r/{subreddit.name}!</p>
            {isLoggedIn && isMember && (
              <Link
                to={`/r/${name}/submit`}
                className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Create the first post
              </Link>
            )}
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
                className="block bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center text-sm text-slate-500 min-w-[40px]">
                    <span className="font-semibold text-slate-900">{post.score}</span>
                    <span className="text-xs">points</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-slate-900 leading-snug">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <Link
                        to={`/u/${post.authorId}`}
                        className="hover:text-indigo-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        u/{authorDisplay}
                      </Link>
                      <span>&middot;</span>
                      <span>{timeAgo(createdAt)}</span>
                      <span>&middot;</span>
                      <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
                      {isModerator && (
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
