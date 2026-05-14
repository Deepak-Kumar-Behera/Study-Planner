import React, { useState } from 'react';
import api from '../services/api';

const MAX_LEN = 200;

const validateInput = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return 'Study topic is required.';
  if (trimmed.length < 3) return 'Topic must be at least 3 characters.';
  if (trimmed.length > MAX_LEN) return `Topic cannot exceed ${MAX_LEN} characters.`;
  return '';
};

const StartNewStudy = ({ userId, onPlanGenerated }) => {
  const [input, setInput] = useState('');
  const [type, setType] = useState('syllabus');
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_LEN) return;          // hard cap while typing
    setInput(val);
    if (submitted) setInputError(validateInput(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSubmitted(true);
    const err = validateInput(input);
    setInputError(err);
    if (err) return;

    setLoading(true);
    try {
      const res = await api.post('/generate', { input: input.trim(), type, userId });
      onPlanGenerated && onPlanGenerated(res.data);
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'Failed to generate study plan.');
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
            className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 ${
              inputError
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
            }`}
            value={input}
            onChange={handleChange}
            placeholder="e.g. Quantum Computing"
            maxLength={MAX_LEN}
          />
          <div className="flex justify-between mt-1">
            {inputError
              ? <p className="text-red-500 text-xs">{inputError}</p>
              : <span />}
            <p className={`text-xs ml-auto ${
              input.length >= MAX_LEN ? 'text-red-500' : 'text-gray-400'
            }`}>{input.length}/{MAX_LEN}</p>
          </div>
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
        {serverError && (
          <div className="p-2 bg-red-50 text-red-600 rounded text-xs font-semibold border border-red-100">
            {serverError}
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
