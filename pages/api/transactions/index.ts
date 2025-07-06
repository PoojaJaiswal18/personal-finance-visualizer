import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    const collection = db.collection('transactions');

    switch (req.method) {
      case 'GET':
        const transactions = await collection
          .find({})
          .sort({ date: -1 })
          .toArray();
        
        res.status(200).json(transactions);
        break;

      case 'POST':
        const { amount, date, description, category, type } = req.body;
        
        if (!amount || !date || !description || !category || !type) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        if (amount <= 0) {
          return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        const newTransaction = {
          amount: parseFloat(amount),
          date: new Date(date).toISOString(),
          description: description.trim(),
          category,
          type,
          createdAt: new Date()
        };

        const result = await collection.insertOne(newTransaction);
        const insertedTransaction = await collection.findOne({ _id: result.insertedId });
        
        res.status(201).json(insertedTransaction);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
