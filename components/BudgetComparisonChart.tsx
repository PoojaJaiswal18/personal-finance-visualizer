import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction, Budget } from '@/lib/types';
import { formatCurrency, getCurrentMonth } from '@/lib/utils';

interface BudgetComparisonChartProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function BudgetComparisonChart({ transactions, budgets }: BudgetComparisonChartProps) {
  const currentMonth = getCurrentMonth();
  
  const comparisonData = React.useMemo(() => {
    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
    const currentMonthExpenses = transactions.filter(t =>
      t.type === 'expense' && t.date.startsWith(currentMonth)
    );

    const expensesByCategory = currentMonthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return currentMonthBudgets.map(budget => ({
      category: budget.category,
      budget: budget.amount,
      actual: expensesByCategory[budget.category] || 0,
      remaining: Math.max(0, budget.amount - (expensesByCategory[budget.category] || 0))
    }));
  }, [transactions, budgets, currentMonth]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-4 shadow-xl">
          <p className="text-slate-200 font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-400 font-semibold">
              Budget: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-red-400 font-semibold">
              Actual: {formatCurrency(payload[1].value)}
            </p>
            <p className="text-emerald-400 font-semibold">
              Remaining: {formatCurrency(payload[2].value)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (comparisonData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No budget data available for this month</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#1e40af" stopOpacity={0.6}/>
          </linearGradient>
          <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6}/>
          </linearGradient>
          <linearGradient id="remainingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#059669" stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="category" 
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
        <Legend 
          wrapperStyle={{ color: '#94a3b8' }}
          iconType="rect"
        />
        <Bar 
          dataKey="budget" 
          fill="url(#budgetGradient)"
          name="Budget"
          radius={[2, 2, 0, 0]}
          animationDuration={1000}
          animationBegin={0}
        />
        <Bar 
          dataKey="actual" 
          fill="url(#actualGradient)"
          name="Actual"
          radius={[2, 2, 0, 0]}
          animationDuration={1000}
          animationBegin={200}
        />
        <Bar 
          dataKey="remaining" 
          fill="url(#remainingGradient)"
          name="Remaining"
          radius={[2, 2, 0, 0]}
          animationDuration={1000}
          animationBegin={400}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
