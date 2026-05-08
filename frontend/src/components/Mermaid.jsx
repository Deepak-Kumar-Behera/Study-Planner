
import React, { useRef, useEffect } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ 
  startOnLoad: false, 
  suppressErrorRendering: true,
  theme: 'base',
  themeVariables: {
    primaryColor: '#e0e7ff',
    primaryTextColor: '#1e40af',
    primaryBorderColor: '#6366f1',
    lineColor: '#4f46e5',
    secondaryColor: '#f0f9ff',
    tertiaryColor: '#ffffff',
  }
});

const showFallback = (el, chart) => {
  const escaped = chart.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  el.innerHTML = `<pre style="background:#f8f8f8;border:1px solid #ddd;padding:8px;border-radius:4px;overflow-x:auto;font-size:0.85em;">${escaped}</pre>`;
};

const Mermaid = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!chart || typeof chart !== 'string' || chart.trim().length === 0) return;
    if (!ref.current) return;

    let cancelled = false;
    ref.current.innerHTML = '';
    const uniqueId = 'mermaid-' + Math.random().toString(36).substr(2, 9);

    // Validate syntax before rendering
    mermaid.parse(chart)
      .then(() => mermaid.render(uniqueId, chart))
      .then(({ svg }) => {
        if (!cancelled && ref.current) {
          // Guard: if mermaid returned an error SVG, show fallback
          if (svg.includes('Syntax error') || svg.includes('mermaid version')) {
            showFallback(ref.current, chart);
          } else {
            ref.current.innerHTML = svg;
          }
        }
      })
      .catch(() => {
        if (!cancelled && ref.current) {
          showFallback(ref.current, chart);
        }
      });

    return () => { cancelled = true; };
  }, [chart]);

  return <div ref={ref} className="bg-white p-4 rounded-xl border border-gray-100 my-4 shadow-sm overflow-hidden"></div>;
};

export default Mermaid;
