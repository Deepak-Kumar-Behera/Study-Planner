import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from './Card';

export default function InputListPage({ type, onSelectInput }) {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let endpoint = '';
    if (type === 'plan') endpoint = '/plan-inputs';
    else if (type === 'notes') endpoint = '/note-inputs';
    else if (type === 'quiz') endpoint = '/quiz-inputs';
    else if (type === 'revision') endpoint = '/revision-inputs';
    api.get(endpoint)
      .then(res => setInputs(res.data))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="pb-20 pl-8">
      <h2 className="text-2xl font-bold mb-4 capitalize">{type}</h2>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inputs.map((input, idx) => (
            <Card key={input._id || idx}>
              <button
                className="w-full text-left text-blue-700 font-semibold hover:underline p-2"
                onClick={() => onSelectInput(input)}
              >
                {input.value}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
