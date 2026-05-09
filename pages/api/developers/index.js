import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');
  const docs = await db.collection('developers').find({}, { projection: { _id: 0 } }).toArray();
  res.status(200).json(docs);
}
