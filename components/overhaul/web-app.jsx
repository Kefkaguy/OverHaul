import { useState } from 'react';
import { OH_DATA } from './data';
import { Icon } from './icons';
import { LandingPage } from './web-landing';

// web-app.jsx — App shell + Feed + Detail + Submit + Hub + Profile

export function WebApp({ view, setView, activeProblemId, goToProblem, tweaks, theme }) {
  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('feed')} theme={theme} />;
  }
  return (
    <AppShell view={view} setView={setView}
              activeProblemId={activeProblemId}
              goToProblem={goToProblem}
              tweaks={tweaks} theme={theme} />
  );
}
// ─────────────────────────────────────────────────────────────────────────
// AppShell — sidebar + topbar + screen routing
// ─────────────────────────────────────────────────────────────────────────
function AppShell({ view, setView, activeProblemId, goToProblem, tweaks }) {
  const D = OH_DATA;
  const activeProblem = D.problems.find(p => p.id === activeProblemId) || D.problems[0];
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '240px 1fr',
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)',
    }}>
      <Sidebar view={view} setView={setView} />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar search={search} setSearch={setSearch} setView={setView} />
        <main style={{ flex: 1, padding: '0 36px 60px', minWidth: 0 }}>
          {view === 'feed' && (
            <FeedScreen activeCat={activeCat} setActiveCat={setActiveCat}
                        goToProblem={goToProblem} tweaks={tweaks} />
          )}
          {view === 'detail' && (
            <DetailScreen problem={activeProblem} setView={setView}
                          goToProblem={goToProblem} />
          )}
          {view === 'submit' && <SubmitScreen setView={setView} />}
          {view === 'hub' && <HubScreen goToProblem={goToProblem} />}
          {view === 'profile' && <ProfileScreen goToProblem={goToProblem} setView={setView} />}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────
