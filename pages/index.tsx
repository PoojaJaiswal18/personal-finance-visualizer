import React, { useState, useEffect } from 'react';
import { Transaction, Budget } from '@/lib/types';
import AddTransactionDialog from '@/components/AddTransactionDialog';
import TransactionList from '@/components/TransactionList';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import DashboardCards from '@/components/DashboardCards';
import BudgetForm from '@/components/BudgetForm';
import BudgetComparisonChart from '@/components/BudgetComparisonChart';
import SpendingInsights from '@/components/SpendingInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (!response.ok) throw new Error('Failed to fetch budgets');
      const data = await response.json();
      setBudgets(data);
    } catch (err) {
      setError('Failed to load budgets');
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchBudgets()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev =>
      prev.map(t => t._id === updatedTransaction._id ? updatedTransaction : t)
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t._id !== id));
  };

  const handleBudgetUpdate = () => {
    fetchBudgets();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your financial universe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Personal Finance Visualizer
          </h1>
          <AddTransactionDialog onAdd={handleAddTransaction} />
        </div>

        <DashboardCards transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="text-white">Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyExpensesChart transactions={transactions} />
            </CardContent>
          </Card>

          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="text-white">Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetComparisonChart transactions={transactions} budgets={budgets} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={transactions.slice(0, 4)}
                onUpdate={handleUpdateTransaction}
                onDelete={handleDeleteTransaction}
              />
            </CardContent>
          </Card>

          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="text-white">Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart transactions={transactions} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BudgetForm budgets={budgets} onUpdate={handleBudgetUpdate} />
          <SpendingInsights transactions={transactions} budgets={budgets} />
        </div>
      </div>
    </div>
  );
}
