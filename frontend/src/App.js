import React, { useState } from 'react';

import SyllabusInput from './components/SyllabusInput';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';

import Dashboard from './components/Dashboard';
import StartNewStudy from './components/StartNewStudy';
import Sidebar from './components/Sidebar';


import InputListPage from './components/InputListPage';
import DataByInputPage from './components/DataByInputPage';
import QuizByInputPage from './components/QuizByInputPage';



function App() {
  const [syllabus, setSyllabus] = useState(() => {
    const stored = localStorage.getItem('syllabus');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authTab, setAuthTab] = useState('login');
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  });

  // State for input drilldown
  const [inputState, setInputState] = useState({ type: '', input: null });

  // Reset inputState when tab changes
  React.useEffect(() => {
    setInputState({ type: activeTab, input: null });
  }, [activeTab]);

  // Handle signup/login success
  const handleSignup = () => setAuthTab('login');
  const handleLogin = (data) => {
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSyllabus(null);
    localStorage.removeItem('syllabus');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">AI Study Planner & Auto Notes Generator</h1>
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${authTab === 'login' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'}`}
            onClick={() => setAuthTab('login')}
          >
            Log In
          </button>
          <button
            className={`px-4 py-2 rounded ${authTab === 'signup' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border'}`}
            onClick={() => setAuthTab('signup')}
          >
            Sign Up
          </button>
        </div>
        <div className="w-full max-w-sm">
          {authTab === 'login' ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <SignupForm onSignup={handleSignup} />
          )}
        </div>
      </div>
    );
  }



  // Show main app with sidebar
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar active={activeTab} onSelect={setActiveTab} onLogout={handleLogout} user={user} />
      <main className="flex-1 p-8 ml-56">
        {activeTab === 'dashboard' && (
          <Dashboard onStartNewStudy={() => {
              setSyllabus(null);
              localStorage.removeItem('syllabus');
              setActiveTab('study');
            }} />
        )}
        {activeTab === 'study' && (
          <StartNewStudy
            userId={user?.id}
            onPlanGenerated={(data) => {
              setSyllabus(data.plan || []);
              localStorage.setItem('syllabus', JSON.stringify(data.plan || []));
              setActiveTab('dashboard');
            }}
          />
        )}
        {activeTab === 'plan' && (
          inputState.type === 'plan' && inputState.input
            ? <DataByInputPage type="plan" input={inputState.input} onBack={() => setInputState({ type: 'plan', input: null })} />
            : <InputListPage type="plan" onSelectInput={input => setInputState({ type: 'plan', input })} />
        )}
        {activeTab === 'notes' && (
          inputState.type === 'notes' && inputState.input
            ? <DataByInputPage type="notes" input={inputState.input} onBack={() => setInputState({ type: 'notes', input: null })} />
            : <InputListPage type="notes" onSelectInput={input => setInputState({ type: 'notes', input })} />
        )}
        {activeTab === 'quiz' && (
          inputState.type === 'quiz' && inputState.input
            ? <QuizByInputPage input={inputState.input} onBack={() => setInputState({ type: 'quiz', input: null })} />
            : <InputListPage type="quiz" onSelectInput={input => setInputState({ type: 'quiz', input })} />
        )}
        {activeTab === 'revision' && (
          inputState.type === 'revision' && inputState.input
            ? <DataByInputPage type="revision" input={inputState.input} onBack={() => setInputState({ type: 'revision', input: null })} />
            : <InputListPage type="revision" onSelectInput={input => setInputState({ type: 'revision', input })} />
        )}
      </main>
    </div>
  );

}

export default App;
