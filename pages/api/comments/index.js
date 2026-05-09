import { getToken } from 'next-auth/jwt';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');

  if (req.method === 'GET') {
    const filter = req.query.problemId ? { problemId: req.query.problemId } : {};
    const docs = await db.collection('comments').find(filter, { projection: { _id: 0 } }).toArray();
    return res.status(200).json(docs);
  }

  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const { problemId, text } = req.body;
    if (!text?.trim() || !problemId) {
      return res.status(400).json({ error: 'problemId and text are required' });
    }

    const newComment = {
      id: `c-${Date.now()}`,
      problemId,
      who: token.name || 'Anonymous',
      handle: token.handle || '',
      when: 'just now',
      text: text.trim(),
      authorId: token.id,
      createdAt: new Date(),
    };
    await db.collection('comments').insertOne(newComment);
    const { _id, ...safe } = newComment;
    return res.status(201).json(safe);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
