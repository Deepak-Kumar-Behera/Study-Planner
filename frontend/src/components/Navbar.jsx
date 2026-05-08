import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav>
    <ul>
      <li><Link to="/dashboard">Dashboard</Link></li>
      <li><Link to="/planner">Planner</Link></li>
      <li><Link to="/notes">Notes</Link></li>
      <li><Link to="/quiz">Quiz</Link></li>
      <li><Link to="/revision">Revision</Link></li>
    </ul>
  </nav>
);

export default Navbar;
