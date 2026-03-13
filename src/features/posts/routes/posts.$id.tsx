import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { trpc } from '@/trpc/client';

type SerializedComment = {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  body: string;
  score: number;
  depth: number;
  createdAt: string;
  updatedAt: string;
};

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

type CommentItemProps = {
  comment: SerializedComment;
  allComments: SerializedComment[];
  depth: number;
  userVotes: Record<string, number>;
  onVote: (commentId: string, value: 1 | -1) => void;
  onReply: (commentId: string, body: string) => void;
  isVoting: boolean;
  isReplying: boolean;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  allComments,
  depth,
  userVotes,
  onVote,
  onReply,
  isVoting,
  isReplying,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState('');

  const currentVote = userVotes[comment.id] ?? null;
  const authorDisplay = comment.authorId.slice(0, 8) + '...';
  const createdAt = new Date(comment.createdAt);

  const handleSubmitReply = () => {
    if (!replyBody.trim()) {
      return;
    }
    onReply(comment.id, replyBody.trim());
    setReplyBody('');
    setShowReply(false);
  };

  return (
    <div>
      <div className="py-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span className="font-medium">u/{authorDisplay}</span>
          <span>&middot;</span>
          <span>{timeAgo(createdAt)}</span>
        </div>

        <p className="text-sm text-slate-700 whitespace-pre-wrap mb-2">{comment.body}</p>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onVote(comment.id, 1)}
              disabled={isVoting}
              className={`p-0.5 rounded transition-colors ${
                currentVote === 1
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-orange-500'
              }`}
              aria-label="Upvote comment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3z" clipRule="evenodd" />
              </svg>
            </button>
            <span className={`font-bold ${
              currentVote === 1
                ? 'text-orange-500'
                : currentVote === -1
                  ? 'text-blue-500'
                  : 'text-slate-600'
            }`}>
              {comment.score}
            </span>
            <button
              onClick={() => onVote(comment.id, -1)}
              disabled={isVoting}
              className={`p-0.5 rounded transition-colors ${
                currentVote === -1
                  ? 'text-blue-500'
                  : 'text-slate-400 hover:text-blue-500'
              }`}
              aria-label="Downvote comment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.55-.24l-3.25-3.5a.75.75 0 111.1-1.02L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5A.75.75 0 0110 17z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setShowReply(!showReply)}
            className="text-slate-500 hover:text-slate-700 font-medium"
          >
            Reply
          </button>
        </div>

        {showReply && (
          <div className="mt-3">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              className="w-full border border-slate-300 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmitReply}
                disabled={!replyBody.trim() || isReplying}
                className="px-3 py-1 bg-brand-600 text-white text-sm rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReplying ? 'Replying...' : 'Reply'}
              </button>
              <button
                onClick={() => { setShowReply(false); setReplyBody(''); }}
                className="px-3 py-1 text-slate-500 text-sm hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <CommentTree
        comments={allComments}
        parentId={comment.id}
        depth={depth + 1}
        userVotes={userVotes}
        onVote={onVote}
        onReply={onReply}
        isVoting={isVoting}
        isReplying={isReplying}
      />
    </div>
  );
};

type CommentTreeProps = {
  comments: SerializedComment[];
  parentId: string | null;
  depth: number;
  userVotes: Record<string, number>;
  onVote: (commentId: string, value: 1 | -1) => void;
  onReply: (parentCommentId: string, body: string) => void;
  isVoting: boolean;
  isReplying: boolean;
};

const CommentTree: React.FC<CommentTreeProps> = ({
  comments,
  parentId,
  depth,
  userVotes,
  onVote,
  onReply,
  isVoting,
  isReplying,
}) => {
  const children = comments.filter((c) => c.parentCommentId === parentId);
  if (children.length === 0) {
    return null;
  }

  const indent = depth > 0 && depth <= 5;

  return (
    <div className={indent ? 'ml-4 border-l-2 border-slate-200 pl-4' : ''}>
      {children.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          allComments={comments}
          depth={depth}
          userVotes={userVotes}
          onVote={onVote}
          onReply={onReply}
          isVoting={isVoting}
          isReplying={isReplying}
        />
      ))}
    </div>
  );
};

export default function PostDetailPage() {
  const { name, id } = useParams<{ name: string; id: string }>();
  const [commentBody, setCommentBody] = useState('');

  const { data: post, isLoading, error, refetch: refetchPost } = trpc.posts.getById.useQuery(
    { id: id! },
    { enabled: !!id },
  );

  const { data: userVotes } = trpc.votes.getUserVotesForPosts.useQuery(
    { postIds: id ? [id] : [] },
    { enabled: !!id, retry: false },
  );

  const { data: commentsData, refetch: refetchComments } = trpc.comments.listByPost.useQuery(
    { postId: id! },
    { enabled: !!id },
  );

  const commentIds = commentsData?.map((c) => c.id) ?? [];

  const { data: commentVotesData } = trpc.comments.getUserVotesForComments.useQuery(
    { commentIds },
    { enabled: commentIds.length > 0, retry: false },
  );

  const castVote = trpc.votes.castVote.useMutation({
    onSuccess: () => {
      refetchPost();
    },
  });

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      refetchComments();
      refetchPost();
      setCommentBody('');
    },
  });

  const voteComment = trpc.comments.voteComment.useMutation({
    onSuccess: () => {
      refetchComments();
    },
  });

  const currentVote = id && userVotes ? (userVotes[id] ?? null) : null;

  const handleVote = (value: 1 | -1) => {
    if (!id || castVote.isPending) {
      return;
    }
    castVote.mutate({ postId: id, value });
  };

  const handleCreateComment = () => {
    if (!id || !commentBody.trim() || createComment.isPending) {
      return;
    }
    createComment.mutate({ postId: id, body: commentBody.trim() });
  };

  const handleCommentVote = (commentId: string, value: 1 | -1) => {
    if (voteComment.isPending) {
      return;
    }
    voteComment.mutate({ commentId, value });
  };

  const handleReply = (parentCommentId: string, body: string) => {
    if (!id || createComment.isPending) {
      return;
    }
    createComment.mutate({ postId: id, body, parentCommentId });
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

      {/* Comments section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Comments</h2>

        {/* New comment form */}
        <div className="mb-6">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border border-slate-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleCreateComment}
              disabled={!commentBody.trim() || createComment.isPending}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createComment.isPending ? 'Posting...' : 'Comment'}
            </button>
          </div>
          {createComment.error && (
            <p className="text-red-600 text-sm mt-1">{createComment.error.message}</p>
          )}
        </div>

        {/* Comment tree */}
        {commentsData && commentsData.length > 0 ? (
          <CommentTree
            comments={commentsData}
            parentId={null}
            depth={0}
            userVotes={commentVotesData ?? {}}
            onVote={handleCommentVote}
            onReply={handleReply}
            isVoting={voteComment.isPending}
            isReplying={createComment.isPending}
          />
        ) : (
          <p className="text-slate-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}
