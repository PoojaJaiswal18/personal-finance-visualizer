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
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Budget: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-red-600">
            Actual: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-green-600">
            Remaining: {formatCurrency(payload[2].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (comparisonData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No budget data available for this month
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `₹${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
            <Bar dataKey="actual" fill="#ef4444" name="Actual" />
            <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
