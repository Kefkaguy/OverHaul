import clientPromise from '../../lib/mongodb';

const seedProblems = [
  {
    id: 'p1',
    title: 'Bus 21 has been late or cancelled on 1 in 3 days for six months',
    category: 'Transit',
    location: 'East Side, Oakland',
    reportedAgo: '3 days ago',
    reporter: { name: 'Marcus Webb', handle: 'marcusw', age: 34 },
    votes: 4287,
    voteVelocity: '+312 this week',
    affected: '~8,400 daily riders',
    status: 'Open · 2 solutions in progress',
    solutionsCount: 2,
    duplicates: 17,
    ai: 'Riders across 17 separate reports describe Bus 21 along the E. 14th corridor missing scheduled stops most weekday mornings since November. Pattern points to a driver shortage at the Eastmont depot rather than route-level issues. AC Transit board meeting is Nov 28.',
    tags: ['transit', 'commute', 'public-services'],
    heroImg: 'transit',
  },
  {
    id: 'p2',
    title: "The affordable housing waitlist hasn't moved a single name in 11 months",
    category: 'Housing',
    location: 'Citywide',
    reportedAgo: '1 week ago',
    reporter: { name: 'Priya Shankar', handle: 'priya', age: 28 },
    votes: 8924,
    voteVelocity: '+1.2k this week',
    affected: '~14,000 households',
    status: 'Open · Council attention',
    solutionsCount: 4,
    duplicates: 43,
    ai: 'Across 43 reports, residents describe applying to the BMR housing list and receiving no movement, no responses, and no public visibility into where they sit. Two reports include FOIA responses showing the queue management system was last updated in 2022.',
    tags: ['housing', 'government', 'transparency'],
    heroImg: 'housing',
  },
  {
    id: 'p3',
    title: 'School-issued laptops block half the sites teachers actually assign',
    category: 'Education',
    location: 'Unified School District 4',
    reportedAgo: '5 days ago',
    reporter: { name: 'Ms. Tovar', handle: 'tovar.teaches', age: 41 },
    votes: 2156,
    voteVelocity: '+208 this week',
    affected: '~22,000 students',
    status: 'Open · 1 solution in progress',
    solutionsCount: 1,
    duplicates: 9,
    ai: 'Reports from 9 teachers and 4 students describe district-issued Chromebooks blocking Khan Academy, Wikipedia subdomains, Desmos, and Project Gutenberg. The block list appears to be inherited from a 2019 policy and never reviewed.',
    tags: ['education', 'youth', 'tech'],
    heroImg: 'edu',
  },
  {
    id: 'p4',
    title: 'There is no public dashboard for what the city actually spends',
    category: 'Digital',
    location: 'Citywide',
    reportedAgo: '2 weeks ago',
    reporter: { name: 'Devhub Collective', handle: 'devhub', age: null },
    votes: 1893,
    voteVelocity: '+87 this week',
    affected: 'All residents',
    status: 'Open · Dev hub claimed',
    solutionsCount: 3,
    duplicates: 6,
    ai: 'Six reports request a single public, queryable dashboard showing line-item city spend. Data is technically posted as quarterly PDFs but is unsearchable. Three open-source devs have already started parsing the PDFs.',
    tags: ['transparency', 'civic-tech', 'open-data'],
    heroImg: 'data',
  },
  {
    id: 'p5',
    title: 'Streetlights on Maple Ave have been out since March',
    category: 'Local',
    location: 'Maple Ave, blocks 200–800',
    reportedAgo: '4 days ago',
    reporter: { name: 'Jada Kim', handle: 'jadak', age: 22 },
    votes: 743,
    voteVelocity: '+91 this week',
    affected: '~3 blocks of pedestrians',
    status: 'Open · Reported to 311',
    solutionsCount: 0,
    duplicates: 11,
    ai: '11 residents report a 7-block stretch of Maple Ave between Center and Park has had non-functional streetlights since early March. Three reports include 311 ticket numbers that were marked closed without repair.',
    tags: ['safety', 'infrastructure', 'lighting'],
    heroImg: 'street',
  },
  {
    id: 'p6',
    title: 'Night-shift workers have nowhere to put their kids after 7pm',
    category: 'Local',
    location: 'Hospital district',
    reportedAgo: '6 days ago',
    reporter: { name: 'Rosa Delgado', handle: 'rosa.d', age: 36 },
    votes: 5612,
    voteVelocity: '+540 this week',
    affected: '~2,100 night-shift parents',
    status: 'Open · 2 solutions proposed',
    solutionsCount: 2,
    duplicates: 24,
    ai: '24 reports from nurses, security guards, and warehouse workers describe a complete absence of childcare options after 7pm in this metro area. Two coalitions have proposed pilot programs; one is fundraising.',
    tags: ['childcare', 'housing', 'labor'],
    heroImg: 'care',
  },
  {
    id: 'p7',
    title: 'Track every campaign promise the city council actually made',
    category: 'Digital',
    location: 'Citywide',
    reportedAgo: '3 weeks ago',
    reporter: { name: 'Alex Park', handle: 'alex', age: 17 },
    votes: 3421,
    voteVelocity: '+62 this week',
    affected: 'Voters',
    status: 'Open · Youth team building',
    solutionsCount: 1,
    duplicates: 4,
    ai: 'Four reports request a tool to scrape council campaign sites, log every measurable promise, and track follow-through. A 5-person youth team in Oakland has started building it under the OverHaul Youth program.',
    tags: ['accountability', 'civic-tech', 'youth'],
    heroImg: 'civic',
  },
];

