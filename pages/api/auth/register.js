import bcrypt from 'bcryptjs';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password, handle } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'overhaul');

  const existing = await db.collection('users').findOne({
    $or: [
      { email: email.toLowerCase().trim() },
      ...(handle ? [{ handle: handle.trim() }] : []),
    ],
  });
  if (existing) {
    const field = existing.email === email.toLowerCase().trim() ? 'email' : 'handle';
    return res.status(409).json({ error: `That ${field} is already taken` });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const id = `u-${Date.now()}`;
  const finalHandle = handle?.trim() || email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const newUser = {
    id,
    handle: finalHandle,
    name: name.trim(),
    initials,
    email: email.toLowerCase().trim(),
    passwordHash,
    age: null,
    location: 'Unknown',
    joinedLabel: `Joined ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
    bio: '0 reports · 0 fixes shipped',
    reportedProblemIds: [],
    profileImpact: [
      { value: '0', label: 'Reported' },
      { value: '0', label: 'Voted' },
      { value: '0', label: 'Comments' },
      { value: '0', label: 'Fixed because of you' },
      { value: '+0', label: 'Reputation' },
    ],
    weeklyImpact: [
      { value: '0', label: 'votes' },
      { value: '0', label: 'reports' },
      { value: '0', label: 'fixed' },
      { value: '+0', label: 'rep' },
    ],
    recentActivity: [],
    createdAt: new Date(),
  };

  await db.collection('users').insertOne(newUser);

  // Return safe user (no passwordHash)
  const { passwordHash: _, _id, ...safe } = newUser;
  res.status(201).json(safe);
}
