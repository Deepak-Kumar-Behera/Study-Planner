import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Card from './Card';

export default function QuizByInputPage({ input, onBack }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      await api.post('/generate/quiz', { inputId: input._id });
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

  return (
    <div className="pb-20">
      <button className="mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded" onClick={onBack}>&larr; Back</button>
      <div className="flex items-center justify-between mb-4">
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

      {loading || generating ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-lg">
          {generating ? 'Generating quiz from your notes...' : 'Loading...'}
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
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
              <span className="text-xl font-bold text-blue-700">
                Score: {results.score} / {results.total}
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