function Sidebar({ view, setView }) {
  const items = [
    { k: 'feed',    label: 'Feed',    icon: <Icon.Home /> },
    { k: 'hub',     label: 'Build',   icon: <Icon.Hammer /> },
    { k: 'profile', label: 'You',     icon: <Icon.User /> },
  ];

  return (
    <aside style={{
      borderRight: '1px solid var(--line)',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      padding: '22px 16px',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      <div onClick={() => setView('landing')} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 8px', cursor: 'pointer', marginBottom: 28,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: 'var(--signal)',
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 18V8l7 7 7-7v10" stroke="#0D1B2A" strokeWidth="2.6"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ font: '600 17px/1 var(--sans)', letterSpacing: '-0.02em' }}>OverHaul</span>
      </div>

      <button className="btn btn-signal" onClick={() => setView('submit')}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 18,
                       padding: '13px 16px', fontSize: 14 }}>
        <Icon.Plus /> Report a problem
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const active = view === it.k || (it.k === 'feed' && view === 'detail');
          return (
            <button key={it.k} onClick={() => setView(it.k)} style={{
              appearance: 'none', border: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 9, textAlign: 'left',
              font: '500 14px/1 var(--sans)',
              background: active ? 'var(--surface-2)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text-mute)',
            }}>
              {it.icon} {it.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 28, padding: '0 12px' }}>
        <div className="eyebrow" style={{ marginBottom: 12, fontSize: 10 }}>Trending tags</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {['transit', 'housing', 'youth', 'open-data', 'safety'].map(t => (
            <span key={t} style={{
              fontSize: 11, padding: '4px 9px', borderRadius: 999,
              border: '1px solid var(--line-2)', color: 'var(--text-mute)',
              fontFamily: 'var(--mono)',
            }}>#{t}</span>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ marginTop: 'auto', padding: '0 12px',
                    fontSize: 11, color: 'var(--text-mute)', fontFamily: 'var(--mono)',
                    letterSpacing: '0.04em' }}>
        v0.4.1 · ALL SYSTEMS GO
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────────────────────────────────
function TopBar({ search, setSearch, setView }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '20px 36px', borderBottom: '1px solid var(--line)',
      background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{
        flex: 1, maxWidth: 540,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 10,
        background: 'var(--surface)', border: '1px solid var(--line)',
      }}>
        <span style={{ color: 'var(--text-mute)' }}><Icon.Search /></span>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
               placeholder="Search problems, solutions, tags..."
               style={{
                 border: 0, background: 'transparent', outline: 'none',
                 color: 'var(--text)', fontSize: 14, fontFamily: 'var(--sans)',
                 width: '100%',
               }}/>
        <span className="mono" style={{
          fontSize: 11, padding: '3px 7px', borderRadius: 5,
          border: '1px solid var(--line-2)', color: 'var(--text-mute)',
        }}>⌘K</span>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-ghost" style={{ padding: '9px 12px', fontSize: 13 }}>
        <Icon.Bell />
      </button>
      <div onClick={() => setView('profile')} style={{
        width: 36, height: 36, borderRadius: 999,
        background: 'linear-gradient(135deg, #FFD60A, #FF4D2E)',
        color: '#0D1B2A', fontWeight: 700, fontSize: 14,
        display: 'grid', placeItems: 'center', cursor: 'pointer',
        border: '2px solid var(--bg)',
      }}>JK</div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Feed Screen
// ─────────────────────────────────────────────────────────────────────────
function FeedScreen({ activeCat, setActiveCat, goToProblem, tweaks }) {
  const D = OH_DATA;
  const filtered = activeCat === 'all'
    ? D.problems
    : D.problems.filter(p => p.category === activeCat);

  const [voted, setVoted] = useState({});
  const toggleVote = (id) => setVoted(v => ({ ...v, [id]: !v[id] }));
  const [sort, setSort] = useState('hot');
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'hot')   return b.votes - a.votes;
    if (sort === 'new')   return a.reportedAgo.localeCompare(b.reportedAgo);
    return 0;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, paddingTop: 28 }}>
      <div style={{ minWidth: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>The feed · live</div>
            <h1 className="display" style={{
              fontSize: 56, margin: 0, fontWeight: 600,
            }}>
              What's <em style={{ color: 'var(--signal)', fontStyle: 'italic' }}>broken</em> today.
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 10,
                        border: '1px solid var(--line-2)' }}>
            {[
              ['hot', 'Most upvoted'],
              ['new', 'Newest'],
              ['near', 'Near me'],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setSort(k)} style={{
                appearance: 'none', border: 0, cursor: 'pointer',
                padding: '8px 14px', borderRadius: 7,
                font: '500 13px/1 var(--sans)',
                background: sort === k ? 'var(--text)' : 'transparent',
                color: sort === k ? 'var(--bg)' : 'var(--text-mute)',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Category chips */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
        }}>
          {D.categories.map(c => {
            const active = activeCat === c.key;
            return (
              <button key={c.key} onClick={() => setActiveCat(c.key)} style={{
                appearance: 'none', cursor: 'pointer',
                padding: '8px 14px', borderRadius: 999,
                border: '1px solid ' + (active ? 'var(--text)' : 'var(--line-2)'),
                background: active ? 'var(--text)' : 'transparent',
                color: active ? 'var(--bg)' : 'var(--text)',
                font: '500 13px/1 var(--sans)',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                {c.label}
                <span className="mono num" style={{
                  fontSize: 10, opacity: 0.6,
                }}>{c.count}</span>
              </button>
            );
          })}
        </div>

        {/* Problem list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          {sorted.map((p, i) => (
            <ProblemCard key={p.id} p={p} index={i + 1}
                         voted={!!voted[p.id]}
                         onVote={() => toggleVote(p.id)}
                         onOpen={() => goToProblem(p.id)}
                         variant={tweaks.variant} />
          ))}
        </div>
      </div>

      {/* Right rail */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 84 }}>
        <RailCard title="Your weekly impact" eyebrow="Year One">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['12', 'votes'], ['3', 'reports'], ['1', 'fixed'], ['+24', 'rep']].map(([n, l]) => (
              <div key={l}>
                <div className="display num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{l}</div>
              </div>
            ))}
          </div>
        </RailCard>

        <RailCard title="Trending devs" eyebrow="Build">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OH_DATA.trendingDevs.slice(0, 4).map(d => (
              <div key={d.handle} style={{
                display: 'flex', alignItems: 'center', gap: 11,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: 'var(--steel)', color: 'var(--bone)',
                  display: 'grid', placeItems: 'center',
                  font: '600 12px/1 var(--sans)',
                }}>{d.name.split(' ').map(n => n[0]).join('')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {d.name}
                    {d.age && <span style={{
                      fontSize: 10, marginLeft: 6, color: 'var(--signal)',
                      fontFamily: 'var(--mono)', fontWeight: 600,
                    }}>YOUTH</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{d.focus}</div>
                </div>
                <div className="mono num" style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                  {d.shipped} shipped
                </div>
              </div>
            ))}
          </div>
        </RailCard>

        <RailCard title="The pledge" eyebrow="Read · 2 min">
          <p style={{
            fontSize: 13, lineHeight: 1.5, color: 'var(--text-mute)', margin: 0,
            marginBottom: 12,
          }}>
            We don't sell complaints. We don't sell attention. We sell time saved
            for people who want to fix things.
          </p>
          <a style={{ fontSize: 12, color: 'var(--signal)', fontWeight: 600 }}>
            Read the manifesto →
          </a>
        </RailCard>
      </aside>
    </div>
  );
}

