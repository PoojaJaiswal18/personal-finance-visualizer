import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit, Trash2, Target, Music, Utensils, RefreshCw } from 'lucide-react';
import EditTransactionDialog from './EditTransactionDialog';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'Shopping': Target,
    'Subscriptions': Music,
    'Food': Utensils,
    'Transfer': RefreshCw
  };
  return icons[category] || Target;
};

export default function TransactionList({ transactions, onUpdate, onDelete }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          onDelete(id);
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No transactions found. Add your first transaction to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const IconComponent = getCategoryIcon(transaction.category);
          
          return (
            <div
              key={transaction._id}
              className="transaction-item p-4 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="text-sm text-slate-400">{transaction.category}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-slate-400">{formatDate(transaction.date)}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(transaction)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(transaction._id!)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EditTransactionDialog
        transaction={editingTransaction}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingTransaction(null);
        }}
        onUpdate={onUpdate}
      />
    </>
  );
}