const seedSolutions = [
  { id: 's1', problemId: 'p1', name: 'TransitTruth', team: '@kaiwong + 3', stage: 'Beta · 240 testers', summary: 'Crowd-sourced live tracker for Bus 21 + a weekly board-ready report.', supporters: 612 },
  { id: 's2', problemId: 'p1', name: 'DriverDepot', team: '@civicfellows', stage: 'Research', summary: 'Opening data on driver shortages by depot.', supporters: 89 },
  { id: 's3', problemId: 'p2', name: 'WaitlistOpen', team: '@priya + 5', stage: 'Prototype', summary: 'A public, anonymized queue position lookup for the BMR list.', supporters: 1240 },
  { id: 's4', problemId: 'p4', name: 'CityLedger', team: '@devhub', stage: 'Beta', summary: 'Parses quarterly PDFs into a searchable JSON budget.', supporters: 320 },
  { id: 's5', problemId: 'p7', name: 'PromiseKept', team: 'Oakland Youth Hack', stage: 'Building', summary: 'Tracks campaign promises against votes.', supporters: 410 },
];

const seedCategories = [
  { key: 'all', label: 'All', count: 1284, showInFeed: true, showInSubmit: false },
  { key: 'Transit', label: 'Transit', count: 187, showInFeed: true, showInSubmit: true },
  { key: 'Housing', label: 'Housing', count: 312, showInFeed: true, showInSubmit: true },
  { key: 'Education', label: 'Education', count: 142, showInFeed: true, showInSubmit: true },
  { key: 'Digital', label: 'Digital tools', count: 96, showInFeed: true, showInSubmit: true },
  { key: 'Local', label: 'Local services', count: 547, showInFeed: true, showInSubmit: true },
  { key: 'Healthcare', label: 'Healthcare', count: 0, showInFeed: false, showInSubmit: true },
  { key: 'Safety', label: 'Safety', count: 0, showInFeed: false, showInSubmit: true },
  { key: 'Environment', label: 'Environment', count: 0, showInFeed: false, showInSubmit: true },
  { key: 'Jobs', label: 'Jobs', count: 0, showInFeed: false, showInSubmit: true },
  { key: 'Infrastructure', label: 'Infrastructure', count: 0, showInFeed: false, showInSubmit: true },
];

const seedStats = {
  key: 'global',
  problemsReported: 12847,
  solutionsLaunched: 318,
  devsBuilding: 1204,
  youthTeams: 87,
};

