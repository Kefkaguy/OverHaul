import { getToken } from 'next-auth/jwt';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');

  // GET — return this user's voted problem IDs
  if (req.method === 'GET') {
    const user = await db.collection('users').findOne(
      { id: token.id },
      { projection: { _id: 0, votedProblemIds: 1 } }
    );
    return res.status(200).json(user?.votedProblemIds || []);
  }

  // POST — toggle vote on a problem
  if (req.method === 'POST') {
    const { problemId } = req.body;
    if (!problemId) return res.status(400).json({ error: 'problemId required' });

    const user = await db.collection('users').findOne({ id: token.id });
    const hasVoted = user?.votedProblemIds?.includes(problemId);

    if (hasVoted) {
      await db.collection('users').updateOne({ id: token.id }, { $pull: { votedProblemIds: problemId } });
      await db.collection('problems').updateOne({ id: problemId }, { $inc: { votes: -1 } });
    } else {
      await db.collection('users').updateOne(
        { id: token.id },
        { $addToSet: { votedProblemIds: problemId } }
      );
      await db.collection('problems').updateOne({ id: problemId }, { $inc: { votes: 1 } });
    }

    const problem = await db.collection('problems').findOne(
      { id: problemId },
      { projection: { _id: 0, votes: 1 } }
    );
    return res.status(200).json({ voted: !hasVoted, votes: problem?.votes ?? 0 });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
