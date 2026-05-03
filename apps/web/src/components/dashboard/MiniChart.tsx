import React, { useMemo } from 'react';

interface MiniChartProps {
  values: Array<number | string>;
}

export const MiniChart: React.FC<MiniChartProps> = ({ values }) => {
  const points = useMemo(() => {
    const numeric = values.map(Number).filter(Number.isFinite);
    if (numeric.length === 0) {
      return '';
    }

    const width = 120;
    const height = 36;
    const max = Math.max(...numeric, 100);
    const min = Math.min(...numeric, 0);
    const range = max - min || 1;

    return numeric
      .map((value, index) => {
        const x = numeric.length === 1 ? width : (index / (numeric.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [values]);

  return (
    <svg viewBox="0 0 120 36" className="h-9 w-28" role="img" aria-label="Price trend">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
