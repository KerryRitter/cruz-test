import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { trpc } from '@/trpc/client';

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ModerationDashboardPage() {
  const { name } = useParams<{ name: string }>();
  const [activeTab, setActiveTab] = useState<'members' | 'bans'>('members');
  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');

  const { data: subreddit, isLoading: subredditLoading } = trpc.subreddits.getByName.useQuery(
    { name: name! },
    { enabled: !!name },
  );

  const { data: subscriptions } = trpc.subreddits.mySubscriptions.useQuery(
    undefined,
    { retry: false },
  );

  const userRole = subscriptions?.find((s) => s.id === subreddit?.id)?.role;
  const isModerator = userRole === 'moderator';

  const { data: members, refetch: refetchMembers } = trpc.moderation.listMembers.useQuery(
    { subredditId: subreddit?.id ?? '' },
    { enabled: !!subreddit?.id && isModerator },
  );

  const { data: bans, refetch: refetchBans } = trpc.moderation.listBans.useQuery(
    { subredditId: subreddit?.id ?? '' },
    { enabled: !!subreddit?.id && isModerator },
  );

  const banMutation = trpc.moderation.banUser.useMutation({
    onSuccess: () => {
      setBanUserId('');
      setBanReason('');
      refetchBans();
      refetchMembers();
    },
  });

  const unbanMutation = trpc.moderation.unbanUser.useMutation({
    onSuccess: () => {
      refetchBans();
    },
  });

  const promoteMutation = trpc.moderation.promoteModerator.useMutation({
    onSuccess: () => {
      refetchMembers();
    },
  });

  if (subredditLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!subreddit) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-slate-600">Subreddit not found.</p>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600 mt-2">You must be a moderator of r/{name} to access this page.</p>
          <Link
            to={`/r/${name}`}
            className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
          >
            Back to r/{name}
          </Link>
        </div>
      </div>
    );
  }

  const handleBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banUserId.trim()) {
      return;
    }
    banMutation.mutate({
      subredditId: subreddit.id,
      userId: banUserId.trim(),
      reason: banReason.trim() || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mod Tools</h1>
            <p className="text-slate-600 mt-1">r/{name}</p>
          </div>
          <Link
            to={`/r/${name}`}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Back to Community
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'members'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Members ({members?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('bans')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'bans'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Bans ({bans?.length ?? 0})
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Members</h2>
          </div>
          {!members || members.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No members found.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-900 font-mono">
                      {member.userId.slice(0, 12)}...
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        member.role === 'moderator'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'member' && (
                      <button
                        onClick={() => promoteMutation.mutate({ subredditId: subreddit.id, userId: member.userId })}
                        disabled={promoteMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
                      >
                        Promote to Mod
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bans Tab */}
      {activeTab === 'bans' && (
        <div className="space-y-6">
          {/* Ban User Form */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ban a User</h2>
            <form onSubmit={handleBan} className="space-y-4">
              <div>
                <label htmlFor="banUserId" className="block text-sm font-medium text-slate-700 mb-1">
                  User ID
                </label>
                <input
                  id="banUserId"
                  type="text"
                  value={banUserId}
                  onChange={(e) => setBanUserId(e.target.value)}
                  placeholder="Enter user ID"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="banReason" className="block text-sm font-medium text-slate-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  id="banReason"
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for ban"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {banMutation.error && (
                <p className="text-sm text-red-600">{banMutation.error.message}</p>
              )}
              <button
                type="submit"
                disabled={banMutation.isPending || !banUserId.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {banMutation.isPending ? 'Banning...' : 'Ban User'}
              </button>
            </form>
          </div>

          {/* Bans List */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Banned Users</h2>
            </div>
            {!bans || bans.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No banned users.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {bans.map((ban) => (
                  <div key={ban.id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-900 font-mono">
                        {ban.userId.slice(0, 12)}...
                      </span>
                      {ban.reason && (
                        <p className="text-xs text-slate-500 mt-1">Reason: {ban.reason}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">
                        Banned {formatDate(ban.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => unbanMutation.mutate({ subredditId: subreddit.id, userId: ban.userId })}
                      disabled={unbanMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                    >
                      Unban
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
