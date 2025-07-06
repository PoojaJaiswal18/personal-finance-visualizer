import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid transaction ID' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    const collection = db.collection('transactions');

    switch (req.method) {
      case 'PUT':
        const { amount, date, description, category, type } = req.body;
        
        if (!amount || !date || !description || !category || !type) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        if (amount <= 0) {
          return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        const updateData = {
          amount: parseFloat(amount),
          date: new Date(date).toISOString(),
          description: description.trim(),
          category,
          type,
          updatedAt: new Date()
        };

        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        const updatedTransaction = await collection.findOne({ _id: new ObjectId(id) });
        res.status(200).json(updatedTransaction);
        break;

      case 'DELETE':
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        res.status(200).json({ message: 'Transaction deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
