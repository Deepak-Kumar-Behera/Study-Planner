import React, { useEffect, useState } from 'react';
import { fetchUserDetails } from '../services/adminApi';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatCard({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    green:  'bg-green-50  text-green-700  border-green-100',
    amber:  'bg-amber-50  text-amber-700  border-amber-100',
    rose:   'bg-rose-50   text-rose-700   border-rose-100',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

function ScoreBadge({ pct }) {
  if (pct >= 75) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{pct}%</span>;
  if (pct >= 50) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">{pct}%</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">{pct}%</span>;
}

function TopicBar({ topic, pct }) {
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 text-sm text-gray-700 truncate shrink-0" title={topic}>{topic}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <ScoreBadge pct={pct} />
    </div>
  );
}

export default function UserDetail({ userId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizExpanded, setQuizExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUserDetails(userId)
      .then(({ data }) => setData(data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load user details.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
      <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading user details…
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={onBack} className="mb-4 flex items-center gap-1 text-indigo-600 hover:underline text-sm">
        ← Back to Users
      </button>
      <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
    </div>
  );

  const { user, stats, inputs, quizAttempts, topicPerformance } = data;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Users
      </button>

      {/* User card */}
      <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold uppercase shrink-0">
          {user.username.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">Joined {formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Subjects"       value={stats.totalInputs}       color="indigo" />
        <StatCard label="Quiz Attempts"  value={stats.totalQuizAttempts} color="amber"
          sub={stats.totalQuizAttempts ? `Avg ${stats.avgScore}%` : undefined} />
        <StatCard label="Revisions Done" value={stats.completedRevisions}
          sub={`of ${stats.totalRevisions} total`} color="green" />
        <StatCard label="Avg Score"      value={stats.totalQuizAttempts ? `${stats.avgScore}%` : '—'}
          color={stats.avgScore >= 75 ? 'green' : stats.avgScore >= 50 ? 'amber' : 'rose'} />
      </div>

      {/* Subjects table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Subjects / Inputs</h3>
        </div>
        {inputs.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">No subjects generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Subject</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Notes</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Plan Steps</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Revisions</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Quiz Attempts</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inputs.map(inp => (
                  <tr key={inp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-800 max-w-xs truncate">{inp.value}</td>
                    <td className="px-6 py-3 text-gray-600">{inp.noteCount}</td>
                    <td className="px-6 py-3 text-gray-600">{inp.planCount}</td>
                    <td className="px-6 py-3 text-gray-600">
                      <span className="text-green-700 font-medium">{inp.revisionCompleted}</span>
                      <span className="text-gray-400"> / {inp.revisionTotal}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{inp.quizAttempts}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(inp.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quiz attempts */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Quiz Attempts</h3>
        </div>
        {quizAttempts.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">No quiz attempts yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {quizAttempts.map((attempt, i) => (
              <div key={attempt._id}>
                <button
                  onClick={() => setQuizExpanded(quizExpanded === i ? null : i)}
                  className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-gray-400 text-sm w-6 shrink-0">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-gray-700 truncate">{attempt.inputValue}</span>
                  <span className="text-sm text-gray-500 shrink-0">{formatDateTime(attempt.submittedAt)}</span>
                  <span className="shrink-0">
                    <ScoreBadge pct={attempt.pct} />
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{attempt.score}/{attempt.total}</span>
                  <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${quizExpanded === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {quizExpanded === i && attempt.gapAnalysis?.length > 0 && (
                  <div className="px-16 pb-4 pt-1 bg-gray-50 space-y-2">
                    {attempt.gapAnalysis.map((g, gi) => (
                      <div key={gi} className="flex items-center gap-3 text-sm">
                        <span className="w-36 text-gray-600 truncate" title={g.topic}>{g.topic}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              g.status === 'strong' ? 'bg-green-500' :
                              g.status === 'ok'     ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${g.total ? Math.round((g.score / g.total) * 100) : 0}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-12 text-right ${
                          g.status === 'strong' ? 'text-green-700' :
                          g.status === 'ok'     ? 'text-amber-700' : 'text-rose-700'
                        }`}>{g.score}/{g.total}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          g.status === 'strong' ? 'bg-green-100 text-green-700' :
                          g.status === 'ok'     ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>{g.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic performance across all attempts */}
      {topicPerformance.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Overall Topic Performance</h3>
          <div className="space-y-3">
            {topicPerformance.map(t => (
              <TopicBar key={t.topic} topic={t.topic} pct={t.pct} />
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Weak (&lt;50%)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Moderate (50–74%)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Strong (≥75%)</span>
          </div>
        </div>
      )}
    </div>
  );
}
