import React, { useState } from 'react';
import api from '../services/api';

const validate = (form) => {
  const errors = {};
  const username = form.username.trim();
  const email    = form.email.trim();
  const password = form.password;

  if (!username) {
    errors.username = 'Username is required.';
  } else if (username.length < 3 || username.length > 20) {
    errors.username = 'Username must be 3–20 characters.';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Only letters, numbers and underscores allowed.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 4) {
    errors.password = 'Password must be at least 4 characters';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter.';
  } else if (!/[a-z]/.test(password)) {
    errors.password = 'Password must contain at least one lowercase letter.';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Password must contain at least one number.';
  }

  return errors;
};

const SignupForm = ({ onSignup }) => {
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (submitted) {
      const newErrors = validate(updated);
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSubmitted(true);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        username: form.username.trim(),
        email:    form.email.trim(),
        password: form.password,
      });
      onSignup && onSignup(res.data);
    } catch (err) {
      setServerError(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border p-2 rounded focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-gray-300 focus:ring-blue-300'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow" noValidate>
      <h2 className="text-xl font-bold">Sign Up</h2>

      <div>
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className={inputClass('username')}
        />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
      </div>

      <div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={inputClass('email')}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={inputClass('password')}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        {!errors.password && form.password && (
          <p className="text-gray-400 text-xs mt-1">Min 4 chars, uppercase, lowercase &amp; number required.</p>
        )}
      </div>

      {serverError && <div className="text-red-500 text-sm">{serverError}</div>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm;

