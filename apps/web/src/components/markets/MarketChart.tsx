import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

interface HistoryRecord {
  id: string;
  price: number;
  recorded_at: string;
}

interface OptionWithHistory {
  id?: string;
  label: string;
  current_price: number;
  history?: HistoryRecord[];
}

interface MarketChartProps {
  options: OptionWithHistory[];
}

type ChartDataPoint = {
  timestamp: string;
  [optionLabel: string]: string | number | null;
};

export const MarketChart: React.FC<MarketChartProps> = ({ options }) => {
  const chartData = useMemo(() => {
    // Collect all unique timestamps from all options' histories
    const allTimestamps = new Set<string>();
    options.forEach((opt) => {
      opt.history?.forEach((h) => allTimestamps.add(h.recorded_at));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    // Map each timestamp to a data point containing prices for each option
    return sortedTimestamps.map((timestamp) => {
      const dataPoint: ChartDataPoint = { timestamp };

      options.forEach((opt) => {
        // Find the closest historical price for this option at or before this timestamp
        const records = opt.history || [];
        const pastRecords = records.filter((r) => new Date(r.recorded_at) <= new Date(timestamp));
        if (pastRecords.length > 0) {
          pastRecords.sort(
            (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
          );
          dataPoint[opt.label] = pastRecords[0].price;
        } else {
          // If no past record, use a default or null.
          dataPoint[opt.label] = null;
        }
      });

      return dataPoint;
    });
  }, [options]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-muted/20">
        <p className="text-muted-foreground text-sm">Not enough history to display chart.</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(tick) => format(new Date(tick), 'MMM d, HH:mm')}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(tick) => `${tick}¢`}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy HH:mm')}
            formatter={(value: unknown) => [`${Number(value).toFixed(1)}¢`, undefined]}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend />
          {options.map((opt, i) => (
            <Line
              key={opt.id ?? opt.label}
              type="stepAfter"
              dataKey={opt.label}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
