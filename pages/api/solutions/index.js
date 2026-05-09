import { getToken } from 'next-auth/jwt';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');

  if (req.method === 'GET') {
    const filter = req.query.problemId ? { problemId: req.query.problemId } : {};
    const docs = await db.collection('solutions').find(filter, { projection: { _id: 0 } }).toArray();
    return res.status(200).json(docs);
  }

  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const { problemId, name, summary, stage } = req.body;
    if (!problemId || !name?.trim()) {
      return res.status(400).json({ error: 'problemId and name are required' });
    }

    // Prevent duplicate claims by the same user on the same problem
    const existing = await db.collection('solutions').findOne({ problemId, authorId: token.id });
    if (existing) return res.status(409).json({ error: 'You already claimed this problem' });

    const id = `s-${Date.now()}`;
    const newSolution = {
      id,
      problemId,
      name: name.trim(),
      team: `@${token.handle || token.name}`,
      stage: stage || 'Planning',
      summary: summary?.trim() || 'Plan coming soon.',
      supporters: 0,
      authorId: token.id,
      createdAt: new Date(),
    };

    await db.collection('solutions').insertOne(newSolution);

    // Bump the problem's solutionsCount and status
    const problem = await db.collection('problems').findOneAndUpdate(
      { id: problemId },
      {
        $inc: { solutionsCount: 1 },
        $set: { status: 'Open · solution in progress' },
      },
      { returnDocument: 'after', projection: { _id: 0, solutionsCount: 1 } }
    );
    const count = problem?.solutionsCount ?? 1;
    await db.collection('problems').updateOne(
      { id: problemId },
      { $set: { status: `Open · ${count} solution${count !== 1 ? 's' : ''} in progress` } }
    );

    const { _id, ...safe } = newSolution;
    return res.status(201).json(safe);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
