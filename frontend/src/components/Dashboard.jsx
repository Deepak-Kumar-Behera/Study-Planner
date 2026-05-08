import React from 'react';
import useFetch from '../hooks/useFetch';
import QuizAttemptList from './QuizAttemptList';

const Dashboard = ({ onStartNewStudy }) => {
  const { data, loading, error } = useFetch('/progress');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">Dashboard</h2>
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded font-bold hover:bg-blue-700 shadow transition-colors"
          onClick={onStartNewStudy}
        >
          Start New Study
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error loading progress.</div>}
      {data && (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg font-semibold text-gray-600">Topics Studied</div>
              <div className="text-2xl font-bold text-blue-600">{data.topicsStudied ?? 0}</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg font-semibold text-gray-600">Notes Generated</div>
              <div className="text-2xl font-bold text-blue-600">{data.notesGenerated ?? 0}</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg font-semibold text-gray-600">Quiz Attempts</div>
              <div className="text-2xl font-bold text-blue-600">{data.quizAttempts ?? 0}</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg font-semibold text-gray-600">Revision Completed</div>
              <div className="text-2xl font-bold text-blue-600">{data.revisionCompleted ?? 0}</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-lg font-semibold text-gray-600">Quiz Score</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.quizScore ? `${data.quizScore.score} / ${data.quizScore.total}` : '0 / 0'}
              </div>
            </div>
          </div>

          {/* Summary Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded shadow p-4">
              <div className="font-semibold text-gray-700 mb-2">Recent Topics</div>
              <ul className="list-disc ml-5 text-gray-600">
                {data.recentTopics?.length ? data.recentTopics.map((item, i) => (
                  <li key={i}>{item}</li>
                )) : <li>No recent topics.</li>}
              </ul>
            </div>
          </div>

          {/* Quiz Attempts List */}
          <div className="mb-8">
            <div className="font-semibold text-gray-700 mb-3 text-lg">Quiz Attempts</div>
            <QuizAttemptList />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
