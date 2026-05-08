import React, { useEffect, useState } from 'react';

const CorrelationMatrixTable = () => {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/correlation-matrix')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setMatrix(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!matrix) return null;

  return (
    <div>
      <h2>Correlation Matrix</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', margin: '1em 0' }}>
        <thead>
          <tr>
            <th></th>
            {matrix.features.map((f) => (
              <th key={f}>{f}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.matrix.map((row, i) => (
            <tr key={i}>
              <th>{matrix.features[i]}</th>
              {row.map((val, j) => (
                <td key={j}>{val.toFixed(2)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <strong>Interpretation:</strong> Values close to 1 or -1 indicate strong positive or negative correlation, respectively. Values close to 0 indicate weak correlation.
      </p>
    </div>
  );
};

export default CorrelationMatrixTable;
