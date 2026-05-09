import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { Icon } from './icons';
import { LandingPage } from './web-landing';

// web-app.jsx — App shell + Feed + Detail + Submit + Hub + Profile (animated)

const cx = (...classes) => classes.filter(Boolean).join(' ');

const display =
  'font-[var(--sans)] font-semibold leading-[0.92] tracking-[-0.035em] [text-wrap:balance]';
const eyebrow =
  'font-[var(--mono)] text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-[var(--text-mute)]';
const mono = 'font-[var(--mono)]';
const num = '[font-variant-numeric:tabular-nums]';
const card = 'rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)]';
const signalButton =
  'inline-flex cursor-pointer appearance-none items-center gap-2 rounded-[10px] border-0 bg-[var(--signal)] px-[18px] py-[13px] font-[var(--sans)] text-sm font-semibold leading-none tracking-[-0.005em] text-[var(--signal-ink)] transition-[transform,background,color] duration-150 hover:bg-[#FFE54B] active:translate-y-px';
const ghostButton =
  'inline-flex cursor-pointer appearance-none items-center gap-2 rounded-[10px] border border-[var(--line-2)] bg-transparent px-[18px] py-[13px] font-[var(--sans)] text-sm font-semibold leading-none tracking-[-0.005em] text-[var(--text)] transition-[transform,border-color,color] duration-150 hover:border-[var(--text)] active:translate-y-px';
const inputClass =
  'w-full rounded-[10px] border border-[var(--line-2)] bg-[var(--surface)] px-4 py-3.5 font-[var(--sans)] text-[15px] font-normal leading-[1.4] text-[var(--text)] outline-none placeholder:text-[var(--text-mute)]';

const sortOptions = [
  ['hot', 'Most upvoted'],
  ['new', 'Newest'],
  ['near', 'Near me'],
];
const submitSteps = [1, 2, 3];

// ——————————————————————————————————————————————
// Animation primitives
// ——————————————————————————————————————————————

const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_PUNCH = [0.16, 1, 0.3, 1];

const buttonHover = { scale: 1.03 };
const buttonTap = { scale: 0.97 };

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