function RailCard({ title, eyebrow, children }) {
  return (
    <div className="card" style={{ padding: 'var(--pad-y) var(--pad-x)' }}>
      <div className="eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>{eyebrow}</div>
      <div style={{ font: '600 16px/1.2 var(--sans)', marginBottom: 16, letterSpacing: '-0.01em' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ProblemCard (used in feed)
// ─────────────────────────────────────────────────────────────────────────
function ProblemCard({ p, index, voted, onVote, onOpen, variant }) {
  const minimal = variant === 'minimal';
  return (
    <article style={{
      display: 'grid',
      gridTemplateColumns: '74px 1fr',
      gap: 18,
      padding: 'var(--pad-y) var(--pad-x)',
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      transition: 'border-color .15s ease',
    }}
    onClick={onOpen}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--line-2)'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line)'}>

      {/* Vote pill */}
      <button onClick={(e) => { e.stopPropagation(); onVote(); }} style={{
        appearance: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 4,
        background: voted ? 'var(--signal)' : 'transparent',
        color: voted ? 'var(--signal-ink)' : 'var(--text)',
        border: '1px solid ' + (voted ? 'var(--signal)' : 'var(--line-2)'),
        borderRadius: 12, padding: '12px 0', minHeight: 76,
        transition: 'all .15s ease',
      }}>
        <Icon.Up />
        <span className="num" style={{
          font: '700 16px/1 var(--sans)', letterSpacing: '-0.02em',
        }}>{(p.votes + (voted ? 1 : 0)).toLocaleString()}</span>
      </button>

      {/* Body */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10,
          fontSize: 11, color: 'var(--text-mute)',
        }}>
          <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>
            #{String(index).padStart(3, '0')}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-mute)' }}/>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{p.category}</span>
          <span><Icon.Pin /> {p.location}</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', color: 'var(--signal)' }}>
            {p.voteVelocity}
          </span>
        </div>

        <h3 style={{
          font: '600 22px/1.22 var(--sans)', letterSpacing: '-0.02em',
          margin: 0, marginBottom: 12, textWrap: 'pretty',
        }}>{p.title}</h3>

        {!minimal && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '12px 14px', background: 'var(--surface-2)',
            borderRadius: 10, border: '1px dashed var(--line-2)',
            marginBottom: 14,
          }}>
            <span style={{ color: 'var(--signal)', flexShrink: 0, marginTop: 1 }}>
              <Icon.Spark />
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="mono" style={{
                fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-mute)',
                marginBottom: 4, textTransform: 'uppercase',
              }}>AI summary · {p.duplicates} similar reports</div>
              <p style={{
                margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--text)',
              }}>{p.ai}</p>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex', gap: 16, alignItems: 'center',
          fontSize: 12, color: 'var(--text-mute)',
        }}>
          <span>by <span style={{ color: 'var(--text)', fontWeight: 500 }}>@{p.reporter.handle}</span> · {p.reportedAgo}</span>
          <span><Icon.Comment /> 24</span>
          <span style={{
            marginLeft: 'auto',
            color: p.solutionsCount > 0 ? 'var(--signal)' : 'var(--text-mute)',
            fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: '0.04em',
          }}>
            {p.status.toUpperCase()}
          </span>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Detail Screen
