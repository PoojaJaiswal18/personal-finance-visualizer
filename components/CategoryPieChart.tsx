import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const MODERN_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

interface CategoryData {
  category: string;
  amount: number;
  percentage: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryData;
  }>;
}

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color?: string;
    payload?: CategoryData;
  }>;
}

export default function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const categoryData = React.useMemo(() => {
    const categoryExpenses: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryExpenses[transaction.category] =
          (categoryExpenses[transaction.category] || 0) + transaction.amount;
      });

    const total = Object.values(categoryExpenses).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(categoryExpenses)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-200 font-medium">{data.category}</p>
          <p className="text-blue-400 font-semibold">
            {formatCurrency(data.amount)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
    if (!payload) return null;

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300 text-sm">{entry.value}</span>
            {entry.payload && (
              <span className="text-slate-400 text-sm">
                {formatCurrency(entry.payload.amount)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (categoryData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No expense data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <defs>
          {MODERN_COLORS.map((color, index) => (
            <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percentage }) => `${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
          animationBegin={0}
          animationDuration={1000}
        >
          {categoryData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#gradient${index % MODERN_COLORS.length})`}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
