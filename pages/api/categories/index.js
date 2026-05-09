import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');

  const filter = {};
  if (req.query.feed === 'true') filter.showInFeed = true;
  if (req.query.submit === 'true') filter.showInSubmit = true;

  const docs = await db.collection('categories').find(filter, { projection: { _id: 0 } }).toArray();
  res.status(200).json(docs);
}
