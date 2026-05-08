import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Pagination } from './StudyPagesUtils';

export default function QuizAttemptList() {
  const [attempts, setAttempts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/quiz-scores?page=${page}&limit=5`)
      .then(res => {
        setAttempts(res.data.data);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="text-gray-400 py-4">Loading...</div>;
  if (attempts.length === 0) return <div className="text-gray-400 py-4">No quiz attempts yet.</div>;

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Topic</th>
              <th className="px-4 py-3 text-center">Score</th>
              <th className="px-4 py-3 text-center">Percentage</th>
              <th className="px-4 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attempts.map((attempt, idx) => {
              const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
              const pctColor = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500';
              return (
                <tr key={attempt.id || idx} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400">{(page - 1) * 5 + idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{attempt.topic || 'Untitled'}</td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-600">{attempt.score} / {attempt.total}</td>
                  <td className={`px-4 py-3 text-center font-bold ${pctColor}`}>{pct}%</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">
                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
