import { OH_DATA } from './data';
import { Icon } from './icons';

// web-landing.jsx — Bold/activist marketing page for OverHaul

export function LandingPage({ onEnter, theme }) {
  const dark = theme === 'dark';
  const D = OH_DATA;
  const signal = '#FFD60A';
  const coral = '#FF4D2E';
  const civicBlue = '#2DD4BF';

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Top nav ─────────────────────────────────────────────────── */}
{/* ── Top nav ─────────────────────────────────────────────────── */}
<header style={{
  position: 'sticky', top: 0, zIndex: 50,
  background: 'color-mix(in srgb, var(--bg) 78%, transparent)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderBottom: '1px solid var(--line)',
}}>
  {/* live status strip — sits above the nav, signals the platform is alive */}
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '6px 40px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--line)',
    fontFamily: 'var(--mono)', fontSize: 11,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--text-mute)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: signal,
        boxShadow: `0 0 0 3px ${signal}33, 0 0 12px ${signal}`,
        animation: 'oh-pulse 2s ease-in-out infinite',
      }} />
      <span>Live · 12,847 problems · 318 solutions shipped</span>
    </div>
    <div style={{ display: 'flex', gap: 18 }}>
      <span>EN</span>
      <span style={{ color: 'var(--text)' }}>Los Angeles ↗</span>
    </div>
  </div>

  {/* main nav row */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    padding: '14px 40px',
    gap: 40,
  }}>
    {/* Wordmark */}
    <a href="#" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      textDecoration: 'none', color: 'var(--text)',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: signal,
        display: 'grid', placeItems: 'center',
        boxShadow: `0 0 0 1px ${signal}, 0 8px 22px rgba(255,214,10,0.25)`,
        transform: 'rotate(-6deg)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 18V8l7 7 7-7v10" stroke="#0D1B2A" strokeWidth="2.8"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          font: '700 20px/1 var(--sans)',
          letterSpacing: '-0.025em',
        }}>OverHaul</span>
        <span className="mono" style={{
          fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--text-mute)', marginTop: 4,
        }}>civic platform · v0.4</span>
      </div>
    </a>

    {/* Center nav — pill-style, with counters */}
    <nav style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: 2,
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 999,
      padding: 4,
      justifySelf: 'center',
    }}>
      {[
        { label: 'Problems', count: '12.8k', active: true },
        { label: 'Solutions', count: '318' },
        { label: 'Developers', count: '1.2k' },
        { label: 'Youth', count: '87' },
        { label: 'Manifesto' },
      ].map((item) => (
        <a key={item.label} href="#" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px',
          borderRadius: 999,
          fontSize: 13, fontWeight: 500,
          color: item.active ? 'var(--text)' : 'var(--text-mute)',
          background: item.active ? 'var(--bg)' : 'transparent',
          boxShadow: item.active ? '0 1px 2px rgba(0,0,0,0.08), inset 0 0 0 1px var(--line)' : 'none',
          textDecoration: 'none',
          transition: 'color .15s ease, background .15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!item.active) e.currentTarget.style.color = 'var(--text)';
        }}
        onMouseLeave={(e) => {
          if (!item.active) e.currentTarget.style.color = 'var(--text-mute)';
        }}>
          {item.label}
          {item.count && (
            <span className="mono" style={{
              fontSize: 10, letterSpacing: '0.04em',
              color: item.active ? signal : 'var(--text-mute)',
              fontWeight: 600,
              opacity: item.active ? 1 : 0.7,
            }}>
              {item.count}
            </span>
          )}
        </a>
      ))}
    </nav>

    {/* Right cluster */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* search affordance — hint at the breadth of content */}
      <button aria-label="Search problems" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px 8px 12px',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        color: 'var(--text-mute)',
        fontSize: 13,
        cursor: 'pointer',
        minWidth: 200,
        transition: 'border-color .15s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-mute)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line)'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{ flex: 1, textAlign: 'left' }}>Search problems…</span>
        <kbd className="mono" style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 4,
          background: 'var(--bg)', border: '1px solid var(--line)',
          color: 'var(--text-mute)',
        }}>⌘K</kbd>
      </button>

      <button className="btn btn-ghost" style={{
        padding: '9px 14px', fontSize: 15,
      }}>
        Sign in
      </button>

      <button className="btn btn-signal" onClick={onEnter}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                background: signal,
                color: '#0D1B2A',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(255,214,10,0.25), inset 0 -2px 0 rgba(0,0,0,0.12)',
              }}>
        Open the platform <Icon.Arrow />
      </button>
    </div>
  </div>
