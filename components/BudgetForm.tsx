import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, Budget } from '@/lib/types';
import { getCurrentMonth, formatCurrency } from '@/lib/utils';

interface BudgetFormProps {
  budgets: Budget[];
  onUpdate: () => void;
}

export default function BudgetForm({ budgets, onUpdate }: BudgetFormProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currentMonth] = useState(getCurrentMonth());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const existingBudget = budgets.find(b => 
    b.category === selectedCategory && b.month === currentMonth
  );

  useEffect(() => {
    if (existingBudget) {
      setAmount(existingBudget.amount.toString());
    } else {
      setAmount('');
    }
  }, [existingBudget]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const method = existingBudget ? 'PUT' : 'POST';
      const url = existingBudget 
        ? `/api/budgets?id=${existingBudget._id}`
        : '/api/budgets';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          amount: parseFloat(amount),
          month: currentMonth
        })
      });

      if (response.ok) {
        onUpdate();
        setSelectedCategory('');
        setAmount('');
        setErrors({});
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
          </div>

          <Button type="submit" className="w-full">
            {existingBudget ? 'Update Budget' : 'Set Budget'}
          </Button>
        </form>

        {budgets.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Current Budgets</h3>
            <div className="space-y-2">
              {budgets
                .filter(b => b.month === currentMonth)
                .map((budget) => (
                  <div key={budget._id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{budget.category}</span>
                    <span className="font-medium">{formatCurrency(budget.amount)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
