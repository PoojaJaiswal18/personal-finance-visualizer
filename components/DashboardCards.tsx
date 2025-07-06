import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/lib/types';
import { formatCurrency, getCurrentMonth } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

    const topCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategoryName = Object.entries(topCategory)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      totalIncome,
      totalExpenses,
      balance,
      topCategory: topCategoryName,
      transactionCount: currentMonthTransactions.length
    };
  }, [transactions]);

  const cardData = [
    {
      title: "Total Income",
      value: stats.totalIncome,
      icon: TrendingUp,
      trend: ArrowUpRight,
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      textColor: "text-emerald-600",
      delay: "0s"
    },
    {
      title: "Total Expenses",
      value: stats.totalExpenses,
      icon: TrendingDown,
      trend: ArrowDownRight,
      color: "from-red-500 to-pink-600",
      bgColor: "from-red-50 to-pink-50",
      textColor: "text-red-600",
      delay: "0.1s"
    },
    {
      title: "Balance",
      value: stats.balance,
      icon: Wallet,
      trend: stats.balance >= 0 ? ArrowUpRight : ArrowDownRight,
      color: stats.balance >= 0 ? "from-blue-500 to-indigo-600" : "from-orange-500 to-red-600",
      bgColor: stats.balance >= 0 ? "from-blue-50 to-indigo-50" : "from-orange-50 to-red-50",
      textColor: stats.balance >= 0 ? "text-blue-600" : "text-orange-600",
      delay: "0.2s"
    },
    {
      title: "Top Category",
      value: stats.topCategory,
      icon: Calendar,
      trend: ArrowUpRight,
      color: "from-purple-500 to-violet-600",
      bgColor: "from-purple-50 to-violet-50",
      textColor: "text-purple-600",
      delay: "0.3s",
      isCategory: true
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => {
        const IconComponent = card.icon;
        const TrendComponent = card.trend;
        
        return (
          <Card 
            key={card.title}
            className={`relative overflow-hidden hover-lift group cursor-pointer animate-fade-in border-0 shadow-lg hover:shadow-xl bg-gradient-to-br ${card.bgColor}`}
            style={{ animationDelay: card.delay }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color} shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${card.textColor} group-hover:scale-105 transition-transform duration-300`}>
                    {card.isCategory ? card.value : formatCurrency(typeof card.value === 'number' ? card.value : 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.isCategory ? `${stats.transactionCount} transactions` : 'This month'}
                  </p>
                </div>
                <div className={`p-1 rounded-full ${card.textColor} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                  <TrendComponent className="h-4 w-4" />
                </div>
              </div>
              
              {/* Progress bar for visual appeal */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 bg-gradient-to-r ${card.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: card.isCategory ? '75%' : `${Math.min(100, Math.abs(typeof card.value === 'number' ? card.value : 0) / 10000 * 100)}%`,
                    animationDelay: `${0.5 + index * 0.1}s`
                  }}
                ></div>
              </div>
            </CardContent>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          </Card>
        );
      })}
    </div>
  );
}