function StaggerGroup({ children, className, stagger = 0.06, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Count-up that respects formatting (commas, +, k, etc.)
function CountUp({ value, duration = 1.4, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(typeof value === 'string' ? value.replace(/\d/g, '0') : '0');

  useEffect(() => {
    if (!inView) return;
    const str = String(value);
    const match = str.match(/-?[\d,.]+/);
    if (!match) {
      setDisplay(str);
      return;
    }
    const numericStr = match[0];
    const target = parseFloat(numericStr.replace(/,/g, ''));
    if (Number.isNaN(target)) {
      setDisplay(str);
      return;
    }
    const hasComma = numericStr.includes(',');
    const decimals = (numericStr.split('.')[1] || '').length;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      let formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }
      setDisplay(str.replace(numericStr, formatted));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return <span ref={ref} className={className}>{display}</span>;
}

// Number that smoothly tweens between values when it changes (for vote counters)
function LiveNumber({ value, format = (v) => v.toLocaleString(), className, duration = 0.4 }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      setShown(current);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{format(shown)}</span>;
}

const MotionButton = motion.button;

export function WebApp({ view, setView, activeProblemId, goToProblem, tweaks, theme, onOpenPlatform, onGoHome }) {
  if (view === 'landing') {
    return <LandingPage onEnter={onOpenPlatform || (() => setView('feed'))} theme={theme} />;
  }

  return (
    <AppShell
      view={view}
      setView={setView}
      activeProblemId={activeProblemId}
      goToProblem={goToProblem}
      tweaks={tweaks}
      onGoHome={onGoHome}
    />
  );
}

function AppShell({ view, setView, activeProblemId, goToProblem, tweaks, onGoHome }) {
  const { data: session } = useSession();
  const [problems, setProblems] = useState([]);
  const [feedCategories, setFeedCategories] = useState([]);
  const [submitCategories, setSubmitCategories] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/problems').then((r) => r.json()),
      fetch('/api/categories?feed=true').then((r) => r.json()),
      fetch('/api/categories?submit=true').then((r) => r.json()),
      fetch('/api/developers').then((r) => r.json()),
      fetch('/api/solutions').then((r) => r.json()),
      fetch('/api/tags').then((r) => r.json()),
      fetch('/api/stats').then((r) => r.json()),
    ])
      .then(([probs, feedCats, submitCats, devs, sols, tgs, sts]) => {
        setProblems(probs);
        setFeedCategories(feedCats);
        setSubmitCategories(submitCats.map((c) => c.key));
        setDevelopers(devs);
        setSolutions(sols);
        setTags(tgs);
        setStats(sts);
      })
      .catch((err) => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeProblem = problems.find((p) => p.id === activeProblemId) || problems[0];

  const allCategories = [
    ...feedCategories,
    ...[...new Set(problems.map((p) => p.category))]
      .filter((cat) => !feedCategories.some((c) => c.key === cat))
      .map((cat) => ({
        key: cat,
        label: cat,
        count: problems.filter((p) => p.category === cat).length,
      })),
  ];

  const publishProblem = async (form) => {
    const title = form.title.trim() || 'Untitled civic problem';
    const category = form.cat.trim() || 'Local';
    const location = form.loc.trim() || 'Citywide';
    const description = form.desc.trim();
    const reporter = session?.user
      ? { name: session.user.name, handle: session.user.handle || session.user.email?.split('@')[0], age: null }
      : { name: 'Anonymous', handle: 'anon', age: null };
    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, location, description, reporter }),
      });
      const newProblem = await res.json();
      setProblems((current) => [newProblem, ...current]);
      goToProblem(newProblem.id);
    } catch {
      const id = `user-${Date.now()}`;
      const newProblem = {
        id, title, category, location,
        reportedAgo: 'just now',
        reporter,
        votes: 1, voteVelocity: '+1 this week',
        affected: 'Needs review', status: 'Open · Newly reported',
        solutionsCount: 0, duplicates: 1,
        ai: description || 'New report submitted by the community. OverHaul will cluster similar reports as more context arrives.',
        tags: [category.toLowerCase().replace(/\s+/g, '-'), 'new-report'],
        heroImg: 'local',
      };
      setProblems((current) => [newProblem, ...current]);
      goToProblem(id);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen grid-cols-[240px_1fr] bg-[var(--bg)] text-[var(--text)]">
        <div className="sticky top-0 h-screen border-r border-[var(--line)] bg-[var(--bg)]" />
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className={`${mono} text-sm text-[var(--text-mute)]`}
          >
            Loading…
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-[var(--bg)] text-[var(--text)]">
      <Sidebar view={view} setView={setView} onGoHome={onGoHome} tags={tags} />
      <div className="flex min-w-0 flex-col">
        <TopBar search={search} setSearch={setSearch} setView={setView} />
        <main className="min-w-0 flex-1 px-9 pb-[60px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + (view === 'detail' ? `-${activeProblemId}` : '')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              {view === 'feed' && (
                <FeedScreen
                  problems={problems}
                  categories={allCategories}
                  activeCat={activeCat}
                  setActiveCat={setActiveCat}
                  goToProblem={goToProblem}
                  tweaks={tweaks}
                  developers={developers}
                />
              )}
              {view === 'detail' && activeProblem && (
                <DetailScreen
                  problem={activeProblem}
                  problems={problems}
                  setView={setView}
                  goToProblem={goToProblem}
                />
              )}
              {view === 'submit' && (
                <SubmitScreen
                  setView={setView}
                  onPublish={publishProblem}
                  submitCategories={submitCategories}
                />
              )}
              {view === 'hub' && (
                <HubScreen
                  problems={problems}
                  solutions={solutions}
                  stats={stats}
                  goToProblem={goToProblem}
                />
              )}
              {view === 'profile' && <ProfileScreen goToProblem={goToProblem} setView={setView} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, onGoHome, tags }) {
  const items = [
    { k: 'feed', label: 'Feed', icon: <Icon.Home /> },
    { k: 'hub', label: 'Build', icon: <Icon.Hammer /> },
    { k: 'profile', label: 'You', icon: <Icon.User /> },
  ];

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="sticky top-0 flex h-screen flex-col border-r border-[var(--line)] bg-[var(--bg)] px-4 py-[22px]"
    >
      <div
        onClick={() => (onGoHome ? onGoHome() : setView('landing'))}
        className="mb-7 flex cursor-pointer items-center gap-2.5 px-2 py-1.5"
      >
        <motion.div
          whileHover={{ rotate: -6, scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="grid h-7 w-7 place-items-center rounded-md bg-[var(--signal)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 18V8l7 7 7-7v10"
              stroke="#0D1B2A"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <span className="font-[var(--sans)] text-[17px] font-semibold leading-none tracking-[-0.02em]">
          OverHaul
        </span>
      </div>

      <MotionButton
        whileHover={buttonHover}
        whileTap={buttonTap}
        className={cx(signalButton, 'mb-[18px] w-full justify-center px-4 py-[13px] text-sm')}
        onClick={() => setView('submit')}
      >
        <Icon.Plus /> Report a problem
      </MotionButton>

      <nav className="relative flex flex-col gap-0.5">
        {items.map((it) => {
          const active = view === it.k || (it.k === 'feed' && view === 'detail');
          return (
            <button
              key={it.k}
              onClick={() => setView(it.k)}
              className={cx(
                'relative flex cursor-pointer appearance-none items-center gap-3 rounded-[9px] border-0 px-3 py-[11px] text-left font-[var(--sans)] text-sm font-medium leading-none transition-colors duration-150',
                active ? 'text-[var(--text)]' : 'bg-transparent text-[var(--text-mute)] hover:text-[var(--text)]',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-[9px] bg-[var(--surface-2)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{it.icon}</span>
              <span className="relative z-10">{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-7 px-3">
        <div className={cx(eyebrow, 'mb-3 text-[10px]')}>Trending tags</div>
        {tags.length > 0 && (
          <StaggerGroup className="flex flex-wrap gap-[5px]" stagger={0.05} delay={0.3}>
            {tags.map((tag) => (
              <motion.span
                key={tag.label}
                variants={staggerItem}
                whileHover={{ scale: 1.06, color: 'var(--text)' }}
                className={`${mono} cursor-default rounded-full border border-[var(--line-2)] px-[9px] py-1 text-[11px] text-[var(--text-mute)]`}
              >
                #{tag.label}
              </motion.span>
            ))}
          </StaggerGroup>
        )}
      </div>

      <div className={`${mono} mt-auto px-3 text-[11px] tracking-[0.04em] text-[var(--text-mute)]`}>
        v0.4.1 · ALL SYSTEMS GO
      </div>
    </motion.aside>
  );
}

function TopBar({ search, setSearch, setView }) {
  const { data: session } = useSession();
  const initials = session?.user?.initials || session?.user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 }}
      className="sticky top-0 z-40 flex items-center gap-[18px] border-b border-[var(--line)] bg-[var(--bg)] px-9 py-5"
    >
      <motion.div
        whileFocusWithin={{ borderColor: 'var(--text)' }}
        className="flex max-w-[540px] flex-1 items-center gap-2.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-[11px] transition-colors duration-150 focus-within:border-[var(--text-mute)]"
      >
        <span className="text-[var(--text-mute)]">
          <Icon.Search />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problems, solutions, tags..."
          className="w-full border-0 bg-transparent font-[var(--sans)] text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-mute)]"
        />
        <span className={`${mono} rounded-[5px] border border-[var(--line-2)] px-[7px] py-[3px] text-[11px] text-[var(--text-mute)]`}>
          ⌘K
        </span>
      </motion.div>
      <div className="flex-1" />
      <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={cx(ghostButton, 'px-3 py-[9px] text-[13px]')}>
        <Icon.Bell />
      </MotionButton>
      <div className="relative group">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 4 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          onClick={() => setView('profile')}
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-[var(--bg)] bg-[linear-gradient(135deg,#FFD60A,#FF4D2E)] text-sm font-bold text-[#0D1B2A]"
        >
          {initials}
        </motion.div>
        {/* Sign-out dropdown */}
        <div className="absolute right-0 top-full mt-2 hidden group-hover:block">
          <div className={`${mono} rounded-[10px] border border-[var(--line)] bg-[var(--surface)] py-1 shadow-lg`}>
            <button
              onClick={() => setView('profile')}
              className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap border-0 bg-transparent px-4 py-2 text-left text-[13px] text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              Profile
            </button>
            <div className="mx-3 my-1 h-px bg-[var(--line)]" />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap border-0 bg-transparent px-4 py-2 text-left text-[13px] text-[#FF4D2E] hover:bg-[var(--surface-2)]"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function FeedScreen({ problems, categories, activeCat, setActiveCat, goToProblem, tweaks, developers }) {
  const filtered = activeCat === 'all' ? problems : problems.filter((p) => p.category === activeCat);
  const [voted, setVoted] = useState({});
  const [sort, setSort] = useState('hot');

  const toggleVote = (id) => setVoted((v) => ({ ...v, [id]: !v[id] }));
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'hot') return b.votes - a.votes;
    if (sort === 'new') return a.reportedAgo.localeCompare(b.reportedAgo);
    return 0;
  });

  return (
    <div className="grid grid-cols-[1fr_320px] gap-8 pt-7">
      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className={cx(eyebrow, 'mb-2.5')}
            >
              The feed · live
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_PUNCH, delay: 0.05 }}
              className={cx(display, 'm-0 text-[56px] font-semibold')}
            >
              What's <em className="italic text-[var(--signal)]">broken</em> today.
            </motion.h1>
          </div>
          <div className="relative flex gap-1.5 rounded-[10px] border border-[var(--line-2)] p-1">
            {sortOptions.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={cx(
                  'relative cursor-pointer appearance-none rounded-[7px] border-0 px-3.5 py-2 font-[var(--sans)] text-[13px] font-medium leading-none transition-colors duration-150',
                  sort === key ? 'text-[var(--bg)]' : 'bg-transparent text-[var(--text-mute)] hover:text-[var(--text)]',
                )}
              >
                {sort === key && (
                  <motion.span
                    layoutId="feed-sort-active"
                    className="absolute inset-0 rounded-[7px] bg-[var(--text)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = activeCat === category.key;
            return (
              <motion.button
                key={category.key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCat(category.key)}
                className={cx(
                  'relative flex cursor-pointer appearance-none items-center gap-[7px] rounded-full border px-3.5 py-2 font-[var(--sans)] text-[13px] font-medium leading-none transition-colors duration-150',
                  active
                    ? 'border-[var(--text)] text-[var(--bg)]'
                    : 'border-[var(--line-2)] bg-transparent text-[var(--text)]',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="feed-cat-active"
                    className="absolute inset-0 rounded-full bg-[var(--text)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{category.label}</span>
                <span className={`${mono} ${num} relative z-10 text-[10px] opacity-60`}>{category.count}</span>
              </motion.button>
            );
          })}
        </div>

        <StaggerGroup className="flex flex-col gap-[var(--gap)]" stagger={0.05}>
          <AnimatePresence mode="popLayout">
            {sorted.map((problem, i) => (
              <motion.div
                key={problem.id}
                layout
                variants={staggerItem}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ layout: { duration: 0.4, ease: EASE_OUT } }}
              >
                <ProblemCard
                  p={problem}
                  index={i + 1}
                  voted={!!voted[problem.id]}
                  onVote={() => toggleVote(problem.id)}
                  onOpen={() => goToProblem(problem.id)}
                  variant={tweaks.variant}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </StaggerGroup>
      </div>

      <aside className="flex flex-col gap-4 pt-[84px]">
        <WeeklyImpactCard />

        <RailCard title="Trending devs" eyebrow="Build" delay={0.25}>
          <StaggerGroup className="flex flex-col gap-3" stagger={0.06} delay={0.3}>
            {developers.slice(0, 4).map((dev) => (
              <motion.div key={dev.handle} variants={staggerItem} className="flex items-center gap-[11px]">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--steel)] font-[var(--sans)] text-xs font-semibold leading-none text-[var(--bone)]">
                  {dev.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium">
                    {dev.name}
                    {dev.age && (
                      <span className={`${mono} ml-1.5 text-[10px] font-semibold text-[var(--signal)]`}>
                        YOUTH
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-mute)]">{dev.focus}</div>
                </div>
                <div className={`${mono} ${num} text-[11px] text-[var(--text-mute)]`}>{dev.shipped} shipped</div>
              </motion.div>
            ))}
          </StaggerGroup>
        </RailCard>

        <RailCard title="The pledge" eyebrow="Read · 2 min" delay={0.35}>
          <p className="m-0 mb-3 text-[13px] leading-normal text-[var(--text-mute)]">
            We don't sell complaints. We don't sell attention. We sell time saved for people who want to fix
            things.
          </p>
          <a className="text-xs font-semibold text-[var(--signal)]">Read the manifesto →</a>
        </RailCard>
      </aside>
    </div>
  );
}

function WeeklyImpactCard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/users/jadak')
      .then((r) => r.json())
      .then((u) => { if (u.weeklyImpact) setItems(u.weeklyImpact); })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <RailCard title="Your weekly impact" eyebrow="Year One" delay={0.15}>
      <div className="grid grid-cols-2 gap-3.5">
        {items.map(({ value, label }) => (
          <div key={label}>
            <div className={cx(display, num, 'text-[28px] font-bold tracking-[-0.02em]')}>
              <CountUp value={value} duration={1.2} />
            </div>
            <div className="text-[11px] text-[var(--text-mute)]">{label}</div>
          </div>
        ))}
      </div>
    </RailCard>
  );
}

function RailCard({ title, eyebrow: eb, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
      className={cx(card, 'px-[var(--pad-x)] py-[var(--pad-y)]')}
    >
      <div className={cx(eyebrow, 'mb-1 text-[10px]')}>{eb}</div>
      <div className="mb-4 font-[var(--sans)] text-base font-semibold leading-[1.2] tracking-[-0.01em]">
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function ProblemCard({ p, index, voted, onVote, onOpen, variant }) {
  const minimal = variant === 'minimal';
  const liveVotes = p.votes + (voted ? 1 : 0);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="grid cursor-pointer grid-cols-[74px_1fr] gap-[18px] rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] px-[var(--pad-x)] py-[var(--pad-y)] transition-colors duration-150 hover:border-[var(--line-2)]"
      onClick={onOpen}
    >
      <motion.button
        whileTap={{ scale: 0.92 }}
        animate={voted ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={voted ? { duration: 0.35, ease: EASE_PUNCH } : { duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          onVote();
        }}
        className={cx(
          'flex min-h-[76px] cursor-pointer appearance-none flex-col items-center justify-center gap-1 rounded-xl border px-0 py-3 transition-colors duration-200',
          voted
            ? 'border-[var(--signal)] bg-[var(--signal)] text-[var(--signal-ink)]'
            : 'border-[var(--line-2)] bg-transparent text-[var(--text)]',
        )}
      >
        <motion.span animate={voted ? { y: [-2, 0] } : { y: 0 }} transition={{ duration: 0.3, ease: EASE_PUNCH }}>
          <Icon.Up />
        </motion.span>
        <span className={`${num} font-[var(--sans)] text-base font-bold leading-none tracking-[-0.02em]`}>
          <LiveNumber value={liveVotes} />
        </span>
      </motion.button>

      <div className="min-w-0">
        <div className="mb-2.5 flex items-center gap-2.5 text-[11px] text-[var(--text-mute)]">
          <span className={`${mono} font-semibold text-[var(--text)]`}>#{String(index).padStart(3, '0')}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-[var(--text-mute)]" />
          <span className="font-semibold text-[var(--text)]">{p.category}</span>
          <span className="inline-flex items-center gap-1">
            <Icon.Pin /> {p.location}
          </span>
          <span className={`${mono} ml-auto text-[var(--signal)]`}>{p.voteVelocity}</span>
        </div>

        <h3 className="m-0 mb-3 font-[var(--sans)] text-[22px] font-semibold leading-[1.22] tracking-[-0.02em] [text-wrap:pretty]">
          {p.title}
        </h3>

        {!minimal && (
          <div className="mb-3.5 flex items-start gap-2 rounded-[10px] border border-dashed border-[var(--line-2)] bg-[var(--surface-2)] px-3.5 py-3">
            <span className="mt-px shrink-0 text-[var(--signal)]">
              <Icon.Spark />
            </span>
            <div className="min-w-0">
              <div className={`${mono} mb-1 text-[10px] uppercase tracking-[0.1em] text-[var(--text-mute)]`}>
                AI summary · {p.duplicates} similar reports
              </div>
              <p className="m-0 text-[13px] leading-normal text-[var(--text)]">{p.ai}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-[var(--text-mute)]">
          <span>
            by <span className="font-medium text-[var(--text)]">@{p.reporter.handle}</span> · {p.reportedAgo}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon.Comment /> 24
          </span>
          <span
            className={cx(
              mono,
              'ml-auto font-semibold tracking-[0.04em]',
              p.solutionsCount > 0 ? 'text-[var(--signal)]' : 'text-[var(--text-mute)]',
            )}
          >
            {p.status.toUpperCase()}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function DetailScreen({ problem: p, problems, setView, goToProblem }) {
  const [voted, setVoted] = useState(false);
  const [solutions, setSolutions] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/solutions?problemId=${p.id}`).then((r) => r.json()),
      fetch(`/api/comments?problemId=${p.id}`).then((r) => r.json()),
    ])
      .then(([sols, comms]) => {
        setSolutions(sols);
        setComments(comms);
      })
      .catch(() => {});
  }, [p.id]);

  const others = problems.filter((x) => x.id !== p.id).slice(0, 3);
  const liveVotes = p.votes + (voted ? 1 : 0);

  return (
    <div className="mx-auto max-w-[1180px] pt-7">
      <motion.button
        whileHover={{ x: -3 }}
        onClick={() => setView('feed')}
        className="mb-6 flex cursor-pointer appearance-none items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] text-[var(--text-mute)] hover:text-[var(--text)]"
      >
        ← Back to feed
      </motion.button>

      <div className="grid grid-cols-[1fr_340px] gap-9">
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="mb-4 flex items-center gap-2.5 text-xs text-[var(--text-mute)]"
          >
            <span className={`${mono} rounded-full bg-[var(--signal)] px-[9px] py-1 text-[11px] font-bold tracking-[0.06em] text-[var(--signal-ink)]`}>
              {p.category.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon.Pin /> {p.location}
            </span>
            <span>·</span>
            <span>{p.reportedAgo}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_PUNCH, delay: 0.05 }}
            className={cx(display, 'm-0 mb-7 text-[clamp(36px,4.5vw,64px)] font-semibold')}
          >
            {p.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 }}
            className={cx(card, 'mb-7 rounded-[14px] p-7')}
          >
            <div className="mb-3.5 flex items-center gap-2">
              <span className="text-[var(--signal)]">
                <Icon.Spark />
              </span>
              <span className={`${mono} text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-mute)]`}>
                AI cluster · clusters {p.duplicates} similar reports
              </span>
            </div>
            <p className="m-0 font-[var(--sans)] text-[19px] font-normal leading-normal text-[var(--text)] [text-wrap:pretty]">
              {p.ai}
            </p>
            <StaggerGroup className="mt-[18px] flex flex-wrap gap-2" stagger={0.04} delay={0.4}>
              {p.tags.map((tag) => (
                <motion.span
                  key={tag}
                  variants={staggerItem}
                  className={`${mono} rounded-full bg-[var(--surface-2)] px-2.5 py-[5px] text-[11px] text-[var(--text-mute)]`}
                >
                  #{tag}
                </motion.span>
              ))}
            </StaggerGroup>
          </motion.div>

          <StaggerGroup className="mb-9 grid grid-cols-4 overflow-hidden rounded-[14px] border border-[var(--line)]" stagger={0.08} delay={0.2}>
            {[
              [p.affected, 'Affected'],
              [p.duplicates, 'Similar reports'],
              [p.solutionsCount, 'Builders working'],
              [p.voteVelocity.replace('+', ''), 'New this week'],
            ].map(([n, label], i) => (
              <motion.div
                key={label}
                variants={staggerItem}
                className={cx('bg-[var(--surface)] px-[22px] py-5', i < 3 && 'border-r border-[var(--line)]')}
              >
                <div className={cx(display, num, 'mb-1 text-[26px] font-bold tracking-[-0.02em]')}>
                  <CountUp value={n} duration={1.4} />
                </div>
                <div className={`${mono} text-[11px] uppercase tracking-[0.08em] text-[var(--text-mute)]`}>
                  {label}
                </div>
              </motion.div>
            ))}
          </StaggerGroup>

          <div className="mb-[18px] flex items-baseline justify-between">
            <h2 className={cx(display, 'm-0 text-[32px] font-semibold')}>
              Who's <em className="italic text-[var(--signal)]">building</em>
            </h2>
            <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={cx(ghostButton, 'px-3.5 py-[9px] text-[13px]')}>
              <Icon.Build /> Claim this problem
            </MotionButton>
          </div>

          {solutions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.3 }}
              className="rounded-[14px] border border-dashed border-[var(--line-2)] p-8 text-center text-[var(--text-mute)]"
            >
              <p className="m-0 mb-3.5 text-[15px]">No one has claimed this yet.</p>
              <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={signalButton}>
                Be the first <Icon.Arrow />
              </MotionButton>
            </motion.div>
          ) : (
            <StaggerGroup className="flex flex-col gap-3" stagger={0.08} delay={0.25}>
              {solutions.map((solution) => (
                <motion.div
                  key={solution.id}
                  variants={staggerItem}
                  whileHover={{ y: -3, borderColor: 'var(--line-2)' }}
                  className={cx(card, 'flex items-center gap-[18px] p-5')}
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-[var(--signal)] font-[var(--sans)] text-lg font-bold leading-none tracking-[-0.02em] text-[var(--signal-ink)]">
                    {solution.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2.5">
                      <span className="font-[var(--sans)] text-[17px] font-semibold leading-none tracking-[-0.01em]">
                        {solution.name}
                      </span>
                      <span className={`${mono} rounded-[5px] bg-[var(--surface-2)] px-[7px] py-[3px] text-[10px] tracking-[0.06em] text-[var(--text-mute)]`}>
                        {solution.stage.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[13px] text-[var(--text-mute)]">
                      {solution.summary} · {solution.team}
                    </div>
                  </div>
                  <div className={`${num} font-[var(--sans)] text-[22px] font-bold leading-none tracking-[-0.02em]`}>
                    <CountUp value={solution.supporters} duration={1.2} />
                  </div>
                  <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={cx(ghostButton, 'px-3.5 py-[9px] text-[13px]')}>
                    Support
                  </MotionButton>
                </motion.div>
              ))}
            </StaggerGroup>
          )}

          <h2 className={cx(display, 'm-0 mb-[18px] mt-12 text-[32px] font-semibold')}>
            Discussion · {comments.length} comments
          </h2>
          {comments.length > 0 ? (
            <StaggerGroup className="flex flex-col gap-3.5" stagger={0.08} delay={0.1}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  variants={staggerItem}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-[18px]"
                >
                  <div className="mb-2 flex justify-between text-xs text-[var(--text-mute)]">
                    <span className="font-semibold text-[var(--text)]">{comment.who}</span>
                    <span>{comment.when} ago</span>
                  </div>
                  <p className="m-0 text-sm leading-[1.55]">{comment.text}</p>
                </motion.div>
              ))}
            </StaggerGroup>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--line-2)] p-7 text-center text-[13px] text-[var(--text-mute)]">
              No comments yet — be the first.
            </div>
          )}
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.25 }}
          className="sticky top-[92px] flex flex-col gap-4 self-start"
        >
          <div className={cx(card, 'p-6')}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              animate={voted ? { scale: [1, 1.04, 1] } : {}}
              transition={voted ? { duration: 0.4, ease: EASE_PUNCH } : { type: 'spring', stiffness: 400, damping: 22 }}
              onClick={() => setVoted((v) => !v)}
              className={cx(
                'mb-3.5 flex w-full cursor-pointer appearance-none items-center justify-center gap-3 rounded-xl border-0 px-[18px] py-5 font-[var(--sans)] text-base font-bold tracking-[-0.01em] transition-colors duration-200',
                voted ? 'bg-[var(--signal)] text-[var(--signal-ink)]' : 'bg-[var(--text)] text-[var(--bg)]',
              )}
            >
              <Icon.Up />
              <AnimatePresence mode="wait">
                <motion.span
                  key={voted ? 'voted' : 'unvoted'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {voted ? 'Voted up' : 'Upvote this'}
                </motion.span>
              </AnimatePresence>
              · <LiveNumber value={liveVotes} />
            </motion.button>
            <div className="grid grid-cols-2 gap-2">
              <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={cx(ghostButton, 'justify-center px-0 py-[11px] text-[13px]')}>
                <Icon.Comment /> Comment
              </MotionButton>
              <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={cx(ghostButton, 'justify-center px-0 py-[11px] text-[13px]')}>
                <Icon.Share /> Share
              </MotionButton>
            </div>
          </div>

          <div className={cx(card, 'p-[22px]')}>
            <div className={cx(eyebrow, 'mb-3 text-[10px]')}>Reporter</div>
            <div className="mb-[18px] flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--steel)] font-[var(--sans)] text-sm font-semibold leading-none text-[var(--bone)]">
                {p.reporter.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-semibold">{p.reporter.name}</div>
                <div className="text-xs text-[var(--text-mute)]">@{p.reporter.handle}</div>
              </div>
            </div>
            <div className="mb-3.5 h-px bg-[var(--line)]" />
            <div className={cx(eyebrow, 'mb-2.5 text-[10px]')}>Status</div>
            <div className="mb-3.5 text-[13px] leading-normal">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--signal)] align-middle"
              />
              {p.status}
            </div>
          </div>

          <div className={cx(card, 'p-[22px]')}>
            <div className={cx(eyebrow, 'mb-3 text-[10px]')}>Related problems</div>
            <div className="flex flex-col gap-3">
              {others.map((other) => (
                <motion.div
                  key={other.id}
                  whileHover={{ x: 3 }}
                  onClick={() => goToProblem(other.id)}
                  className="cursor-pointer border-b border-[var(--line)] pb-3"
                >
                  <div className="mb-1.5 font-[var(--sans)] text-[13px] font-medium leading-[1.35]">
                    {other.title}
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--text-mute)]">
                    <span>{other.category}</span>
                    <span className={`${num} font-semibold text-[var(--signal)]`}>
                      {other.votes.toLocaleString()} ↑
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

function SubmitScreen({ setView, onPublish, submitCategories }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: '', cat: 'Local', loc: '', desc: '' });
  const [addingCategory, setAddingCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const selectCategory = (category) => {
    setAddingCategory(false);
    update('cat', category);
  };
  const updateCustomCategory = (value) => {
    setCustomCategory(value);
    update('cat', value || 'Local');
  };

  const cats = submitCategories.length > 0 ? submitCategories : [
    'Transit', 'Housing', 'Education', 'Digital', 'Local',
    'Healthcare', 'Safety', 'Environment', 'Jobs', 'Infrastructure',
  ];

  return (
    <div className="mx-auto max-w-[920px] pt-7">
      <div className={cx(eyebrow, 'mb-3.5')}>Report a problem</div>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_PUNCH }}
        className={cx(display, 'm-0 mb-4 text-[clamp(40px,5vw,64px)] font-semibold')}
      >
        Name what's
        <br />
        <em className="italic text-[var(--signal)]">broken.</em>
      </motion.h1>
      <p className="mb-9 max-w-[560px] text-base text-[var(--text-mute)]">
        Be specific. We'll cluster your report with similar ones automatically — every voice gets counted, you
        don't have to fight for visibility.
      </p>

      <div className="mb-7 flex gap-2.5">
        {submitSteps.map((n) => (
          <div key={n} className="relative h-1 flex-1 overflow-hidden rounded bg-[var(--line-2)]">
            <motion.div
              initial={false}
              animate={{ scaleX: n <= step ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              style={{ originX: 0 }}
              className="absolute inset-0 rounded bg-[var(--signal)]"
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
        >
          {step === 1 && (
            <StaggerGroup className="flex flex-col gap-6" stagger={0.07}>
              <motion.div variants={staggerItem}>
                <Field label="In one sentence, what's broken?" hint="Be specific. Numbers help.">
                  <motion.input
                    whileFocus={{ borderColor: 'var(--text)' }}
                    transition={{ duration: 0.15 }}
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="e.g. Bus 21 has been late or cancelled 1 in 3 days for 6 months"
                    className={inputClass}
                  />
                </Field>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Field label="Category">
                  <div className="flex flex-wrap gap-2">
                    {cats.map((category) => {
                      const active = form.cat === category && !addingCategory;
                      return (
                        <motion.button
                          key={category}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => selectCategory(category)}
                          className={cx(
                            'relative cursor-pointer appearance-none rounded-full border px-4 py-2.5 font-[var(--sans)] text-[13px] font-medium leading-none transition-colors duration-150',
                            active
                              ? 'border-[var(--text)] text-[var(--bg)]'
                              : 'border-[var(--line-2)] bg-transparent text-[var(--text)]',
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="submit-cat-pill"
                              className="absolute inset-0 rounded-full bg-[var(--text)]"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            />
                          )}
                          <span className="relative z-10">{category}</span>
                        </motion.button>
                      );
                    })}
                    <motion.button
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setAddingCategory(true);
                        if (customCategory) update('cat', customCategory);
                      }}
                      className={cx(
                        'relative cursor-pointer appearance-none rounded-full border px-4 py-2.5 font-[var(--sans)] text-[13px] font-medium leading-none transition-colors duration-150',
                        addingCategory
                          ? 'border-[var(--text)] text-[var(--bg)]'
                          : 'border-dashed border-[var(--line-2)] bg-transparent text-[var(--text)]',
                      )}
                    >
                      {addingCategory && (
                        <motion.span
                          layoutId="submit-cat-pill"
                          className="absolute inset-0 rounded-full bg-[var(--text)]"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <motion.span
                        className="relative z-10 inline-block"
                        animate={addingCategory ? { rotate: 45 } : { rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        style={{ transformOrigin: 'center' }}
                      >
                        +
                      </motion.span>
                      <span className="relative z-10 ml-1">
                        {addingCategory ? 'Cancel' : 'New Category'}
                      </span>
                    </motion.button>
                  </div>
                  <AnimatePresence initial={false}>
                    {addingCategory && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, y: -8 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -8 }}
                        transition={{ duration: 0.26, ease: EASE_OUT }}
                        className="overflow-hidden"
                      >
                        <motion.input
                          whileFocus={{ borderColor: 'var(--text)' }}
                          transition={{ duration: 0.15 }}
                          value={customCategory}
                          onChange={(e) => updateCustomCategory(e.target.value)}
                          placeholder="Type a category name"
                          className={cx(inputClass, 'mt-3')}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Field>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Field label="Where?" hint="Address, neighborhood, or 'citywide'">
                  <motion.input
                    whileFocus={{ borderColor: 'var(--text)' }}
                    transition={{ duration: 0.15 }}
                    value={form.loc}
                    onChange={(e) => update('loc', e.target.value)}
                    placeholder="e.g. East 14th corridor, Oakland"
                    className={inputClass}
                  />
                </Field>
              </motion.div>
            </StaggerGroup>
          )}

          {step === 2 && (
            <StaggerGroup className="flex flex-col gap-6" stagger={0.08}>
              <motion.div variants={staggerItem}>
                <Field label="Tell us more" hint="What's happening, who's affected, how often. Skip the rant — we want the facts.">
                  <motion.textarea
                    whileFocus={{ borderColor: 'var(--text)' }}
                    transition={{ duration: 0.15 }}
                    value={form.desc}
                    onChange={(e) => update('desc', e.target.value)}
                    rows={7}
                    placeholder="Since November, the 7:14am bus has missed its stop most weekday mornings. ~80 of us at this stop. We've called AC Transit ~30 times..."
                    className={cx(inputClass, 'resize-y leading-normal')}
                  />
                </Field>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Field label="Add evidence (optional)">
                  <motion.div
                    whileHover={{ borderColor: 'var(--text-mute)', y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="rounded-xl border border-dashed border-[var(--line-2)] p-7 text-center text-[var(--text-mute)]"
                  >
                    <div className="text-[13px]">Drop photos, screenshots, ticket numbers, FOIA responses</div>
                    <MotionButton
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                      className={cx(ghostButton, 'mt-3 px-3.5 py-[9px] text-[13px]')}
                    >
                      + Add file
                    </MotionButton>
                  </motion.div>
                </Field>
              </motion.div>
            </StaggerGroup>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_PUNCH }}
              className={cx(card, 'p-7')}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className={cx(eyebrow, 'mb-3')}
              >
                Preview · this is what people will see
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: EASE_OUT }}
                className="m-0 mb-3.5 font-[var(--sans)] text-2xl font-semibold leading-[1.2] tracking-[-0.02em]"
              >
                {form.title || 'Your problem title here'}
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.4, ease: EASE_OUT }}
                className="mb-3.5 text-xs text-[var(--text-mute)]"
              >
                {form.cat} · {form.loc || 'location'} · just now
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.4, ease: EASE_OUT }}
                className="m-0 border-t border-[var(--line)] pt-3.5 text-sm text-[var(--text-mute)]"
              >
                {form.desc || 'Your description here.'}
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-9 flex justify-between">
        <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={ghostButton} onClick={() => (step > 1 ? setStep(step - 1) : setView('feed'))}>
          {step === 1 ? 'Cancel' : '← Back'}
        </MotionButton>
        {step < 3 ? (
          <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={signalButton} onClick={() => setStep(step + 1)}>
            Continue <Icon.Arrow />
          </MotionButton>
        ) : (
          <MotionButton
            whileHover={buttonHover}
            whileTap={buttonTap}
            className={signalButton}
            onClick={() => onPublish(form)}
          >
            Publish report <Icon.Arrow />
          </MotionButton>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block font-[var(--sans)] text-[13px] font-semibold leading-[1.2]">{label}</label>
      {hint && <div className="mb-2.5 text-xs text-[var(--text-mute)]">{hint}</div>}
      {children}
    </div>
  );
}

function HubScreen({ problems, solutions, stats, goToProblem }) {
  const [tab, setTab] = useState('claimable');
  const shippedCount = stats?.solutionsLaunched ?? 318;
  const hubTabs = [
    ['claimable', 'Claimable now', problems.filter((p) => p.solutionsCount === 0).length],
    ['active', 'Active solutions', solutions.length],
    ['shipped', 'Shipped', shippedCount],
  ];

  return (
    <div className="mx-auto max-w-[1180px] pt-7">
      <div className={cx(eyebrow, 'mb-3.5')}>Developer + builder hub</div>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_PUNCH }}
        className={cx(display, 'm-0 mb-[18px] text-[clamp(48px,6vw,80px)] font-semibold')}
      >
        Build the things
        <br />
        <em className="italic text-[var(--signal)]">people asked for.</em>
      </motion.h1>
      <p className="mb-9 max-w-[600px] text-[17px] text-[var(--text-mute)]">
        Every problem here has upvotes from real people. Pick one with the right shape for you, post a plan,
        and ship in public.
      </p>

      <div className="relative mb-7 flex border-b border-[var(--line)]">
        {hubTabs.map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cx(
              'relative flex cursor-pointer appearance-none items-center gap-2 border-0 bg-transparent px-[22px] py-3.5 font-[var(--sans)] text-sm font-semibold leading-none transition-colors duration-150',
              tab === key ? 'text-[var(--text)]' : 'text-[var(--text-mute)] hover:text-[var(--text)]',
            )}
          >
            {tab === key && (
              <motion.span
                layoutId="hub-tab-active"
                className="absolute inset-x-0 -bottom-px h-[2px] bg-[var(--signal)]"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            {label}
            <span className={`${mono} ${num} text-[11px] opacity-60`}>{count}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          {tab === 'claimable' && (
            <StaggerGroup className="grid grid-cols-2 gap-4" stagger={0.06}>
              {problems
                .filter((problem) => problem.solutionsCount === 0)
                .map((problem) => (
                  <motion.div
                    key={problem.id}
                    variants={staggerItem}
                    whileHover={{ y: -4, borderColor: 'var(--line-2)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={cx(card, 'cursor-pointer p-6')}
                    onClick={() => goToProblem(problem.id)}
                  >
                    <div className={`${mono} mb-3 text-[11px] tracking-[0.08em] text-[var(--text-mute)]`}>
                      {problem.category.toUpperCase()} · {problem.location.toUpperCase()}
                    </div>
                    <h3 className="m-0 mb-4 font-[var(--sans)] text-[22px] font-semibold leading-[1.18] tracking-[-0.02em]">
                      {problem.title}
                    </h3>
                    <div className="mb-4 flex items-baseline gap-[18px]">
                      <div>
                        <div className={cx(display, num, 'text-[30px] font-bold tracking-[-0.03em]')}>
                          <CountUp value={problem.votes.toLocaleString()} duration={1.4} />
                        </div>
                        <div className="text-[11px] text-[var(--text-mute)]">upvotes</div>
                      </div>
                      <div>
                        <div className={cx(display, num, 'text-[30px] font-bold tracking-[-0.03em]')}>
                          <CountUp value={problem.duplicates} duration={1.2} />
                        </div>
                        <div className="text-[11px] text-[var(--text-mute)]">similar reports</div>
                      </div>
                      <div className="ml-auto">
                        <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={cx(signalButton, 'px-3.5 py-2.5 text-[13px]')}>
                          Claim <Icon.Arrow />
                        </MotionButton>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.map((tag) => (
                        <span key={tag} className={`${mono} rounded-full bg-[var(--surface-2)] px-[9px] py-1 text-[11px] text-[var(--text-mute)]`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </StaggerGroup>
          )}

          {tab === 'active' && (
            <StaggerGroup className="flex flex-col gap-3" stagger={0.06}>
              {solutions.map((solution) => {
                const prob = problems.find((problem) => problem.id === solution.problemId);
                return (
                  <motion.div
                    key={solution.id}
                    variants={staggerItem}
                    whileHover={{ y: -2 }}
                    className={cx(card, 'flex items-center gap-[18px] p-6')}
                  >
                    <motion.div
                      whileHover={{ rotate: -4, scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--signal)] font-[var(--sans)] text-[22px] font-bold leading-none text-[var(--signal-ink)]"
                    >
                      {solution.name[0]}
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2.5">
                        <span className="font-[var(--sans)] text-[19px] font-bold leading-none tracking-[-0.02em]">
                          {solution.name}
                        </span>
                        <span className={`${mono} rounded-[5px] bg-[var(--surface-2)] px-[7px] py-[3px] text-[10px] tracking-[0.06em] text-[var(--text-mute)]`}>
                          {solution.stage.toUpperCase()}
                        </span>
                        <span className="text-xs text-[var(--text-mute)]">· {solution.team}</span>
                      </div>
                      <div className="mb-1.5 text-sm text-[var(--text-mute)]">{solution.summary}</div>
                      {prob && (
                        <div onClick={() => goToProblem(prob.id)} className="cursor-pointer text-xs text-[var(--signal)]">
                          Solving: {prob.title}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`${num} font-[var(--sans)] text-[26px] font-bold leading-none tracking-[-0.02em]`}>
                        <CountUp value={solution.supporters} duration={1.4} />
                      </div>
                      <div className="text-[11px] text-[var(--text-mute)]">supporters</div>
                    </div>
                  </motion.div>
                );
              })}
            </StaggerGroup>
          )}

          {tab === 'shipped' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="rounded-[14px] border border-dashed border-[var(--line-2)] p-[60px] text-center text-[var(--text-mute)]"
            >
              <CountUp value={shippedCount} duration={1.6} className="font-bold text-[var(--text)]" /> solutions shipped this year. View archive coming soon.
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProfileScreen({ goToProblem, setView }) {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [userProblem, setUserProblem] = useState(null);

  const handle = session?.user?.handle || 'jadak';

  useEffect(() => {
    fetch(`/api/users/${handle}`)
      .then((r) => r.json())
      .then((u) => {
        setUser(u);
        if (u.reportedProblemIds?.length) {
          fetch(`/api/problems/${u.reportedProblemIds[0]}`)
            .then((r) => r.json())
            .then(setUserProblem)
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [handle]);

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className={`${mono} text-sm text-[var(--text-mute)]`}
        >
          Loading profile…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] pt-7">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="mb-9 flex items-center gap-6"
      >
        <motion.div
          initial={{ scale: 0.6, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          whileHover={{ rotate: 6, scale: 1.05 }}
          className="grid h-24 w-24 cursor-pointer place-items-center rounded-full bg-[linear-gradient(135deg,#FFD60A,#FF4D2E)] font-[var(--sans)] text-[38px] font-bold leading-none tracking-[-0.02em] text-[#0D1B2A]"
        >
          {user.initials}
        </motion.div>
        <div>
          <div className={cx(eyebrow, 'mb-2')}>You · @{user.handle}</div>
          <h1 className={cx(display, 'm-0 text-[56px] font-semibold')}>{user.name}</h1>
          <div className="mt-2 text-sm text-[var(--text-mute)]">
            {user.joinedLabel} · {user.location} · {user.bio}
          </div>
        </div>
        <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={cx(ghostButton, 'ml-auto')}>
          Edit profile
        </MotionButton>
      </motion.div>

      <StaggerGroup
        className="mb-9 grid grid-cols-5 overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--surface)]"
        stagger={0.07}
        delay={0.2}
      >
        {user.profileImpact.map(({ value, label }, i) => (
          <motion.div
            key={label}
            variants={staggerItem}
            className={cx('px-[22px] py-6', i < 4 && 'border-r border-[var(--line)]')}
          >
            <div className={cx(display, num, 'text-4xl font-bold tracking-[-0.03em]', i === 3 ? 'text-[var(--signal)]' : 'text-[var(--text)]')}>
              <CountUp value={value} duration={1.5} />
            </div>
            <div className="mt-1 text-xs text-[var(--text-mute)]">{label}</div>
          </motion.div>
        ))}
      </StaggerGroup>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className={cx(display, 'm-0 mb-4 text-[26px] font-semibold')}>Your reports</h2>
          <StaggerGroup className="flex flex-col gap-2.5" stagger={0.08} delay={0.3}>
            {userProblem && (
              <motion.div
                key={userProblem.id}
                variants={staggerItem}
                whileHover={{ y: -2, borderColor: 'var(--line-2)' }}
                className={cx(card, 'cursor-pointer p-[18px]')}
                onClick={() => goToProblem(userProblem.id)}
              >
                <div className="mb-2 font-[var(--sans)] text-base font-semibold leading-[1.3]">{userProblem.title}</div>
                <div className="flex gap-3.5 text-xs text-[var(--text-mute)]">
                  <span>{userProblem.category}</span>
                  <span className={`${num} font-semibold text-[var(--signal)]`}>
                    {userProblem.votes.toLocaleString()} ↑
                  </span>
                  <span>{userProblem.solutionsCount} building</span>
                </div>
              </motion.div>
            )}
            <MotionButton
              whileHover={buttonHover}
              whileTap={buttonTap}
              className={cx(ghostButton, 'justify-center')}
              onClick={() => setView('submit')}
            >
              <Icon.Plus /> Report another problem
            </MotionButton>
          </StaggerGroup>
        </div>

        <div>
          <h2 className={cx(display, 'm-0 mb-4 text-[26px] font-semibold')}>Recent activity</h2>
          <StaggerGroup className="flex flex-col gap-3" stagger={0.06} delay={0.35}>
            {user.recentActivity.map(({ action, what, when }, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ x: 4 }}
                className="flex gap-3 border-b border-[var(--line)] py-3"
              >
                <div className={`${mono} min-w-[70px] pt-0.5 text-[11px] tracking-[0.06em] text-[var(--signal)]`}>
                  {action.toUpperCase()}
                </div>
                <div className="flex-1 text-[13px] leading-[1.4]">{what}</div>
                <div className="whitespace-nowrap text-[11px] text-[var(--text-mute)]">{when}</div>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </div>
  );
}
