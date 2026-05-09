'use client'
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, useInView, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { OH_DATA } from './data';
import { Icon } from './icons';

// web-landing.jsx — Bold/activist marketing page for OverHaul (animated)

const shell = 'bg-[var(--bg)] text-[var(--text)]';
const container = 'mx-auto max-w-[1280px]';
const display =
  'font-[var(--sans)] font-semibold leading-[0.92] tracking-[-0.035em] [text-wrap:balance]';
const eyebrow =
  'font-[var(--mono)] text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-[var(--text-mute)]';
const mono = 'font-[var(--mono)]';
const num = '[font-variant-numeric:tabular-nums]';
const signalButton =
  'inline-flex cursor-pointer appearance-none items-center gap-2 rounded-[10px] border-0 bg-[var(--signal)] font-[var(--sans)] text-sm font-semibold leading-none tracking-[-0.005em] text-[var(--signal-ink)] transition-[transform,background,color] duration-150 hover:bg-[#FFE54B] active:translate-y-px';
const ghostButton =
  'inline-flex cursor-pointer appearance-none items-center gap-2 rounded-[10px] border border-[var(--line-2)] bg-transparent px-[18px] py-[13px] font-[var(--sans)] text-sm font-semibold leading-none tracking-[-0.005em] text-[var(--text)] transition-[transform,border-color,color] duration-150 hover:border-[var(--text)] active:translate-y-px';

const signalMapStats = [
  ['Transit', '+312', 'text-[var(--signal)]'],
  ['Housing', '+1.2k', 'text-[#FF4D2E]'],
  ['Youth', '87', 'text-[#2DD4BF]'],
  ['Open data', '318', 'text-[#A78BFA]'],
];

const trendingItems = [
  ['+1.2k', "Affordable housing waitlist hasn't moved in 11 months"],
  ['+540', 'Night-shift workers have nowhere for their kids after 7pm'],
  ['+312', 'Bus 21 missed schedule 1 in 3 days · 6 months running'],
  ['+208', 'School laptops blocking Khan Academy + Wikipedia'],
  ['+91', 'Maple Ave streetlights out since March'],
];

const steps = [
  {
    n: '01',
    h: 'Report it.',
    s: 'Drop a problem in 30 seconds. Photo, location, context. AI clusters duplicates so the signal stays clean.',
  },
  {
    n: '02',
    h: 'Vote it up.',
    s: 'Communities upvote what hurts most. The feed sorts by hurt, not by drama.',
  },
  {
    n: '03',
    h: 'Builders claim.',
    s: 'Developers, students, civic teams pick problems by upvote. They post a plan in public.',
  },
  {
    n: '04',
    h: 'It gets shipped.',
    s: 'Solutions launch with the community. We track outcomes — fixed, partially fixed, ignored.',
  },
];

const scoreboard = [
  ['12,847', 'Problems reported'],
  ['318', 'Solutions launched'],
  ['1,204', 'Devs building'],
  ['87', 'Youth teams'],
];

const devCards = [
  {
    t: 'TransitTruth',
    sub: '@kaiwong + 3',
    stage: 'BETA · 240 testers',
    up: 612,
    milestone: 'Ship',
    className: 'left-0 top-0 z-10',
    rotate: -1.2,
  },
  {
    t: 'WaitlistOpen',
    sub: '@priya + 5',
    stage: 'PROTOTYPE',
    up: 1240,
    milestone: 'Build',
    className: 'left-9 top-9 z-[9]',
    rotate: 0,
  },
  {
    t: 'CityLedger',
    sub: '@devhub',
    stage: 'BETA',
    up: 320,
    milestone: 'Plan',
    className: 'left-[72px] top-[72px] z-[8]',
    rotate: 1.2,
  },
];

const youthStats = [
  ['87', 'Active youth teams'],
  ['142', 'Projects shipped'],
  ['1,260', 'Members 13–17'],
  ['62', 'Adult mentors'],
];

// ——————————————————————————————————————————————
// Animation primitives
// ——————————————————————————————————————————————

const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_PUNCH = [0.16, 1, 0.3, 1];

// Reveal a block when it enters the viewport
function Reveal({ children, delay = 0, y = 32, className, as: Tag = 'div', once = true, amount = 0.3 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount });
  const MotionTag = motion[Tag] || motion.div;
  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </MotionTag>
  );
}