// ─────────────────────────────────────────────────────────────────────────
function DetailScreen({ problem: p, setView, goToProblem }) {
  const D = OH_DATA;
  const [voted, setVoted] = useState(false);
  const sols = D.solutions.filter(s => s.problemId === p.id);
  const others = D.problems.filter(x => x.id !== p.id).slice(0, 3);

  return (
    <div style={{ paddingTop: 28, maxWidth: 1180, margin: '0 auto' }}>
      <button onClick={() => setView('feed')} style={{
        appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
        color: 'var(--text-mute)', fontSize: 13, marginBottom: 24, padding: 0,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        ← Back to feed
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16,
            fontSize: 12, color: 'var(--text-mute)',
          }}>
            <span style={{
              padding: '4px 9px', borderRadius: 999,
              background: 'var(--signal)', color: 'var(--signal-ink)',
              fontWeight: 700, fontSize: 11, fontFamily: 'var(--mono)',
              letterSpacing: '0.06em',
            }}>{p.category.toUpperCase()}</span>
            <span><Icon.Pin /> {p.location}</span>
            <span>·</span>
            <span>{p.reportedAgo}</span>
          </div>

          <h1 className="display" style={{
            fontSize: 'clamp(36px, 4.5vw, 64px)', margin: 0, marginBottom: 28,
            fontWeight: 600, textWrap: 'balance',
          }}>{p.title}</h1>

          {/* Big AI summary slab */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 14, padding: 28, marginBottom: 28,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            }}>
              <span style={{ color: 'var(--signal)' }}><Icon.Spark /></span>
              <span className="mono" style={{
                fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--text-mute)', fontWeight: 600,
              }}>
                AI cluster · clusters {p.duplicates} similar reports
              </span>
            </div>
            <p style={{
              font: '400 19px/1.5 var(--sans)', margin: 0, color: 'var(--text)',
              textWrap: 'pretty',
            }}>{p.ai}</p>
            <div style={{
              display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap',
            }}>
              {p.tags.map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: '5px 10px', borderRadius: 999,
                  background: 'var(--surface-2)', color: 'var(--text-mute)',
                  fontFamily: 'var(--mono)',
                }}>#{t}</span>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
            border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden',
            marginBottom: 36,
          }}>
            {[
              [p.affected, 'Affected'],
              [p.duplicates, 'Similar reports'],
              [p.solutionsCount, 'Builders working'],
              [p.voteVelocity.replace('+', ''), 'New this week'],
            ].map(([n, l], i) => (
              <div key={l} style={{
                padding: '20px 22px',
                borderRight: i < 3 ? '1px solid var(--line)' : 'none',
                background: 'var(--surface)',
              }}>
                <div className="display num" style={{
                  fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em',
                  marginBottom: 4,
                }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)',
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                              fontFamily: 'var(--mono)' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Solutions section */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 18,
          }}>
            <h2 className="display" style={{
              fontSize: 32, margin: 0, fontWeight: 600,
            }}>
              Who's <em style={{ color: 'var(--signal)', fontStyle: 'italic' }}>building</em>
            </h2>
            <button className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: 13 }}>
              <Icon.Build /> Claim this problem
            </button>
          </div>

          {sols.length === 0 ? (
            <div style={{
              padding: 32, border: '1px dashed var(--line-2)', borderRadius: 14,
              textAlign: 'center', color: 'var(--text-mute)',
            }}>
              <p style={{ margin: 0, marginBottom: 14, fontSize: 15 }}>
                No one has claimed this yet.
              </p>
              <button className="btn btn-signal">Be the first <Icon.Arrow /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sols.map(s => (
                <div key={s.id} className="card" style={{
                  padding: 20, display: 'flex', gap: 18, alignItems: 'center',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                    background: 'var(--signal)', color: 'var(--signal-ink)',
                    display: 'grid', placeItems: 'center',
                    font: '700 18px/1 var(--sans)', letterSpacing: '-0.02em',
                  }}>{s.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
                    }}>
                      <span style={{ font: '600 17px/1 var(--sans)', letterSpacing: '-0.01em' }}>{s.name}</span>
                      <span className="mono" style={{
                        fontSize: 10, padding: '3px 7px', borderRadius: 5,
                        background: 'var(--surface-2)', color: 'var(--text-mute)',
                        letterSpacing: '0.06em',
                      }}>{s.stage.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-mute)' }}>
                      {s.summary} · {s.team}
                    </div>
                  </div>
                  <div className="num" style={{
                    font: '700 22px/1 var(--sans)', letterSpacing: '-0.02em',
                  }}>{s.supporters}</div>
                  <button className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: 13 }}>
                    Support
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Discussion */}
          <h2 className="display" style={{
            fontSize: 32, margin: 0, marginTop: 48, marginBottom: 18, fontWeight: 600,
          }}>Discussion · 24 comments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { who: 'M. Rivera', when: '2h', text: 'Confirming this — Bus 21 was a no-show again Tuesday. I work at the depot and the driver schedule is publicly broken; I can pull the rotation.' },
              { who: 'kaiwong', when: '5h', text: 'TransitTruth team here. We have 240 active testers. Looking for someone who has a contact at the AC Transit board to coordinate the public report.' },
              { who: 'Anon · East 14th', when: '1d', text: 'Missed two interviews because of this. Lost a job offer. Not exaggerating.' },
            ].map((c, i) => (
              <div key={i} style={{
                padding: 18, background: 'var(--surface)', borderRadius: 12,
                border: '1px solid var(--line)',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: 'var(--text-mute)', marginBottom: 8,
                }}>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{c.who}</span>
                  <span>{c.when} ago</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail - vote + meta */}
        <aside style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          position: 'sticky', top: 92, alignSelf: 'flex-start',
        }}>
          <div className="card" style={{ padding: 24 }}>
            <button onClick={() => setVoted(v => !v)} style={{
              width: '100%', appearance: 'none', cursor: 'pointer',
              padding: '20px 18px', borderRadius: 12,
              background: voted ? 'var(--signal)' : 'var(--text)',
              color: voted ? 'var(--signal-ink)' : 'var(--bg)',
              border: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontWeight: 700, fontSize: 16, fontFamily: 'var(--sans)',
              letterSpacing: '-0.01em', marginBottom: 14,
            }}>
              <Icon.Up />
              {voted ? 'Voted up' : 'Upvote this'} · {(p.votes + (voted ? 1 : 0)).toLocaleString()}
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'center', padding: '11px 0', fontSize: 13 }}>
                <Icon.Comment /> Comment
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'center', padding: '11px 0', fontSize: 13 }}>
                <Icon.Share /> Share
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 12, fontSize: 10 }}>Reporter</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 999, background: 'var(--steel)',
                color: 'var(--bone)', display: 'grid', placeItems: 'center',
                font: '600 14px/1 var(--sans)',
              }}>{p.reporter.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.reporter.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>@{p.reporter.handle}</div>
              </div>
            </div>
            <div className="hr" style={{ marginBottom: 14 }}/>
            <div className="eyebrow" style={{ marginBottom: 10, fontSize: 10 }}>Status</div>
            <div style={{ fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: 999,
                background: 'var(--signal)', marginRight: 8, verticalAlign: 'middle',
              }}/>
              {p.status}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 12, fontSize: 10 }}>Related problems</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {others.map(o => (
                <div key={o.id} onClick={() => goToProblem(o.id)} style={{
                  cursor: 'pointer', paddingBottom: 12,
                  borderBottom: '1px solid var(--line)',
                }}>
                  <div style={{ font: '500 13px/1.35 var(--sans)', marginBottom: 6 }}>
                    {o.title}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-mute)',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>{o.category}</span>
                    <span className="num" style={{ color: 'var(--signal)', fontWeight: 600 }}>
                      {o.votes.toLocaleString()} ↑
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Submit Screen
// ─────────────────────────────────────────────────────────────────────────
function SubmitScreen({ setView }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', cat: 'Local', loc: '', desc: '',
  });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ paddingTop: 28, maxWidth: 920, margin: '0 auto' }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>Report a problem</div>
      <h1 className="display" style={{
        fontSize: 'clamp(40px, 5vw, 64px)', margin: 0, marginBottom: 16, fontWeight: 600,
      }}>
        Name what's<br/>
        <em style={{ color: 'var(--signal)', fontStyle: 'italic' }}>broken.</em>
      </h1>
      <p style={{ fontSize: 16, color: 'var(--text-mute)', marginBottom: 36, maxWidth: 560 }}>
        Be specific. We'll cluster your report with similar ones automatically — every voice
        gets counted, you don't have to fight for visibility.
      </p>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: n <= step ? 'var(--signal)' : 'var(--line-2)',
          }}/>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Field label="In one sentence, what's broken?" hint="Be specific. Numbers help.">
            <input value={form.title} onChange={(e) => update('title', e.target.value)}
                   placeholder="e.g. Bus 21 has been late or cancelled 1 in 3 days for 6 months"
                   style={inputStyle} />
          </Field>
          <Field label="Category">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Transit', 'Housing', 'Education', 'Digital', 'Local'].map(c => (
                <button key={c} onClick={() => update('cat', c)} style={{
                  appearance: 'none', cursor: 'pointer',
                  padding: '10px 16px', borderRadius: 999,
                  border: '1px solid ' + (form.cat === c ? 'var(--text)' : 'var(--line-2)'),
                  background: form.cat === c ? 'var(--text)' : 'transparent',
                  color: form.cat === c ? 'var(--bg)' : 'var(--text)',
                  font: '500 13px/1 var(--sans)',
                }}>{c}</button>
              ))}
            </div>
          </Field>
          <Field label="Where?" hint="Address, neighborhood, or 'citywide'">
            <input value={form.loc} onChange={(e) => update('loc', e.target.value)}
                   placeholder="e.g. East 14th corridor, Oakland"
                   style={inputStyle} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Field label="Tell us more" hint="What's happening, who's affected, how often. Skip the rant — we want the facts.">
            <textarea value={form.desc} onChange={(e) => update('desc', e.target.value)}
                      rows={7} placeholder="Since November, the 7:14am bus has missed its stop most weekday mornings. ~80 of us at this stop. We've called AC Transit ~30 times..."
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}/>
          </Field>
          <Field label="Add evidence (optional)">
            <div style={{
              border: '1px dashed var(--line-2)', borderRadius: 12,
              padding: 28, textAlign: 'center', color: 'var(--text-mute)',
            }}>
              <div style={{ fontSize: 13 }}>Drop photos, screenshots, ticket numbers, FOIA responses</div>
              <button className="btn btn-ghost" style={{ marginTop: 12, padding: '9px 14px', fontSize: 13 }}>
                + Add file
              </button>
            </div>
          </Field>

          {/* AI preview */}
          <div style={{
            padding: 20, border: '1px solid var(--line)', borderRadius: 12,
            background: 'var(--surface)',
          }}>
            <div className="eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>
              <Icon.Spark /> AI is finding similar reports
            </div>
            <p style={{ fontSize: 14, margin: 0, marginBottom: 8 }}>
              We found <b style={{ color: 'var(--signal)' }}>17 similar reports</b> in the East Oakland transit cluster.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>
              Your report will be added to that cluster, automatically boosting its visibility.
              You'll be credited as a co-reporter.
            </p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Preview · this is what people will see</div>
          <h3 style={{
            font: '600 24px/1.2 var(--sans)', letterSpacing: '-0.02em',
            margin: 0, marginBottom: 14,
          }}>{form.title || 'Your problem title here'}</h3>
          <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 14 }}>
            {form.cat} · {form.loc || 'location'} · just now
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-mute)', margin: 0,
                      borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            {form.desc || 'Your description here.'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
        <button className="btn btn-ghost" onClick={() => step > 1 ? setStep(step - 1) : setView('feed')}>
          {step === 1 ? 'Cancel' : '← Back'}
        </button>
        {step < 3 ? (
          <button className="btn btn-signal" onClick={() => setStep(step + 1)}>
            Continue <Icon.Arrow />
          </button>
        ) : (
          <button className="btn btn-signal" onClick={() => setView('feed')}>
            Publish report <Icon.Arrow />
          </button>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '14px 16px',
  background: 'var(--surface)', border: '1px solid var(--line-2)',
  borderRadius: 10, color: 'var(--text)', font: '400 15px/1.4 var(--sans)',
  outline: 'none',
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ font: '600 13px/1.2 var(--sans)', marginBottom: 6, display: 'block' }}>{label}</label>
      {hint && <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 10 }}>{hint}</div>}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Hub Screen — developer solution hub
