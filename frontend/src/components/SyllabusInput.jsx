import React, { useState } from 'react';

const SyllabusInput = ({ onSubmit }) => {
  const [syllabus, setSyllabus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = syllabus.trim();
    if (!trimmed) {
      setError('Please enter a syllabus or topic.');
      return;
    }
    if (trimmed.length < 3) {
      setError('Input must be at least 3 characters.');
      return;
    }
    if (trimmed.length > 1000) {
      setError('Input cannot exceed 1000 characters.');
      return;
    }
    setError('');
    onSubmit(trimmed.split(',').map(s => s.trim()).filter(Boolean));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Enter Syllabus or Topic</h2>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={4}
        placeholder="e.g. Algebra, Optics, Calculus"
        value={syllabus}
        onChange={e => setSyllabus(e.target.value)}
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Generate Study Resources</button>
    </form>
  );
};

export default SyllabusInput;
