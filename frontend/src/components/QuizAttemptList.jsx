import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Pagination } from './StudyPagesUtils';

export default function QuizAttemptList() {
  const [attempts, setAttempts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

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
              <th className="px-4 py-3 text-center">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
                  <td className="px-4 py-3 text-center text-gray-400 text-xs text-nowrap">
                    {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => setSelectedAttempt(attempt)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-100 transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Side Slide-over Panel */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity" onClick={() => setSelectedAttempt(null)}></div>
          
          <div className="absolute inset-y-0 right-0 max-w-xl w-full flex">
            <div className="relative w-full bg-white shadow-xl flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Quiz Attempt Details</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedAttempt.submittedAt ? new Date(selectedAttempt.submittedAt).toLocaleString() : ''}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedAttempt(null)}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition text-gray-500 text-xl"
                >&times;</button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 bg-white">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Score</div>
                    <div className="text-xl font-bold text-gray-800">{selectedAttempt.score}/{selectedAttempt.total}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Pass Rate</div>
                    <div className="text-xl font-bold text-gray-800">
                      {Math.round((selectedAttempt.score / selectedAttempt.total) * 100)}%
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center shadow-sm">
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Mistakes</div>
                    <div className="text-xl font-bold text-gray-800">{selectedAttempt.total - selectedAttempt.score}</div>
                  </div>
                </div>

                {selectedAttempt.gapAnalysis && selectedAttempt.gapAnalysis.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">Performance by Topic</h4>
                    <div className="space-y-2">
                      {selectedAttempt.gapAnalysis.map((gap, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${
                          gap.status === 'weak' ? 'bg-red-50 border-red-100' : 
                          gap.status === 'strong' ? 'bg-green-50 border-green-100' : 
                          'bg-yellow-50 border-yellow-100'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div>
                               <span className="text-sm font-semibold text-gray-800">{gap.topic}</span>
                               <div className="text-[10px] text-gray-500 mt-0.5">Score: {gap.score}/{gap.total}</div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              gap.status === 'weak' ? 'bg-red-200 text-red-800' : 
                              gap.status === 'strong' ? 'bg-green-200 text-green-800' : 
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                               {gap.status === 'weak' ? 'Needs Review' : gap.status === 'strong' ? 'Mastered' : 'Progressing'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-1">Question Analysis</h4>
                  <div className="space-y-4">
                    {selectedAttempt.answers.map((ans, idx) => (
                      <div key={idx} className="bg-white border rounded p-4">
                        <div className="flex items-start gap-4">
                          <span className="text-sm font-bold text-gray-400 mt-0.5">
                            {idx + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-4">{ans.question}</p>
                            
                            <div className="space-y-2">
                              {ans.options && ans.options.map((opt, i) => {
                                const isSelected = ans.selected === opt;
                                const isCorrect = ans.correctAnswer === opt;
                                
                                let borderClass = "border-gray-200";
                                let bgClass = "bg-white";
                                let textClass = "text-gray-700";

                                if (isSelected) {
                                  borderClass = ans.correct ? "border-green-500" : "border-red-400";
                                  bgClass = ans.correct ? "bg-green-50" : "bg-red-50";
                                  textClass = ans.correct ? "text-green-800 font-semibold" : "text-red-800 font-semibold";
                                } else if (isCorrect && !ans.correct) {
                                  borderClass = "border-green-500";
                                  bgClass = "bg-green-50";
                                  textClass = "text-green-800 font-semibold";
                                }

                                return (
                                  <div key={i} className={`p-2.5 rounded border text-[13px] flex items-center justify-between ${borderClass} ${bgClass} ${textClass}`}>
                                    <span>{opt}</span>
                                    <div className="flex gap-2">
                                      {isSelected && (
                                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${ans.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                          {ans.correct ? 'Correct' : 'Incorrect'}
                                        </span>
                                      )}
                                      {isCorrect && !ans.correct && (
                                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-200 text-green-800">
                                          Answer
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                <button 
                  onClick={() => setSelectedAttempt(null)}
                  className="w-full py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition shadow-sm"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (

      
        <div className="mt-4 flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