// ─────────────────────────────────────────────────────────────────────────
function HubScreen({ goToProblem }) {
  const D = OH_DATA;
  const [tab, setTab] = useState('claimable');

  return (
    <div style={{ paddingTop: 28, maxWidth: 1180, margin: '0 auto' }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>Developer + builder hub</div>
      <h1 className="display" style={{
        fontSize: 'clamp(48px, 6vw, 80px)', margin: 0, marginBottom: 18, fontWeight: 600,
      }}>
        Build the things<br/>
        <em style={{ color: 'var(--signal)', fontStyle: 'italic' }}>people asked for.</em>
      </h1>
      <p style={{
        fontSize: 17, color: 'var(--text-mute)', maxWidth: 600, marginBottom: 36,
      }}>
        Every problem here has upvotes from real people. Pick one with the right shape for you,
        post a plan, and ship in public.
      </p>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid var(--line)',
        marginBottom: 28,
      }}>
        {[
          ['claimable', 'Claimable now', D.problems.filter(p => p.solutionsCount === 0).length],
          ['active',    'Active solutions', D.solutions.length],
          ['shipped',   'Shipped', 318],
        ].map(([k, l, n]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            padding: '14px 22px',
            background: 'transparent',
            color: tab === k ? 'var(--text)' : 'var(--text-mute)',
            font: '600 14px/1 var(--sans)',
            borderBottom: tab === k ? '2px solid var(--signal)' : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {l}
            <span className="mono num" style={{
              fontSize: 11, opacity: 0.6,
            }}>{n}</span>
          </button>
        ))}
      </div>

      {tab === 'claimable' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {D.problems.filter(p => p.solutionsCount === 0).map(p => (
            <div key={p.id} className="card" style={{ padding: 24, cursor: 'pointer' }}
                 onClick={() => goToProblem(p.id)}>
              <div className="mono" style={{
                fontSize: 11, color: 'var(--text-mute)', marginBottom: 12,
                letterSpacing: '0.08em',
              }}>{p.category.toUpperCase()} · {p.location.toUpperCase()}</div>
              <h3 style={{
                font: '600 22px/1.18 var(--sans)', letterSpacing: '-0.02em',
                margin: 0, marginBottom: 16,
              }}>{p.title}</h3>
              <div style={{
                display: 'flex', gap: 18, alignItems: 'baseline', marginBottom: 16,
              }}>
                <div>
                  <div className="display num" style={{
                    fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em',
                  }}>{p.votes.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>upvotes</div>
                </div>
                <div>
                  <div className="display num" style={{
                    fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em',
                  }}>{p.duplicates}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>similar reports</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <button className="btn btn-signal" style={{ padding: '10px 14px', fontSize: 13 }}>
                    Claim <Icon.Arrow />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.tags.map(t => (
                  <span key={t} style={{
                    fontSize: 11, padding: '4px 9px', borderRadius: 999,
                    background: 'var(--surface-2)', color: 'var(--text-mute)',
                    fontFamily: 'var(--mono)',
                  }}>#{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {D.solutions.map(s => {
            const prob = D.problems.find(p => p.id === s.problemId);
            return (
              <div key={s.id} className="card" style={{
                padding: 24, display: 'flex', gap: 18, alignItems: 'center',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                  background: 'var(--signal)', color: 'var(--signal-ink)',
                  display: 'grid', placeItems: 'center',
                  font: '700 22px/1 var(--sans)',
                }}>{s.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4,
                  }}>
                    <span style={{ font: '700 19px/1 var(--sans)', letterSpacing: '-0.02em' }}>{s.name}</span>
                    <span className="mono" style={{
                      fontSize: 10, padding: '3px 7px', borderRadius: 5,
                      background: 'var(--surface-2)', color: 'var(--text-mute)',
                      letterSpacing: '0.06em',
                    }}>{s.stage.toUpperCase()}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>· {s.team}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-mute)', marginBottom: 6 }}>
                    {s.summary}
                  </div>
                  {prob && (
                    <div onClick={() => goToProblem(prob.id)}
                         style={{ fontSize: 12, color: 'var(--signal)', cursor: 'pointer' }}>
                      Solving: {prob.title}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="num" style={{
                    font: '700 26px/1 var(--sans)', letterSpacing: '-0.02em',
                  }}>{s.supporters}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>supporters</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'shipped' && (
        <div style={{
          padding: 60, textAlign: 'center', border: '1px dashed var(--line-2)',
          borderRadius: 14, color: 'var(--text-mute)',
        }}>
          318 solutions shipped this year. View archive coming soon.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Profile Screen
// ─────────────────────────────────────────────────────────────────────────
function ProfileScreen({ goToProblem, setView }) {
  const D = OH_DATA;
  return (
    <div style={{ paddingTop: 28, maxWidth: 1080, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36,
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: 999,
          background: 'linear-gradient(135deg, #FFD60A, #FF4D2E)',
          color: '#0D1B2A', display: 'grid', placeItems: 'center',
          font: '700 38px/1 var(--sans)', letterSpacing: '-0.02em',
        }}>JK</div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>You · @jadak</div>
          <h1 className="display" style={{
            fontSize: 56, margin: 0, fontWeight: 600,
          }}>Jada Kim</h1>
          <div style={{ fontSize: 14, color: 'var(--text-mute)', marginTop: 8 }}>
            Joined March 2026 · East Oakland · 4 reports · 1 fix shipped
          </div>
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto' }}>
          Edit profile
        </button>
      </div>

      {/* Impact strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0,
        border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden',
        marginBottom: 36, background: 'var(--surface)',
      }}>
        {[
          ['4', 'Reported'],
          ['127', 'Voted'],
          ['3', 'Comments'],
          ['1', 'Fixed because of you'],
          ['+342', 'Reputation'],
        ].map(([n, l], i) => (
          <div key={l} style={{
            padding: '24px 22px',
            borderRight: i < 4 ? '1px solid var(--line)' : 'none',
          }}>
            <div className="display num" style={{
              fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em',
              color: i === 3 ? 'var(--signal)' : 'var(--text)',
            }}>{n}</div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h2 className="display" style={{ fontSize: 26, margin: 0, marginBottom: 16, fontWeight: 600 }}>
            Your reports
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[D.problems[4]].map(p => (
              <div key={p.id} className="card" style={{ padding: 18, cursor: 'pointer' }}
                   onClick={() => goToProblem(p.id)}>
                <div style={{ font: '600 16px/1.3 var(--sans)', marginBottom: 8 }}>{p.title}</div>
                <div style={{
                  display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-mute)',
                }}>
                  <span>{p.category}</span>
                  <span className="num" style={{ color: 'var(--signal)', fontWeight: 600 }}>
                    {p.votes.toLocaleString()} ↑
                  </span>
                  <span>{p.solutionsCount} building</span>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={() => setView('submit')}
                    style={{ justifyContent: 'center' }}>
              <Icon.Plus /> Report another problem
            </button>
          </div>
        </div>

        <div>
          <h2 className="display" style={{ fontSize: 26, margin: 0, marginBottom: 16, fontWeight: 600 }}>
            Recent activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Voted', 'The affordable housing waitlist hasn\'t moved...', '2h ago'],
              ['Commented', 'School-issued laptops block half the sites...', '1d'],
              ['Voted', 'Bus 21 has been late or cancelled...', '3d'],
              ['Reported', 'Streetlights on Maple Ave have been out...', '4d'],
            ].map(([action, what, when], i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderBottom: '1px solid var(--line)',
              }}>
                <div style={{
                  fontSize: 11, fontFamily: 'var(--mono)',
                  color: 'var(--signal)', minWidth: 70, paddingTop: 2,
                  letterSpacing: '0.06em',
                }}>{action.toUpperCase()}</div>
                <div style={{ flex: 1, fontSize: 13, lineHeight: 1.4 }}>{what}</div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', whiteSpace: 'nowrap' }}>{when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
