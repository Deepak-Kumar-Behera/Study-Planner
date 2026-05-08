import React from 'react';

const Card = ({ title, children }) => (
  <div className="bg-white rounded shadow p-4 mb-4">
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <div>{children}</div>
  </div>
);

export default Card;
