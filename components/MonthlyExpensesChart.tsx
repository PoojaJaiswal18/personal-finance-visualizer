import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface MonthlyExpensesChartProps {
  transactions: Transaction[];
}

export default function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  const monthlyData = React.useMemo(() => {
    const monthlyExpenses: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const month = new Date(transaction.date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short'
        });
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + transaction.amount;
      });

    return Object.entries(monthlyExpenses)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6);
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-200 font-medium">{label}</p>
          <p className="text-blue-400 font-semibold">
            Expenses: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (monthlyData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No expense data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#1e40af" stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="month" 
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="amount" 
          fill="url(#expenseGradient)"
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
          animationBegin={0}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
