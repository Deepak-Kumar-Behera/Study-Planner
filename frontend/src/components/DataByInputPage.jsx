import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from './Card';
// Requires: npm install react-markdown remark-gfm
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from './Mermaid';

export default function DataByInputPage({ type, input, onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let endpoint = '';
    if (type === 'plan') endpoint = `/plans/input/${input._id}`;
    else if (type === 'notes') endpoint = `/notes/input/${input._id}`;
    else if (type === 'quiz') endpoint = `/quizzes/input/${input._id}`;
    else if (type === 'revision') endpoint = `/revisions/input/${input._id}`;
    api.get(endpoint)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [type, input]);

  // Local state for revision status
  const [statusMap, setStatusMap] = useState({});

  // Sync local statusMap with data
  useEffect(() => {
    if (type === 'revision') {
      const map = {};
      data.forEach(rev => { map[rev._id] = rev.status; });
      setStatusMap(map);
    }
  }, [data, type]);

  // Handler to change status
  const handleStatusChange = async (id, newStatus) => {
    setStatusMap(prev => ({ ...prev, [id]: newStatus }));
    try {
      await api.patch(`/revisions/${id}/status`, { status: newStatus });
    } catch (e) {
      // Optionally show error
    }
  };

  return (
    <div className="pb-20 pl-4">
      <div className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md py-4 mb-6 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            onClick={onBack}
            title="Go Back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {type === 'revision' ? 'Progress Tracker' : type === 'plan' ? 'Study Schedule' : type === 'notes' ? 'Subject Notes' : type.charAt(0).toUpperCase() + type.slice(1)} 
            <span className="text-gray-400 mx-2 text-lg font-normal">/</span>
            <span className="text-blue-600">{input.value}</span>
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {type === 'plan' && data.map((plan, idx) => (
            <Card key={plan._id || idx} title={`Step ${idx + 1}`}>
              <div className="text-lg font-bold mb-2 text-gray-900">{plan.step}</div>
              {plan.details && <div className="text-gray-900">{plan.details}</div>}
            </Card>
          ))}
          {type === 'notes' && data.map((note, idx) => (
            <Card key={note._id || idx} title={<span className="text-xl font-black text-gray-900 mb-2">{note.title}</span>}>
              <div className="prose max-w-none prose-pre:bg-gray-100 prose-pre:text-gray-800 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none text-black !opacity-100">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      if (match && match[1] === 'mermaid') {
                        return <Mermaid chart={String(children).trim()} />;
                      }
                      if (!inline) {
                        return (
                          <div className="bg-gray-100 text-gray-800 rounded-lg p-4 overflow-x-auto my-3 border border-gray-200">
                            <pre className="m-0 bg-transparent p-0 border-none shadow-none">
                              <code className={className} style={{ color: 'inherit', background: 'none' }} {...props}>{children}</code>
                            </pre>
                          </div>
                        );
                      }
                      return <code className={className} {...props}>{children}</code>;
                    }
                  }}
                >{note.content}</ReactMarkdown>
              </div>
            </Card>
          ))}
          {type === 'quiz' && data.map((quiz, idx) => (
            <Card key={quiz._id || idx} title={`Q${idx + 1}: ${quiz.question}`}>
              <div className="space-y-2">
                {quiz.options && quiz.options.map((opt, i) => (
                  <div key={i} className="flex items-center">
                    <input type="radio" name={`quiz-${quiz._id}`} value={opt} disabled className="mr-2" />
                    <span>{opt}</span>
                  </div>
                ))}
                <div className="mt-2 text-green-600 font-semibold">Correct Answer: {quiz.answer}</div>
              </div>
            </Card>
          ))}
          {type === 'revision' && (
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Topic / Subject Area</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((rev, idx) => {
                    const isCompleted = (statusMap[rev._id] || rev.status) === 'completed';
                    return (
                      <tr key={rev._id || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400 font-medium">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{rev.topic}</td>
                        <td className="px-6 py-4 text-right">
                          {isCompleted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Done
                            </span>
                          ) : (
                            <button
                              className="inline-flex items-center px-3 py-1 bg-white border border-blue-600 text-blue-600 text-xs font-bold rounded-md hover:bg-blue-50 transition shadow-sm"
                              onClick={() => handleStatusChange(rev._id, 'completed')}
                            >
                              Mark Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