// Stagger children when the parent enters the viewport
function StaggerGroup({ children, className, stagger = 0.08, delay = 0, amount = 0.2, once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

// Animated number that counts up from 0 when in view, preserving formatting
function CountUp({ value, duration = 1.6, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(typeof value === 'string' ? value.replace(/\d/g, '0') : '0');

  useEffect(() => {
    if (!inView) return;
    const str = String(value);
    // Extract numeric portion (handles "1.2k", "12,847", "+312", "$1,000")
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

// Magnetic-ish hover scale wrapper for buttons
const MotionButton = motion.button;
const buttonHover = { scale: 1.03 };
const buttonTap = { scale: 0.97 };

export function LandingPage({ onEnter }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);
  const D = OH_DATA;

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!avatarOpen) return;
    const handler = (e) => { if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [avatarOpen]);

  // Subtle parallax on the hero signal map
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroMapY = useTransform(heroScroll, [0, 1], [0, -60]);
  const heroHeadlineY = useTransform(heroScroll, [0, 1], [0, 40]);

  return (
    <div className={shell}>
      {/* Top nav */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="sticky top-0 z-50 border-b border-[var(--line)] [background:color-mix(in_srgb,var(--bg)_78%,transparent)] [backdrop-filter:blur(20px)_saturate(180%)] [-webkit-backdrop-filter:blur(20px)_saturate(180%)]"
      >
        <div className="flex items-center justify-center border-b border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 font-[var(--mono)] text-[10px] uppercase tracking-[0.08em] text-[var(--text-mute)] sm:justify-between sm:px-6 sm:text-[11px] lg:px-10">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-[oh-pulse_2s_ease-in-out_infinite] rounded-full bg-[var(--signal)] shadow-[0_0_0_3px_rgba(255,214,10,0.2),0_0_12px_var(--signal)]" />
            <span>Live · 12,847 problems · 318 solutions shipped</span>
          </div>
          <div className="hidden gap-[18px] sm:flex">
            <span>EN</span>
            <span className="text-[var(--text)]">Los Angeles ↗</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-10 lg:px-10">
          <a href="/" className="flex items-center gap-3 text-[var(--text)] no-underline">
            <motion.div
              whileHover={{ rotate: 6, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="h-[34px] w-[34px]"
            > 
              <img src="/LogoWithBackground.jpeg" alt="OverHaul" className="h-full w-full object-contain rounded-sm" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="font-[var(--sans)] text-xl font-bold tracking-[-0.025em]">OverHaul</span>
              <span className={`${mono} mt-1 text-[9px] uppercase tracking-[0.18em] text-[var(--text-mute)]`}>
                civic platform · v0.4
              </span>
            </div>
          </a>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5 lg:col-start-3">
            <MotionButton
              whileHover={buttonHover}
              whileTap={buttonTap}
              aria-label="Search problems"
              className="hidden min-w-[200px] cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--text-mute)] transition-colors duration-150 hover:border-[var(--text-mute)] md:flex"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="flex-1 text-left">Search problems…</span>
              <kbd className={`${mono} rounded border border-[var(--line)] bg-[var(--bg)] px-1.5 py-0.5 text-[10px] text-[var(--text-mute)]`}>
                ⌘K
              </kbd>
            </MotionButton>

            {session ? (
              <div ref={avatarRef} className="relative">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  onClick={() => setAvatarOpen((o) => !o)}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-[var(--line)] bg-[linear-gradient(135deg,#FFD60A,#FF4D2E)] text-sm font-bold text-[#0D1B2A]"
                >
                  {session.user?.initials || session.user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                </motion.div>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 z-50"
                    >
                      <div className={`${mono} rounded-[10px] border border-[var(--line)] bg-[var(--surface)] py-1 shadow-lg`}>
                        {session.user?.name && (
                          <div className="border-b border-[var(--line)] px-4 py-2 text-[12px] text-[var(--text-mute)]">
                            {session.user.name}
                          </div>
                        )}
                        <button
                          onClick={() => { setAvatarOpen(false); router.push('/problems'); }}
                          className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap border-0 bg-transparent px-4 py-2 text-left text-[13px] text-[var(--text)] hover:bg-[var(--surface-2)]"
                        >
                          Go to feed
                        </button>
                        <div className="mx-3 my-1 h-px bg-[var(--line)]" />
                        <button
                          onClick={() => { setAvatarOpen(false); signOut({ callbackUrl: '/' }); }}
                          className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap border-0 bg-transparent px-4 py-2 text-left text-[13px] text-[#FF4D2E] hover:bg-[var(--surface-2)]"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <MotionButton
                whileHover={buttonHover}
                whileTap={buttonTap}
                className={`${ghostButton} px-3 py-[9px] text-[13px] sm:px-3.5 sm:text-[15px]`}
                onClick={() => router.push('/auth/signin')}
              >
                Sign in
              </MotionButton>
            )}

            <MotionButton
              whileHover={buttonHover}
              whileTap={buttonTap}
              className={`${signalButton} px-3 py-2.5 text-[13px] text-[#0D1B2A] shadow-[0_8px_24px_rgba(255,214,10,0.25),inset_0_-2px_0_rgba(0,0,0,0.12)] sm:px-4`}
              onClick={() => router.push('/problems')}
            >
              <span className="hidden sm:inline">Open the platform</span><span className="sm:hidden">Open</span> <Icon.Arrow />
            </MotionButton>
          </div>
        </div>
      </motion.header>

      <section ref={heroRef} className="relative px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-10 lg:pt-20">
        <div className={container}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
            className={`${eyebrow} mb-7`}
          >
            <span className="text-[var(--signal)]">⬤</span> Live · 12,847 problems reported this year
          </motion.div>

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-12">
            <motion.div style={{ y: heroHeadlineY }}>
              <h1 className={`${display} m-0 text-[clamp(72px,10vw,150px)] font-semibold tracking-[-0.045em]`}>
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_PUNCH, delay: 0.1 }}
                >
                  Don't
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_PUNCH, delay: 0.2 }}
                >
                  complain.
                </motion.span>
                <motion.span
                  className="block font-medium italic text-[var(--signal)] [text-shadow:0_16px_60px_rgba(255,214,10,0.22)]"
                  initial={{ opacity: 0, y: 60, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.9, ease: EASE_PUNCH, delay: 0.35 }}
                >
                  OverHaul.
                </motion.span>
              </h1>
            </motion.div>

            <motion.div
              aria-hidden="true"
              style={{ y: heroMapY }}
              initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: EASE_OUT, delay: 0.5 }}
              className="relative min-h-[360px] overflow-hidden rounded-[20px] border border-white/15 bg-[rgba(255,214,10,0.6)] shadow-[0_34px_100px_rgba(0,0,0,0.38),0_0_80px_rgba(255,214,10,0.13)] sm:min-h-[430px] sm:rounded-[28px]"
            >
              <div className="absolute inset-3 grid grid-rows-[auto_1fr_auto] rounded-[16px] bg-[rgba(7,17,28,0.82)] p-4 text-[#E0E1DD] [backdrop-filter:blur(16px)_saturate(160%)] sm:inset-[18px] sm:rounded-[20px] sm:p-6">
                <div className={`${mono} text-xs uppercase tracking-[0.14em] text-[var(--signal)]`}>
                  Civic signal map
                </div>
                <motion.div
                  className="grid grid-cols-2 gap-2 self-center sm:gap-3"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } },
                  }}
                >
                  {signalMapStats.map(([label, value, colorClass]) => (
                    <motion.div
                      key={label}
                      variants={staggerItem}
                      whileHover={{ y: -3, scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="rounded-[14px] border border-white/10 bg-white/10 p-3 sm:p-4"
                    >
                      <div className={`${mono} ${colorClass} text-[22px] font-bold sm:text-[26px]`}>
                        <CountUp value={value} duration={1.4} />
                      </div>
                      <div className="mt-1.5 text-[12px] text-[rgba(224,225,221,0.7)] sm:text-[13px]">{label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.7 }}
            className="mt-[42px] grid grid-cols-1 items-end gap-6 lg:grid-cols-2 lg:gap-[60px]"
          >
            <p className="m-0 max-w-[520px] font-[var(--sans)] text-[22px] font-normal leading-[1.35] text-[var(--text)] [text-wrap:pretty]">
              A civic platform where communities{' '}
              <em className="italic text-[var(--signal)]">name</em> what's broken, vote on what matters,
              and hand it to people who can actually fix it. Then watch it get fixed.
            </p>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <MotionButton
                whileHover={buttonHover}
                whileTap={buttonTap}
                className={`${signalButton} px-[22px] py-4 text-[15px] text-[#0D1B2A] shadow-[0_12px_32px_rgba(255,214,10,0.24)]`}
                onClick={() => router.push('/problems')}
              >
                Open the platform <Icon.Arrow />
              </MotionButton>
              <MotionButton whileHover={buttonHover} whileTap={buttonTap} className={`${ghostButton} px-[22px] py-4 text-[15px]`}>
                Report a problem
              </MotionButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live ticker */}
      <Reveal y={20} className="mt-[60px] overflow-hidden border-y border-[var(--line)] bg-[var(--surface)]">
        <div className={`${mono} flex items-center whitespace-nowrap p-0 text-[13px]`}>
          <div className="flex shrink-0 items-center gap-2 bg-[var(--signal)] px-[22px] py-3.5 font-bold tracking-[0.06em] text-[var(--signal-ink)]">
            <Icon.Bolt /> TRENDING NOW
          </div>
          <div className="relative flex-1 overflow-hidden">
            <motion.div
              className="flex gap-9 px-7 py-3.5"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
            >
              {[...trendingItems, ...trendingItems].map(([v, t], i) => (
                <span key={`${t}-${i}`} className="text-[var(--text)] shrink-0">
                  <span className="mr-2.5 font-bold text-[var(--signal)]">{v}</span>
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </Reveal>

      {/* How it works */}
      <section className="px-4 py-20 sm:px-6 lg:px-10 lg:py-[120px]">
        <div className={container}>
          <Reveal className={`${eyebrow} mb-6`}>How it works</Reveal>
          <Reveal delay={0.1}>
            <h2 className={`${display} m-0 mb-20 max-w-[1100px] text-[clamp(44px,6vw,84px)]`}>
              Four steps from{' '}
              <em className="italic text-[var(--signal)]">"someone should fix this"</em> to someone fixing it.
            </h2>
          </Reveal>

          <StaggerGroup className="grid grid-cols-1 border-t border-[var(--line-2)] sm:grid-cols-2 lg:grid-cols-4" stagger={0.12}>
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`px-0 pt-8 sm:px-5 lg:px-7 lg:pt-10 ${i < steps.length - 1 ? 'lg:border-r lg:border-[var(--line)]' : ''}`}
              >
                <div className={`${mono} ${num} mb-9 text-[13px] tracking-[0.05em] text-[var(--signal)]`}>
                  {step.n}
                </div>
                <h3 className={`${display} m-0 mb-3.5 text-[38px] font-semibold`}>{step.h}</h3>
                <p className="m-0 max-w-[280px] font-[var(--sans)] text-[15px] font-normal leading-normal text-[var(--text-mute)]">
                  {step.s}
                </p>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Stats slab */}
      <section className="bg-[var(--signal)] px-4 py-16 text-[var(--signal-ink)] sm:px-6 lg:px-10 lg:py-20">
        <div className={container}>
          <Reveal className={`${mono} mb-[30px] text-xs font-medium uppercase leading-none tracking-[0.18em] opacity-65`}>
            Year one · public scoreboard
          </Reveal>
          <StaggerGroup className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {scoreboard.map(([n, label]) => (
              <motion.div key={label} variants={staggerItem} className="border-t-2 border-[var(--signal-ink)] pt-[18px]">
                <div className={`${display} ${num} text-[clamp(56px,7vw,96px)] font-bold tracking-[-0.04em]`}>
                  <CountUp value={n} duration={1.8} />
                </div>
                <div className="mt-1.5 text-sm font-medium">{label}</div>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      

      {/* For developers */}
      <section className="border-y border-[var(--line)] bg-[var(--bg-2)] px-4 py-20 sm:px-6 lg:px-10 lg:py-[120px]">
        <div className={`${container} grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
          <div>
            <Reveal className={`${eyebrow} mb-6`}>For developers + builders</Reveal>
            <Reveal delay={0.08}>
              <h2 className={`${display} m-0 mb-7 text-[clamp(44px,5.5vw,76px)]`}>
                Stop building
                <br />
                <em className="italic text-[var(--signal)]">another todo app.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="m-0 mb-9 max-w-[460px] font-[var(--sans)] text-lg font-normal leading-normal text-[var(--text-mute)]">
                Browse problems sorted by upvote — real demand, real users waiting. Claim one, post a plan,
                ship in public. Get visibility from the community that asked for it.
              </p>
            </Reveal>
          </div>

          <StaggerGroup className="relative min-h-[360px] sm:min-h-[380px]" stagger={0.15} amount={0.3}>
            {devCards.map((card, i) => (
              <motion.div
                key={card.t}
                variants={{
                  hidden: { opacity: 0, y: 40, rotate: card.rotate * 3, scale: 0.95 },
                  show: {
                    opacity: 1,
                    y: 0,
                    rotate: card.rotate,
                    scale: 1,
                    transition: { duration: 0.7, ease: EASE_PUNCH },
                  },
                }}
                whileHover={{ y: -8, rotate: 0, scale: 1.02, zIndex: 20, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className={`absolute w-[calc(100%-90px)] rounded-[14px] border border-[var(--line-2)] bg-[var(--surface)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:w-[calc(100%-72px)] sm:p-6 ${card.className}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-[var(--sans)] text-[22px] font-bold leading-none tracking-[-0.02em]">
                      {card.t}
                    </div>
                    <div className="mt-1.5 text-xs text-[var(--text-mute)]">{card.sub}</div>
                  </div>
                  <span className={`${mono} rounded-full bg-[var(--signal)] px-[9px] py-[5px] text-[10px] font-bold text-[var(--signal-ink)]`}>
                    {card.stage}
                  </span>
                </div>
                <div className="mt-7 flex gap-5 border-t border-[var(--line)] pt-[18px]">
                  <div>
                    <div className={`${num} font-[var(--sans)] text-2xl font-bold leading-none`}>
                      <CountUp value={card.up} duration={1.4} />
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-mute)]">supporters</div>
                  </div>
                  <div>
                    <div className={`${num} font-[var(--sans)] text-2xl font-bold leading-none text-[var(--signal)]`}>
                      {card.milestone}
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-mute)]">next milestone</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Youth strip */}
      <section className="px-4 py-20 sm:px-6 lg:px-10 lg:py-[120px]">
        <div className={container}>
          <Reveal className={`${eyebrow} mb-6`}>Youth Innovator Program</Reveal>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <Reveal delay={0.08}>
              <h2 className={`${display} m-0 text-[clamp(44px,5.5vw,84px)]`}>
                We made room
                <br />
                for the kids who
                <br />
                <em className="italic text-[var(--signal)]">actually do something.</em>
              </h2>
            </Reveal>
            <div>
              <Reveal delay={0.16}>
                <p className="m-0 mb-[30px] font-[var(--sans)] text-lg font-normal leading-normal text-[var(--text-mute)]">
                  Under-18 builders get a moderated workspace, mentor pairing, a parent-visible dashboard,
                  and a path to actually ship the thing.
                </p>
              </Reveal>
              <StaggerGroup className="grid grid-cols-2 gap-4" stagger={0.08} delay={0.24}>
                {youthStats.map(([n, label]) => (
                  <motion.div
                    key={label}
                    variants={staggerItem}
                    whileHover={{ y: -3, borderColor: 'var(--text)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="rounded-xl border border-[var(--line-2)] p-[18px]"
                  >
                    <div className={`${display} ${num} text-4xl font-bold tracking-[-0.03em]`}>
                      <CountUp value={n} duration={1.5} />
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-mute)]">{label}</div>
                  </motion.div>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--text)] px-4 py-20 text-left text-[var(--bg)] sm:px-6 lg:px-10 lg:py-[120px]">
        <div className={container}>
          <Reveal y={48}>
            <h2 className={`${display} m-0 mb-10 text-[clamp(64px,10vw,156px)] font-semibold`}>
              Spot something
              <br />
              <motion.em
                className="italic text-[var(--signal)] inline-block"
                initial={{ rotate: -3 }}
                whileInView={{ rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
              >
                broken?
              </motion.em>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-wrap items-center gap-3.5">
              <MotionButton
                whileHover={{ scale: 1.05, boxShadow: '0 16px 40px rgba(255,214,10,0.4)' }}
                whileTap={buttonTap}
                className={`${signalButton} px-7 py-5 text-[17px]`}
                onClick={() => router.push('/problems')}
              >
                Report it now <Icon.Arrow />
              </MotionButton>
              <span className={`${mono} text-sm text-[var(--text-mute)] sm:ml-3`}>
                30 seconds · no account needed to start
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] p-4 sm:p-6 lg:p-10">
        <div className={`${container} flex flex-wrap items-center justify-between gap-4`}>
          <div className="font-[var(--sans)] text-[17px] font-semibold leading-none tracking-[-0.02em]">
            OverHaul ·{' '}
            <span className="font-normal text-[var(--text-mute)]">Don't complain. OverHaul.</span>
          </div>
          <div className={`${mono} flex flex-wrap gap-4 text-xs text-[var(--text-mute)] sm:gap-6`}>
            <span>STATUS · ALL SYSTEMS GO</span>
            <span>v0.4.1</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
