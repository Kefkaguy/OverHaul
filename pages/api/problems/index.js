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
    const { title, category, location, description } = req.body;
    const id = `user-${Date.now()}`;
    const newProblem = {
      id,
      title: title || 'Untitled civic problem',
      category: category || 'Local',
      location: location || 'Citywide',
      reportedAgo: 'just now',
      reporter: { name: 'Jada Kim', handle: 'jadak', age: 22 },
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
    const { _id, ...safe } = newProblem;
    return res.status(201).json(safe);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
