import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/lib/types';
import { formatCurrency, getCurrentMonth } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

interface DashboardCardsProps {
  transactions: Transaction[];
}

export default function DashboardCards({ transactions }: DashboardCardsProps) {
  const stats = React.useMemo(() => {
    const currentMonth = getCurrentMonth();
    const currentMonthTransactions = transactions.filter(t =>
      t.date.startsWith(currentMonth)
    );

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: currentMonthTransactions.length
    };
  }, [transactions]);

  const cardData = [
    {
      title: "Total Balance",
      value: stats.balance,
      icon: Wallet,
      gradient: "from-blue-500 to-blue-600",
      highlight: true
    },
    {
      title: "Income",
      value: stats.totalIncome,
      icon: TrendingUp,
      gradient: "from-gray-600 to-gray-700"
    },
    {
      title: "Expenses",
      value: stats.totalExpenses,
      icon: TrendingDown,
      gradient: "from-gray-600 to-gray-700"
    },
    {
      title: "Predictions",
      value: stats.balance * 1.12,
      icon: Target,
      gradient: "from-gray-600 to-gray-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cardData.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <Card 
            key={card.title}
            className={`metric-card ${card.highlight ? 'gradient-border' : ''} relative overflow-hidden`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${card.gradient}`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {typeof card.value === 'number' ? formatCurrency(card.value) : card.value}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-30"></div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