const seedDevelopers = [
  { id: 'd1', name: 'Kai Wong', handle: 'kaiwong', focus: 'Transit · OSS', shipped: 4 },
  { id: 'd2', name: 'Maya Chen', handle: 'maya', focus: 'Civic · Youth', shipped: 2, age: 16 },
  { id: 'd3', name: 'Devhub Collective', handle: 'devhub', focus: 'Open data', shipped: 11 },
  { id: 'd4', name: 'Priya Shankar', handle: 'priya', focus: 'Housing', shipped: 1 },
];

const seedComments = [
  {
    id: 'c1',
    problemId: 'p1',
    who: 'M. Rivera',
    when: '2h',
    text: 'Confirming this — Bus 21 was a no-show again Tuesday. I work at the depot and the driver schedule is publicly broken; I can pull the rotation.',
  },
  {
    id: 'c2',
    problemId: 'p1',
    who: 'kaiwong',
    when: '5h',
    text: 'TransitTruth team here. We have 240 active testers. Looking for someone who has a contact at the AC Transit board to coordinate the public report.',
  },
  {
    id: 'c3',
    problemId: 'p1',
    who: 'Anon · East 14th',
    when: '1d',
    text: 'Missed two interviews because of this. Lost a job offer. Not exaggerating.',
  },
];

const seedTags = [
  { id: 't1', label: 'transit', trending: true },
  { id: 't2', label: 'housing', trending: true },
  { id: 't3', label: 'youth', trending: true },
  { id: 't4', label: 'open-data', trending: true },
  { id: 't5', label: 'safety', trending: true },
];

const seedUsers = [
  {
    id: 'u1',
    handle: 'jadak',
    name: 'Jada Kim',
    initials: 'JK',
    age: 22,
    location: 'East Oakland',
    joinedLabel: 'Joined March 2026',
    bio: '4 reports · 1 fix shipped',
    reportedProblemIds: ['p5'],
    profileImpact: [
      { value: '4', label: 'Reported' },
      { value: '127', label: 'Voted' },
      { value: '3', label: 'Comments' },
      { value: '1', label: 'Fixed because of you' },
      { value: '+342', label: 'Reputation' },
    ],
    weeklyImpact: [
      { value: '12', label: 'votes' },
      { value: '3', label: 'reports' },
      { value: '1', label: 'fixed' },
      { value: '+24', label: 'rep' },
    ],
    recentActivity: [
      { action: 'Voted', what: "The affordable housing waitlist hasn't moved...", when: '2h ago' },
      { action: 'Commented', what: 'School-issued laptops block half the sites...', when: '1d' },
      { action: 'Voted', what: 'Bus 21 has been late or cancelled...', when: '3d' },
      { action: 'Reported', what: 'Streetlights on Maple Ave have been out...', when: '4d' },
    ],
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed — use POST' });
  }

  try {
    const client = await (await import('../../lib/mongodb')).default;
    const db = client.db(process.env.MONGODB_DB || 'overhaul');

    const results = {};

    const upsert = async (collection, docs, keyField = 'id') => {
      let inserted = 0;
      for (const doc of docs) {
        const result = await db.collection(collection).updateOne(
          { [keyField]: doc[keyField] },
          { $setOnInsert: doc },
          { upsert: true }
        );
        if (result.upsertedCount) inserted++;
      }
      return inserted;
    };

    results.problems = await upsert('problems', seedProblems);
    results.solutions = await upsert('solutions', seedSolutions);
    results.categories = await upsert('categories', seedCategories, 'key');
    results.stats = (await db.collection('stats').updateOne(
      { key: 'global' },
      { $setOnInsert: seedStats },
      { upsert: true }
    )).upsertedCount ? 1 : 0;
    results.developers = await upsert('developers', seedDevelopers);
    results.comments = await upsert('comments', seedComments);
    results.tags = await upsert('tags', seedTags);
    results.users = await upsert('users', seedUsers);

    res.status(200).json({ ok: true, inserted: results });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
}
