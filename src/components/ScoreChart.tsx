import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ScoreHistoryItem {
  ts: string;
  score: number;
}

interface ScoreChartProps {
  history: ScoreHistoryItem[];
  className?: string;
}

export function ScoreChart({ history, className }: ScoreChartProps) {
  const data = history.map((item, index) => ({
    time: new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    score: item.score,
    index
  }));

  if (data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center h-32 text-muted-foreground text-sm", className)}>
        Not enough data for chart
      </div>
    );
  }

  return (
    <div className={cn("h-40", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}