import React, { useState } from 'react';
import api from '../services/api';

const StartNewStudy = ({ userId, onPlanGenerated }) => {
  const [input, setInput] = useState('');
  const [type, setType] = useState('syllabus');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/generate', { input, type, userId });
      onPlanGenerated && onPlanGenerated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate study plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Start New Study</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Study Topic</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. Quantum Computing"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Structure Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('topic')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold transition ${type === 'topic' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Single Topic
            </button>
            <button
              type="button"
              onClick={() => setType('syllabus')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold transition ${type === 'syllabus' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="16" height="12" x="4" y="5" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              </svg>
              Full Syllabus
            </button>
          </div>
        </div>
        {error && (
          <div className="p-2 bg-red-50 text-red-600 rounded text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}
        <button
          type="submit"
          className={`w-full py-2 rounded font-bold text-base transition ${
            loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? (
            <span>Generating...</span>
          ) : (
            "Generate Study Plan"
          )}
        </button>
      </form>
    </div>
  );
};

export default StartNewStudy;
