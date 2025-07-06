import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction, Budget } from '@/lib/types';
import { formatCurrency, getCurrentMonth } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface SpendingInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const currentMonth = getCurrentMonth();

  const insights = React.useMemo(() => {
    const currentMonthTransactions = transactions.filter(t =>
      t.date.startsWith(currentMonth)
    );
    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);

    const expensesByCategory = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0);

    const overBudgetCategories = currentMonthBudgets
      .filter(budget => (expensesByCategory[budget.category] || 0) > budget.amount)
      .map(budget => ({
        category: budget.category,
        budget: budget.amount,
        actual: expensesByCategory[budget.category] || 0,
        overspent: (expensesByCategory[budget.category] || 0) - budget.amount
      }));

    const topSpendingCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0];

    const averageDailySpending = totalExpenses / new Date().getDate();
    const projectedMonthlySpending = averageDailySpending * 30;

    return {
      totalExpenses,
      totalBudget,
      overBudgetCategories,
      topSpendingCategory: topSpendingCategory ? {
        name: topSpendingCategory[0],
        amount: topSpendingCategory[1]
      } : null,
      averageDailySpending,
      projectedMonthlySpending,
      budgetUtilization: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0
    };
  }, [transactions, budgets, currentMonth]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Spending Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-300">Budget Utilization</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {insights.budgetUtilization.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">
              {formatCurrency(insights.totalExpenses)} of {formatCurrency(insights.totalBudget)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Daily Average</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(insights.averageDailySpending)}
            </div>
            <div className="text-sm text-slate-400">
              Projected: {formatCurrency(insights.projectedMonthlySpending)}
            </div>
          </div>
        </div>

        {insights.topSpendingCategory && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-300">Top Spending Category</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">
                {insights.topSpendingCategory.name}
              </span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(insights.topSpendingCategory.amount)}
              </span>
            </div>
          </div>
        )}

        {insights.overBudgetCategories.length > 0 && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-red-300 font-medium">Over Budget Categories</span>
              </div>
              <div className="space-y-2">
                {insights.overBudgetCategories.map((category) => (
                  <div key={category.category} className="flex items-center justify-between bg-red-900/20 rounded-md p-2">
                    <span className="text-red-200 font-medium">{category.category}</span>
                    <Badge variant="destructive" className="bg-red-600/80 text-red-100">
                      +{formatCurrency(category.overspent)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <div className="text-sm text-slate-400">Budget Remaining:</div>
            <div className={`text-lg font-bold ${insights.totalBudget - insights.totalExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(insights.totalBudget - insights.totalExpenses)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-400">Categories with Budget:</div>
            <div className="text-lg font-bold text-white">
              {budgets.filter(b => b.month === currentMonth).length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="text-center">
            <div className="text-sm text-slate-400">Over Budget Categories:</div>
            <div className="text-lg font-bold text-red-400">
              {insights.overBudgetCategories.length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
