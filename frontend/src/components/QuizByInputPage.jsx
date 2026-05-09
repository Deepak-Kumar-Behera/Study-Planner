import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Card from './Card';

const DIFFICULTY_STYLES = {
  easy:   { label: 'Easy',   bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300' },
  medium: { label: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  hard:   { label: 'Hard',   bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300'   },
};

const NEXT_DIFFICULTY_HINT = {
  easy:   'Score ≥ 75% on your next attempt to move to Medium',
  medium: 'Score ≥ 75% → Hard · Score < 40% → Easy',
  hard:   'Score < 75% → Medium',
};

export default function QuizByInputPage({ input, onBack }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');

  // Fetch the current difficulty for this topic on mount
  useEffect(() => {
    api.get(`/quiz/difficulty/${input._id}`)
      .then(res => setDifficulty(res.data.difficulty || 'medium'))
      .catch(() => {});
  }, [input._id]);

  const fetchQuizzes = useCallback(() => {
    setLoading(true);
    setSubmitted(false);
    setResults(null);
    setSelected({});
    api.get(`/quizzes/input/${input._id}`)
      .then(res => setQuizzes(res.data.data || res.data))
      .finally(() => setLoading(false));
  }, [input._id]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/generate/quiz', { inputId: input._id });
      if (res.data.difficulty) setDifficulty(res.data.difficulty);
      fetchQuizzes();
    } catch (err) {
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = (qid, option) => {
    setSelected(prev => ({ ...prev, [qid]: option }));
  };

  const handleSubmit = async () => {
    const unanswered = quizzes.filter(q => !selected[q._id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions before submitting. (${unanswered.length} unanswered)`);
      return;
    }
    setSubmitting(true);
    try {
      const answers = quizzes.map(q => ({ quizId: q._id, selected: selected[q._id] || '' }));
      const res = await api.post('/quiz/submit', { answers });
      setResults(res.data);
      if (res.data.difficulty) setDifficulty(res.data.difficulty);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSubmitted(false);
    setResults(null);
    setSelected({});
  };

  const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium;

  return (
    <div className="pb-20">
      <button className="mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded" onClick={onBack}>&larr; Back</button>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Quiz: <span className="text-blue-700">{input.value}</span></h2>
        {quizzes.length > 0 && !submitted && (
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 disabled:opacity-60"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Regenerating...' : 'Regenerate Quiz'}
          </button>
        )}
      </div>

      {/* Difficulty badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold mb-4 ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}>
        <span>Difficulty: {diffStyle.label}</span>
        <span className="font-normal opacity-70">· {NEXT_DIFFICULTY_HINT[difficulty]}</span>
      </div>

      {loading || generating ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-lg">
          {generating ? `Generating ${diffStyle.label} quiz from your notes...` : 'Loading...'}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 mb-6 text-lg">No quiz yet for this topic.</p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded font-bold text-lg hover:bg-blue-700"
            onClick={handleGenerate}
          >
            Generate Quiz from Notes
          </button>
        </div>
      ) : (
        <>
          {submitted && results && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-700">
                  Score: {results.score} / {results.total}
                  &nbsp;({Math.round((results.score / results.total) * 100)}%)
                </span>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300"
                    onClick={handleRetake}
                  >
                    Retake Quiz
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    Regenerate Quiz
                  </button>
                </div>
              </div>
              {results.difficulty && (
                <div className={`mt-3 text-sm font-medium ${DIFFICULTY_STYLES[results.difficulty]?.text}`}>
                  Next quiz difficulty adjusted to: <span className="font-bold">{DIFFICULTY_STYLES[results.difficulty]?.label}</span>
                  &nbsp;— {NEXT_DIFFICULTY_HINT[results.difficulty]}
                </div>
              )}

              {/* Knowledge Gap Analysis UI */}
              {results.gapAnalysis && results.gapAnalysis.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-bold mb-3 text-gray-800">Knowledge Gap Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.gapAnalysis.map((gap, i) => (
                      <div key={i} className={`p-3 rounded border ${
                        gap.status === 'weak' ? 'bg-red-50 border-red-200' : 
                        gap.status === 'strong' ? 'bg-green-50 border-green-200' : 
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">{gap.topic}</span>
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                            gap.status === 'weak' ? 'bg-red-200 text-red-800' : 
                            gap.status === 'strong' ? 'bg-green-200 text-green-800' : 
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {gap.status === 'weak' ? 'Weak' : gap.status === 'strong' ? 'Strong' : 'Average'}
                          </span>
                        </div>
                        <div className="text-sm mt-1">
                          Score: {gap.score} / {gap.total}
                        </div>
                        {gap.status === 'weak' && (
                          <div className="mt-2 text-xs text-red-600 italic">
                            Suggestion: Re-read the notes for "{gap.topic}" to fill this gap.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-6">
              {quizzes.map((quiz, idx) => {
                let answerObj = null;
                if (submitted && results) {
                  answerObj = results.answers.find(a => a.quizId === quiz._id);
                }
                return (
                  <Card key={quiz._id || idx} title={`Q${idx + 1}: ${quiz.question}`}>
                    <div className="space-y-2">
                      {quiz.options && quiz.options.map((opt, i) => {
                        let optClass = '';
                        if (submitted && answerObj) {
                          if (opt === quiz.answer) optClass = 'text-green-600 font-bold';
                          if (answerObj.selected === opt && !answerObj.correct) optClass = 'text-red-600 font-bold';
                        }
                        return (
                          <div key={i} className="flex items-center">
                            <input
                              type="radio"
                              name={`quiz-${quiz._id}`}
                              value={opt}
                              checked={selected[quiz._id] === opt}
                              onChange={() => handleSelect(quiz._id, opt)}
                              className="mr-2"
                              disabled={submitted}
                            />
                            <span className={optClass}>{opt}</span>
                          </div>
                        );
                      })}
                      {submitted && answerObj && (
                        <div className={answerObj.correct ? 'text-green-600 font-semibold mt-2' : 'text-red-600 font-semibold mt-2'}>
                          {answerObj.correct ? 'Correct!' : `Incorrect. Correct: ${quiz.answer}`}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            {!submitted && (
              <button
                type="submit"
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
}
