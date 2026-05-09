import { getToken } from 'next-auth/jwt';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');
  const col = db.collection('problems');

  if (req.method === 'GET') {
    const docs = await col.find({}, { projection: { _id: 0 } }).toArray();
    return res.status(200).json(docs);
  }

  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { title, category, location, description, reporter } = req.body;
    const id = `user-${Date.now()}`;
    const newProblem = {
      id,
      title: title || 'Untitled civic problem',
      category: category || 'Local',
      location: location || 'Citywide',
      reportedAgo: 'just now',
      reporter: reporter || { name: 'Anonymous', handle: 'anon', age: null },
      votes: 1,
      voteVelocity: '+1 this week',
      affected: 'Needs review',
      status: 'Open · Newly reported',
      solutionsCount: 0,
      duplicates: 1,
      ai: description || 'New report submitted by the community. OverHaul will cluster similar reports as more context arrives.',
      tags: [(category || 'local').toLowerCase().replace(/\s+/g, '-'), 'new-report'],
      heroImg: 'local',
      createdAt: new Date(),
    };
    await col.insertOne(newProblem);

    // Track on the user's profile
    if (token?.id) {
      await db.collection('users').updateOne(
        { id: token.id },
        { $addToSet: { reportedProblemIds: id } }
      );
    }

    const { _id, ...safe } = newProblem;
    return res.status(201).json(safe);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
