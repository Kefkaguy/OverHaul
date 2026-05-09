import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');
  const doc = await db.collection('problems').findOne({ id }, { projection: { _id: 0 } });
  if (!doc) return res.status(404).json({ error: 'Problem not found' });
  res.status(200).json(doc);
}
