import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    const collection = db.collection('budgets');

    switch (req.method) {
      case 'GET':
        const budgets = await collection
          .find({})
          .sort({ month: -1, category: 1 })
          .toArray();
        
        res.status(200).json(budgets);
        break;

      case 'POST':
        const { category, amount, month } = req.body;
        
        if (!category || !amount || !month) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        if (amount <= 0) {
          return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        const existingBudget = await collection.findOne({ category, month });
        
        if (existingBudget) {
          return res.status(400).json({ error: 'Budget already exists for this category and month' });
        }

        const newBudget = {
          category,
          amount: parseFloat(amount),
          month,
          createdAt: new Date()
        };

        const result = await collection.insertOne(newBudget);
        const insertedBudget = await collection.findOne({ _id: result.insertedId });
        
        res.status(201).json(insertedBudget);
        break;

      case 'PUT':
        const { id } = req.query;
        const updateData = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Budget ID is required' });
        }

        if (updateData.amount <= 0) {
          return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id as string) },
          { 
            $set: {
              ...updateData,
              amount: parseFloat(updateData.amount),
              updatedAt: new Date()
            }
          }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Budget not found' });
        }

        const updatedBudget = await collection.findOne({ _id: new ObjectId(id as string) });
        res.status(200).json(updatedBudget);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
