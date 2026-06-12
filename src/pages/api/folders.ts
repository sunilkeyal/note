import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Folder } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await connectToDatabase();
  const collection = db.collection('folders');

  if (req.method === 'GET') {
    const folders = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const mapped: Folder[] = folders.map((f) => ({
      _id: f._id.toString(),
      name: f.name,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    }));

    return res.status(200).json({ success: true, data: mapped });
  }

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Folder name is required' });
    }

    const now = new Date();
    const result = await collection.insertOne({
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
    });

    const folder: Folder = {
      _id: result.insertedId.toString(),
      name: name.trim(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return res.status(201).json({ success: true, data: folder });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