</header>

      <section style={{ padding: '80px 40px 40px', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 28 }}>
            <span style={{ color: signal }}>⬤</span> Live · 12,847 problems reported this year
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)',
            gap: 48,
            alignItems: 'center',
          }}>
            <div>
              <h1 className="display" style={{
                fontSize: 'clamp(72px, 10vw, 150px)',
                margin: 0, fontWeight: 600,
                letterSpacing: '-0.045em',
              }}>
                Don't<br/>complain.
                <span style={{
                  display: 'block',
                  color: signal,
                  fontStyle: 'italic',
                  fontWeight: 500,
                  textShadow: '0 16px 60px rgba(255,214,10,0.22)',
                }}>OverHaul.</span>
              </h1>
            </div>

            <div aria-hidden="true" style={{
              borderRadius: 28,
              overflow: 'hidden',
              minHeight: 430,
              background: 'rgba(255,214,10,0.6)',
                
              boxShadow: '0 34px 100px rgba(0,0,0,0.38), 0 0 80px rgba(255,214,10,0.13)',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.14)',
            }}>
              <div style={{
                position: 'absolute',
                inset: 18,
                borderRadius: 20,
                background: 'rgba(7,17,28,0.82)',
                color: '#E0E1DD',
                padding: 24,
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto',
                backdropFilter: 'blur(16px) saturate(160%)',
              }}>
                <div className="mono" style={{
                  color: signal,
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}>
                  Civic signal map
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  alignSelf: 'center',
                }}>
                  {[
                    ['Transit', '+312', signal],
                    ['Housing', '+1.2k', coral],
                    ['Youth', '87', civicBlue],
                    ['Open data', '318', '#A78BFA'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 14,
                      padding: 16,
                    }}>
                      <div className="mono" style={{ color, fontSize: 26, fontWeight: 700 }}>
                        {value}
                      </div>
                      <div style={{ color: 'rgba(224,225,221,0.7)', fontSize: 13, marginTop: 6 }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
            marginTop: 42, alignItems: 'end',
          }}>
            <p style={{
              font: '400 22px/1.35 var(--sans)', maxWidth: 520, margin: 0,
              color: 'var(--text)', textWrap: 'pretty',
            }}>
              A civic platform where communities <em style={{ color: 'var(--signal)', fontStyle: 'italic' }}>name</em> what's
              broken, vote on what matters, and hand it to people who can actually fix it.
              Then watch it get fixed.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-signal" onClick={onEnter}
                      style={{
                        padding: '16px 22px',
                        fontSize: 15,
                        background: signal,
                        color: '#0D1B2A',
                        boxShadow: '0 12px 32px rgba(255,214,10,0.24)',
                      }}>
                Open the platform <Icon.Arrow />
              </button>
              <button className="btn btn-ghost"
                      style={{ padding: '16px 22px', fontSize: 15 }}>
                Report a problem
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live ticker ────────────────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
        background: 'var(--surface)', overflow: 'hidden',
        marginTop: 60,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          padding: 0, fontSize: 13, fontFamily: 'var(--mono)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            background: 'var(--signal)', color: 'var(--signal-ink)',
            padding: '14px 22px', fontWeight: 700, letterSpacing: '0.06em',
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <Icon.Bolt /> TRENDING NOW
          </div>
          <div style={{ display: 'flex', gap: 36, padding: '14px 28px', overflow: 'hidden' }}>
            {[
              ['+1.2k', 'Affordable housing waitlist hasn\'t moved in 11 months'],
              ['+540', 'Night-shift workers have nowhere for their kids after 7pm'],
              ['+312', 'Bus 21 missed schedule 1 in 3 days · 6 months running'],
              ['+208', 'School laptops blocking Khan Academy + Wikipedia'],
              ['+91', 'Maple Ave streetlights out since March'],
            ].map(([v, t]) => (
              <span key={t} style={{ color: 'var(--text)' }}>
                <span style={{ color: 'var(--signal)', fontWeight: 700, marginRight: 10 }}>{v}</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>How it works</div>
          <h2 className="display" style={{
            fontSize: 'clamp(44px, 6vw, 84px)', margin: 0, marginBottom: 80,
            maxWidth: 1100,
          }}>
            Four steps from <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>"someone should fix this"</em> to someone fixing it.
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
            borderTop: '1px solid var(--line-2)',
          }}>
            {[
              { n: '01', h: 'Report it.', s: 'Drop a problem in 30 seconds. Photo, location, context. AI clusters duplicates so the signal stays clean.' },
              { n: '02', h: 'Vote it up.', s: 'Communities upvote what hurts most. The feed sorts by hurt, not by drama.' },
              { n: '03', h: 'Builders claim.', s: 'Developers, students, civic teams pick problems by upvote. They post a plan in public.' },
              { n: '04', h: 'It gets shipped.', s: 'Solutions launch with the community. We track outcomes — fixed, partially fixed, ignored.' },
            ].map((s, i) => (
              <div key={s.n} style={{
                padding: '40px 28px 0',
                borderRight: i < 3 ? '1px solid var(--line)' : 'none',
              }}>
                <div className="mono num" style={{
                  fontSize: 13, color: 'var(--signal)', marginBottom: 36, letterSpacing: '0.05em',
                }}>{s.n}</div>
                <h3 className="display" style={{
                  fontSize: 38, margin: 0, marginBottom: 14, fontWeight: 600,
                }}>{s.h}</h3>
                <p style={{
                  font: '400 15px/1.5 var(--sans)', color: 'var(--text-mute)',
                  margin: 0, maxWidth: 280,
                }}>{s.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats slab ─────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--signal)', color: 'var(--signal-ink)',
        padding: '80px 40px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            font: '500 12px/1 var(--mono)', letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: 30, opacity: 0.65,
          }}>
            Year one · public scoreboard
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30,
          }}>
            {[
              ['12,847', 'Problems reported'],
              ['318', 'Solutions launched'],
              ['1,204', 'Devs building'],
              ['87', 'Youth teams'],
            ].map(([n, l]) => (
              <div key={l} style={{ borderTop: '2px solid var(--signal-ink)', paddingTop: 18 }}>
                <div className="display num" style={{
                  fontSize: 'clamp(56px, 7vw, 96px)', fontWeight: 700, letterSpacing: '-0.04em',
                }}>{n}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's broken right now ────────────────────────────────── */}
      <section style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: 40, marginBottom: 56, flexWrap: 'wrap',
          }}>
            <h2 className="display" style={{
              fontSize: 'clamp(44px, 6vw, 84px)', margin: 0,
              maxWidth: 800,
            }}>
              What's <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>broken</em><br/>right now.
            </h2>
            <button className="btn btn-ghost" onClick={onEnter}>
              See all 12,847 <Icon.Arrow />
            </button>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          }}>
            {D.problems.slice(0, 6).map(p => (
              <article key={p.id} onClick={onEnter} style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 14, padding: 24, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', minHeight: 260,
                transition: 'border-color .15s ease, transform .15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line)'}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 18,
                }}>
                  <span className="mono" style={{
                    fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-mute)',
                    textTransform: 'uppercase',
                  }}>{p.category} · {p.location}</span>
                  <span style={{
                    fontSize: 11, color: 'var(--signal)', fontWeight: 600,
                  }}>{p.voteVelocity}</span>
                </div>
                <h3 style={{
                  font: '600 22px/1.18 var(--sans)', letterSpacing: '-0.02em',
                  margin: 0, flex: 1, textWrap: 'balance',
                }}>{p.title}</h3>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', marginTop: 24,
                  paddingTop: 18, borderTop: '1px solid var(--line)',
                }}>
                  <div>
                    <div className="display num" style={{
                      fontSize: 36, fontWeight: 700, lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}>{p.votes.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>
                      upvotes · {p.affected}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--mono)',
                    color: p.solutionsCount > 0 ? 'var(--signal)' : 'var(--text-mute)',
                  }}>
                    {p.solutionsCount > 0 ? `${p.solutionsCount} BUILDING` : 'UNCLAIMED'}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── For developers ─────────────────────────────────────────── */}
      <section style={{
        padding: '120px 40px',
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid',
                      gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 24 }}>For developers + builders</div>
            <h2 className="display" style={{
              fontSize: 'clamp(44px, 5.5vw, 76px)', margin: 0, marginBottom: 28,
            }}>
              Stop building<br/>
              <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>another todo app.</em>
            </h2>
            <p style={{
              font: '400 18px/1.5 var(--sans)', color: 'var(--text-mute)',
              margin: 0, marginBottom: 36, maxWidth: 460,
            }}>
              Browse problems sorted by upvote — real demand, real users waiting.
              Claim one, post a plan, ship in public. Get visibility from the
              community that asked for it.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-signal">
                Browse the dev hub <Icon.Arrow />
              </button>
              <button className="btn btn-ghost">
                See trending devs
              </button>
            </div>
          </div>

          {/* Right: stylized card stack */}
          <div style={{ position: 'relative', minHeight: 380 }}>
            {[
              { t: 'TransitTruth', sub: '@kaiwong + 3', stage: 'BETA · 240 testers', up: 612, off: 0 },
              { t: 'WaitlistOpen', sub: '@priya + 5', stage: 'PROTOTYPE', up: 1240, off: 1 },
              { t: 'CityLedger', sub: '@devhub', stage: 'BETA', up: 320, off: 2 },
            ].map((c, i) => (
              <div key={c.t} style={{
                position: 'absolute', left: i * 36, top: i * 36,
                width: 'calc(100% - 72px)',
                background: 'var(--surface)', border: '1px solid var(--line-2)',
                borderRadius: 14, padding: 24,
                boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                zIndex: 10 - i,
                transform: `rotate(${(i - 1) * 1.2}deg)`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ font: '700 22px/1 var(--sans)', letterSpacing: '-0.02em' }}>
                      {c.t}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 6 }}>{c.sub}</div>
                  </div>
                  <span className="mono" style={{
                    fontSize: 10, padding: '5px 9px', borderRadius: 999,
                    background: 'var(--signal)', color: 'var(--signal-ink)', fontWeight: 700,
                  }}>{c.stage}</span>
                </div>
                <div style={{
                  display: 'flex', gap: 20, marginTop: 28, paddingTop: 18,
                  borderTop: '1px solid var(--line)',
                }}>
                  <div>
                    <div className="num" style={{ font: '700 24px/1 var(--sans)' }}>{c.up}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>supporters</div>
                  </div>
                  <div>
                    <div className="num" style={{ font: '700 24px/1 var(--sans)', color: 'var(--signal)' }}>
                      {['Ship', 'Build', 'Plan'][c.off]}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>next milestone</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Youth strip ────────────────────────────────────────────── */}
      <section style={{ padding: '120px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 24 }}>Youth Innovator Program</div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'start',
          }}>
            <h2 className="display" style={{
              fontSize: 'clamp(44px, 5.5vw, 84px)', margin: 0,
            }}>
              We made room<br/>
              for the kids who<br/>
              <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>actually do something.</em>
            </h2>
            <div>
              <p style={{
                font: '400 18px/1.5 var(--sans)', color: 'var(--text-mute)',
                margin: 0, marginBottom: 30,
              }}>
                Under-18 builders get a moderated workspace, mentor pairing, a parent-visible
                dashboard, and a path to actually ship the thing.
              </p>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
              }}>
                {[
                  ['87', 'Active youth teams'],
                  ['142', 'Projects shipped'],
                  ['1,260', 'Members 13–17'],
                  ['62', 'Adult mentors'],
                ].map(([n, l]) => (
                  <div key={l} style={{
                    padding: 18, border: '1px solid var(--line-2)', borderRadius: 12,
                  }}>
                    <div className="display num" style={{
                      fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em',
                    }}>{n}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--text)', color: 'var(--bg)',
        padding: '120px 40px', textAlign: 'left',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 className="display" style={{
            fontSize: 'clamp(64px, 10vw, 156px)',
            margin: 0, marginBottom: 40, fontWeight: 600,
          }}>
            Spot something<br/>
            <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>broken?</em>
          </h2>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-signal" onClick={onEnter}
                    style={{ padding: '20px 28px', fontSize: 17 }}>
              Report it now <Icon.Arrow />
            </button>
            <span style={{
              fontSize: 14, color: 'var(--text-mute)', marginLeft: 12,
              fontFamily: 'var(--mono)',
            }}>30 seconds · no account needed to start</span>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{ padding: '40px', borderTop: '1px solid var(--line)' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ font: '600 17px/1 var(--sans)', letterSpacing: '-0.02em' }}>
            OverHaul · <span style={{ color: 'var(--text-mute)', fontWeight: 400 }}>
              Don't complain. OverHaul.
            </span>
          </div>
          <div style={{
            display: 'flex', gap: 24, fontSize: 12,
            color: 'var(--text-mute)', fontFamily: 'var(--mono)',
          }}>
            <span>STATUS · ALL SYSTEMS GO</span>
            <span>v0.4.1</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
