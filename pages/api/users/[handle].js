import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { handle } = req.query;
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');
  const doc = await db.collection('users').findOne({ handle }, { projection: { _id: 0 } });
  if (!doc) return res.status(404).json({ error: 'User not found' });
  res.status(200).json(doc);
}
