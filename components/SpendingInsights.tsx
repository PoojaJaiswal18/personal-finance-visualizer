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
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium">Budget Utilization</h3>
            </div>
            <p className="text-2xl font-bold">
              {insights.budgetUtilization.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(insights.totalExpenses)} of {formatCurrency(insights.totalBudget)}
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <h3 className="font-medium">Daily Average</h3>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(insights.averageDailySpending)}
            </p>
            <p className="text-sm text-muted-foreground">
              Projected: {formatCurrency(insights.projectedMonthlySpending)}
            </p>
          </div>
        </div>

        {insights.topSpendingCategory && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <h3 className="font-medium">Top Spending Category</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">{insights.topSpendingCategory.name}</span>
              <Badge variant="secondary">
                {formatCurrency(insights.topSpendingCategory.amount)}
              </Badge>
            </div>
          </div>
        )}

        {insights.overBudgetCategories.length > 0 && (
          <div className="p-4 border rounded-lg border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h3 className="font-medium text-red-800">Over Budget Categories</h3>
            </div>
            <div className="space-y-2">
              {insights.overBudgetCategories.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <Badge variant="destructive">
                    +{formatCurrency(category.overspent)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span>Budget Remaining:</span>
            <span className={insights.totalBudget - insights.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(insights.totalBudget - insights.totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Categories with Budget:</span>
            <span>{budgets.filter(b => b.month === currentMonth).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Over Budget Categories:</span>
            <span className="text-red-600">{insights.overBudgetCategories.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
