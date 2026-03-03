import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import { AuthContext, ThemeContext } from '../contexts';
import { ROLES, hasPermission } from '../data';

const LINK = 'https://urbanafbla.betterworld.org/campaigns/sponsor-future-leader';
const to24 = t => { if (!t) return '12:00'; const s = String(t).trim(); if (/^\d{2}:\d{2}$/.test(s)) return s; const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i); if (!m) return '12:00'; let h = Number(m[1]) % 12; if (m[3].toUpperCase() === 'PM') h += 12; return `${String(h).padStart(2, '0')}:${m[2]}`; };
const to12 = t => { const [h0, m = '00'] = to24(t).split(':'); let h = Number(h0); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m} ${ap}`; };

export function HomeScreen({ user, db, onNavigate, settings }) {
  const { isOnline, setIsOnline } = settings;
  const homeRef = React.useRef(null);
  const [homeScroll, setHomeScroll] = useState(0);
  const rankings = [...db.users].filter(u => u.role === ROLES.STUDENT).sort((a, b) => b.points - a.points);
  const userRank = rankings.findIndex(u => u.id === user.id) + 1;
  const totalHours = db.serviceHours.filter(h => h.userId === user.id && h.status === 'approved').reduce((s, h) => s + h.hours, 0);
  const firstName = user.name.split(' ')[0];
  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  const [mins, setMins] = useState(7);
  const [timer, setTimer] = useState({ running: false, remaining: 420, done: false });
  const [albumIndex, setAlbumIndex] = useState(0);
  const [offlinePrompt, setOfflinePrompt] = useState(false);
  const photos = [{ id: '1', url: '/images/fbla-1.jpg' }, { id: '2', url: '/images/fbla-2.jpg' }, { id: '3', url: '/images/fbla-3.jpg' }];
  const todayStr = new Date().toISOString().slice(0, 10);
  const events = db.events.filter(e => e.date === todayStr);
  const anns = db.announcements.slice(0, 3);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  useEffect(() => { if (!timer.running) return; const i = setInterval(() => setTimer(p => { const n = p.remaining - 1; if (n <= 0) return { running: false, remaining: 0, done: true }; return { ...p, remaining: n }; }), 1000); return () => clearInterval(i); }, [timer.running]);
  useEffect(() => { const i = setInterval(() => setAlbumIndex(v => (v + 1) % photos.length), 3000); return () => clearInterval(i); }, []);
  useEffect(() => {
    const scroller = homeRef.current?.closest('main');
    if (!scroller) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setHomeScroll(scroller.scrollTop || 0);
        raf = 0;
      });
    };
    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const onTimer = () => { if (timer.running || timer.done) { setTimer({ running: false, remaining: mins * 60, done: false }); return; } setTimer(p => ({ ...p, running: true })); };
  const label = timer.done ? "Time's up" : timer.running && timer.remaining <= 30 ? '30 sec remaining' : timer.running && timer.remaining <= 120 ? '2 min warning' : timer.running ? 'Running' : `${mins} min`;
  const history = [0.08, 0.18, 0.16, 0.42, 0.38, 0.74, 1].map(v => Math.round((user.points || 0) * v));
  const max = Math.max(...history, 1);
  const points = history.map((v, i) => `${10 + i * 46},${86 - (v / max) * 64}`).join(' ');

  const cards = [
    { id: 'activity', title: 'Activity', subtitle: '', ts: 'Today', screen: 'rankings' },
    { id: 'quiz', title: 'AI Quiz', subtitle: '', ts: 'Practice', screen: 'quiz' },
    { id: 'resources', title: 'Resources', subtitle: 'Event rubrics and reference PDFs', ts: 'Rubrics', screen: 'resources' },
    { id: 'timer', title: 'Performance Timer', subtitle: 'Tap left timer to start. Tap again to reset.', ts: 'Tools', screen: 'timer' },
    { id: 'checklist', title: 'Checklist', subtitle: 'Competition day readiness checklist', ts: 'Prep', screen: 'checklist' },
    { id: 'announcements', title: 'Announcements', subtitle: db.announcements.length ? `${db.announcements.length} updates posted` : 'No announcements yet', ts: 'Updates', screen: 'announcements' },
    { id: 'calendar', title: 'Calendar', subtitle: events.length ? `${events.length} event(s) today` : 'No Events Today', ts: 'Schedule', screen: 'calendar' },
    { id: 'album', title: 'Album', subtitle: `${db.photos.filter(p => p.status === 'approved').length} approved photos`, ts: 'Media', screen: 'album' },
    { id: 'social', title: 'Social', subtitle: '', ts: 'Community', screen: 'social' },
    { id: 'checkins', title: 'Check-In Times', subtitle: 'Schedule and mark student check-ins', ts: 'Chaperone', screen: 'chaperone' }
  ];
  const visible = user.role === ROLES.CHAPERONE ? cards.filter(c => !['activity', 'quiz', 'social'].includes(c.id)) : cards.filter(c => c.id !== 'checkins');
  const blockedOfflineCards = new Set(['quiz', 'album', 'social']);
  const onCardPress = card => {
    if (!isOnline && blockedOfflineCards.has(card.id)) {
      setOfflinePrompt(true);
      return;
    }
    if (card.id === 'timer') onTimer();
    else onNavigate(card.screen);
  };

  return <div className="health-home" ref={homeRef}><div className="home-gradient-hero" style={{ transform: `translateY(${Math.round(-homeScroll * 0.55)}px)` }}><div className="health-home-header"><div><h1>Summary</h1><p>Welcome back, {firstName}</p></div><button type="button" className="summary-profile-chip" onClick={() => onNavigate('settings')}>{initials || 'U'}</button></div></div><div className="health-card-list">{visible.map((c, i) => <button key={c.id} type="button" className={`health-card ${c.id}-card`} onClick={() => onCardPress(c)}><div className={`health-card-arrow ${i % 2 === 0 ? 'arrow-gold' : 'arrow-blue'}`}><Icons.ChevronRight size={20} /></div><div className="health-card-main"><div className="health-card-top"><span className="health-card-title">{c.title}</span><span className="health-card-time">{c.ts}</span></div>{c.subtitle && <p className="health-card-subtitle">{c.subtitle}</p>}{c.id === 'activity' && <div className="activity-stats"><div className="activity-stat-row"><span>Points</span><strong>{user.points?.toLocaleString() || 0}</strong></div><div className="activity-stat-row"><span>Rank</span><strong>#{userRank || '-'}</strong></div><div className="activity-stat-row"><span>Service Hours</span><strong>{totalHours}</strong></div></div>}{c.id === 'activity' && <div className="activity-graph-wrap"><svg width="100%" height="96" viewBox="0 0 300 96" preserveAspectRatio="none"><polyline fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="butt" strokeLinejoin="miter" points={points} /></svg></div>}{c.id === 'timer' && <div className="perf-timer-row"><button type="button" className={`perf-timer-main ${timer.done ? 'done' : timer.running && timer.remaining <= 30 ? 'warn-red' : timer.running && timer.remaining <= 120 ? 'warn-yellow' : ''}`} onClick={e => { e.stopPropagation(); onTimer(); }}>{label}</button><div className="perf-timer-options">{[7, 5, 4].map(v => <button key={v} type="button" className={`perf-option ${mins === v ? 'active' : ''}`} onClick={e => { e.stopPropagation(); setMins(v); setTimer({ running: false, remaining: v * 60, done: false }); }}>{v}min</button>)}</div></div>}{c.id === 'announcements' && <div className="home-inline-list">{anns.length === 0 ? <p className="home-inline-empty">No announcements yet</p> : anns.map(a => <p key={a.id} className="announcement-row">{a.title}</p>)}</div>}{c.id === 'calendar' && <div className="home-inline-list">{events.slice(0, 3).map(e => <p key={e.id}>{to12(e.time)} @ {e.title}</p>)}<div className="calendar-week-dots">{weekDates.map(d => { const isToday = d.toDateString() === today.toDateString(); return <div key={d.toISOString()} className={`calendar-dot-item ${isToday ? 'today' : ''}`}><span className="calendar-dot" /><small>{d.getDate()}</small></div>; })}</div></div>}{c.id === 'album' && <div className="album-carousel"><img src={photos[albumIndex].url} alt="Album" /><button type="button" className="album-arrow left" onClick={e => { e.stopPropagation(); setAlbumIndex(v => (v - 1 + photos.length) % photos.length); }}><Icons.ChevronLeft size={16} /></button><button type="button" className="album-arrow right" onClick={e => { e.stopPropagation(); setAlbumIndex(v => (v + 1) % photos.length); }}><Icons.ChevronRight size={16} /></button></div>}{c.id === 'social' && <div className="social-shortcuts"><button type="button" onClick={e => { e.stopPropagation(); onNavigate('social', { tab: 'feed' }); }}>Feed</button><button type="button" onClick={e => { e.stopPropagation(); onNavigate('social', { tab: 'network' }); }}>Network</button><button type="button" onClick={e => { e.stopPropagation(); onNavigate('social', { tab: 'profile' }); }}>Profile</button></div>}</div></button>)}</div>{offlinePrompt && <div className="modal-overlay" onClick={() => setOfflinePrompt(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><h3 style={{ fontSize: 18, marginBottom: 10 }}>Unable to access without internet connection</h3><p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>This feature requires online mode.</p><div style={{ display: 'flex', gap: 10 }}><button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOfflinePrompt(false)}>Cancel</button><button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setIsOnline(true); setOfflinePrompt(false); }}>Turn Network On</button></div></div></div>}</div>;
}

export function FundraisingScreen({ user }) {
  const [locked, setLocked] = useState(true);
  const [scan, setScan] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const raised = useMemo(() => 350 + (((user.points || 0) + user.name.length * 73) % 1400), [user]);
  const goal = 2500;
  const progress = Math.min(100, Math.round((raised / goal) * 100));
  const doScan = () => { setError(''); setScan(true); setTimeout(() => { const ok = Math.random() > 0.4; setScan(false); if (ok) setLocked(false); else setError('Biometric failed, please enter password.'); }, 1100); };
  const unlock = () => { if (pass !== 'password123') { setError('Incorrect password.'); return; } setLocked(false); setError(''); };
  const copy = async () => { try { await navigator.clipboard.writeText(LINK); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { setError('Unable to copy link on this browser.'); } };

  if (locked) return <div className="fundraising-page"><div className="fundraising-auth-card"><h2>Fundraising Access</h2><p>Use Face ID demo to continue.</p><button type="button" className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }} onClick={doScan}><Icons.Shield size={18} /> {scan ? 'Scanning...' : 'Use Face ID (Demo)'}</button><p className="fundraising-auth-divider">or password</p><input type="password" className="input" placeholder="Enter account password" value={pass} onChange={e => setPass(e.target.value)} /><button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: 10 }} onClick={unlock}>Continue</button>{error && <p className="fundraising-error">{error}</p>}</div></div>;

  return <div className="fundraising-page"><div className="fundraising-dashboard card-enter"><div className="fundraising-header"><h2>Fundraising Dashboard</h2><span>{progress}%</span></div><p className="fundraising-numbers">${raised.toLocaleString()} raised @ ${goal.toLocaleString()} goal</p><div className="progress-bar" style={{ marginBottom: 14 }}><div className="progress-fill" style={{ width: `${progress}%` }} /></div><p className="fundraising-link-title">Personal fundraising page</p><div className="fundraising-link-row"><input className="input" readOnly value={LINK} /><button type="button" className="btn btn-primary btn-sm" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></div></div></div>;
}

export function SocialScreen({ user, db, initialTab = 'feed' }) {
  const [tab, setTab] = useState(initialTab);
  const [postText, setPostText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDraft, setCommentDraft] = useState({});
  const [search, setSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [connectStatus, setConnectStatus] = useState({});
  const [privacy, setPrivacy] = useState('chapter');
  const [linkedinLink, setLinkedinLink] = useState('https://www.linkedin.com/');
  const [bio, setBio] = useState(user.bio || '');
  const [chatUserId, setChatUserId] = useState(null);
  const [chatDraft, setChatDraft] = useState('');
  const [messages, setMessages] = useState({});

  const gradeMap = {
    '1': '11',
    '2': '12',
    '3': 'Advisor',
    '4': '11',
    '5': '12',
    '6': '10',
    '7': '11',
    '8': 'Chaperone'
  };

  const [posts, setPosts] = useState(() => {
    const fallback = [
      {
        id: 'feed-1',
        userId: '2',
        content: 'Wrapped mock judging tonight. The rubric flow finally clicked after timing each section.',
        timestamp: Date.now() - 1000 * 60 * 28,
        likes: ['1', '4', '5'],
        comments: [
          { id: 'c-1', userId: '1', text: 'Nice. We should run one more round before regionals.', timestamp: Date.now() - 1000 * 60 * 22 }
        ]
      },
      {
        id: 'feed-2',
        userId: '4',
        content: 'Uploaded the latest slide template with cleaner score-callout sections.',
        timestamp: Date.now() - 1000 * 60 * 95,
        likes: ['2'],
        comments: []
      },
      {
        id: 'feed-3',
        userId: '5',
        content: 'Service hour approvals came through. Team is now over 120 total hours.',
        timestamp: Date.now() - 1000 * 60 * 210,
        likes: ['1', '2', '6'],
        comments: [
          { id: 'c-2', userId: '6', text: 'Great push this week.', timestamp: Date.now() - 1000 * 60 * 190 }
        ]
      }
    ];
    return (db.posts && db.posts.length ? db.posts : fallback).map(p => ({
      ...p,
      likes: p.likes || [],
      comments: p.comments || []
    }));
  });

  const allOthers = db.users.filter(u => u.id !== user.id);
  const seededConnected = allOthers.slice(0, 2);
  const [connectedIds, setConnectedIds] = useState(() => [...new Set([...(user.connections || []), ...seededConnected.map(p => p.id)])]);

  useEffect(() => {
    setTab(initialTab || 'feed');
  }, [initialTab]);

  useEffect(() => {
    if (seededConnected.length === 0) return;
    const threadSeed = {};
    seededConnected.forEach((person, idx) => {
      threadSeed[person.id] = [
        { id: `m-${person.id}-1`, from: person.id, text: idx === 0 ? 'Can you review my event outline tonight?' : 'I sent the chapter reminder for tomorrow.', timestamp: Date.now() - 1000 * 60 * (idx ? 37 : 52) },
        { id: `m-${person.id}-2`, from: user.id, text: idx === 0 ? 'Yes, send it here and I will annotate it.' : 'Perfect, I will follow up with officers.', timestamp: Date.now() - 1000 * 60 * (idx ? 34 : 47) }
      ];
    });
    setMessages(m => Object.keys(m).length ? m : threadSeed);
  }, []);

  const visiblePeople = allOthers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const createPost = () => {
    if (!postText.trim()) return;
    const next = {
      id: `p-${Date.now()}`,
      userId: user.id,
      content: postText.trim(),
      timestamp: Date.now(),
      likes: [],
      comments: []
    };
    setPosts([next, ...posts]);
    setPostText('');
  };

  const toggleLike = postId => {
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(user.id);
      return { ...p, likes: liked ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id] };
    }));
  };

  const addComment = postId => {
    const text = (commentDraft[postId] || '').trim();
    if (!text) return;
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: `cm-${Date.now()}`, userId: user.id, text, timestamp: Date.now() }] } : p));
    setCommentDraft({ ...commentDraft, [postId]: '' });
  };

  const connectTo = personId => {
    setConnectStatus(s => ({ ...s, [personId]: 'sent' }));
    setTimeout(() => {
      setConnectStatus(s => ({ ...s, [personId]: 'connected' }));
      setConnectedIds(ids => ids.includes(personId) ? ids : [...ids, personId]);
      setMessages(m => {
        if (m[personId]) return m;
        return {
          ...m,
          [personId]: [
            { id: `welcome-${personId}`, from: personId, text: 'Thanks for connecting. Happy to collaborate.', timestamp: Date.now() }
          ]
        };
      });
    }, 2500);
  };

  const sendMessage = () => {
    if (!chatUserId || !chatDraft.trim()) return;
    const next = { id: `m-${Date.now()}`, from: user.id, text: chatDraft.trim(), timestamp: Date.now() };
    setMessages(m => ({ ...m, [chatUserId]: [...(m[chatUserId] || []), next] }));
    setChatDraft('');
  };

  const getUser = id => db.users.find(u => u.id === id);

  return (
    <div className="social-screen" style={{ padding: 16, paddingBottom: 100 }}>
      <div className="tab-bar" style={{ marginBottom: 16 }}>
        <button className={`tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>Feed</button>
        <button className={`tab ${tab === 'network' ? 'active' : ''}`} onClick={() => setTab('network')}>Network</button>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
      </div>

      {tab === 'feed' && (
        <>
          <div className="post-card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{user.avatar}</div>
              <textarea value={postText} onChange={e => setPostText(e.target.value)} placeholder="Share an update with your chapter..." className="input" style={{ minHeight: 76, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-sm btn-primary" onClick={createPost}><Icons.Send size={14} /> Post</button>
            </div>
          </div>

          {posts.map(post => {
            const author = getUser(post.userId) || { name: 'Member', avatar: 'FB', role: 'student' };
            const liked = post.likes.includes(user.id);
            const showComments = expandedComments[post.id];
            return (
              <div key={post.id} className="post-card">
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{author.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{author.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(post.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.45 }}>{post.content}</p>
                <div className="post-actions">
                  <button className={`post-action ${liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}><Icons.Heart size={16} filled={liked} /> {post.likes.length}</button>
                  <button className="post-action" onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !showComments })}><Icons.MessageCircle size={16} /> {post.comments.length}</button>
                </div>
                {showComments && (
                  <div style={{ marginTop: 10, background: 'var(--bg-secondary)', borderRadius: 10, padding: 10 }}>
                    {post.comments.map(c => {
                      const commenter = getUser(c.userId) || { name: 'Member' };
                      return <p key={c.id} style={{ margin: '0 0 8px', fontSize: 13 }}><strong>{commenter.name}:</strong> {c.text}</p>;
                    })}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="input" value={commentDraft[post.id] || ''} onChange={e => setCommentDraft({ ...commentDraft, [post.id]: e.target.value })} placeholder="Write a comment..." style={{ padding: 10, fontSize: 13 }} />
                      <button className="btn btn-sm btn-primary" onClick={() => addComment(post.id)}><Icons.Send size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {tab === 'network' && (
        <>
          <div className="post-card" style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 14 }}>Messages</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {connectedIds.map(id => {
                const person = getUser(id);
                if (!person) return null;
                return (
                  <div key={id} className="resource-card" style={{ marginBottom: 0, padding: '10px 12px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{person.name}</p>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => setChatUserId(id)}>
                      <Icons.MessageCircle size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="post-card" style={{ marginBottom: 12 }}>
            <input className="input" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {visiblePeople.map(person => {
            const status = connectStatus[person.id] || (connectedIds.includes(person.id) ? 'connected' : 'idle');
            return (
              <div key={person.id} className="resource-card" style={{ cursor: 'pointer' }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 12 }} onClick={() => setSelectedPerson(person)}>{person.avatar}</div>
                <div style={{ flex: 1 }} onClick={() => setSelectedPerson(person)}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{person.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{person.chapter}</p>
                </div>
                {status === 'idle' && <button className="btn btn-sm btn-secondary" onClick={() => connectTo(person.id)}><Icons.UserPlus size={14} /> Connect</button>}
                {status === 'sent' && <button className="btn btn-sm btn-secondary" disabled>Request Sent</button>}
                {status === 'connected' && <button className="btn btn-sm btn-primary" disabled>Connected</button>}
              </div>
            );
          })}
        </>
      )}

      {tab === 'profile' && (
        <div className="post-card">
          <p style={{ margin: '0 0 12px', fontWeight: 700 }}>Profile Settings</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6, color: 'var(--text-secondary)' }}>Who can see your account</label>
            <div className="tab-bar">
              <button className={`tab ${privacy === 'nobody' ? 'active' : ''}`} onClick={() => setPrivacy('nobody')}>Nobody</button>
              <button className={`tab ${privacy === 'chapter' ? 'active' : ''}`} onClick={() => setPrivacy('chapter')}>Chapter Members</button>
              <button className={`tab ${privacy === 'everyone' ? 'active' : ''}`} onClick={() => setPrivacy('everyone')}>Everyone</button>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6, color: 'var(--text-secondary)' }}>LinkedIn Share Link</label>
            <input className="input" value={linkedinLink} onChange={e => setLinkedinLink(e.target.value)} placeholder="https://www.linkedin.com/" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6, color: 'var(--text-secondary)' }}>Bio</label>
            <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} style={{ minHeight: 92, resize: 'vertical' }} />
          </div>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
            <Icons.Linkedin size={16} /> Open LinkedIn
          </a>
        </div>
      )}

      {selectedPerson && (
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div className="avatar">{selectedPerson.avatar}</div>
              <div>
                <h3 style={{ margin: '2px 0', fontSize: 18 }}>{selectedPerson.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>{selectedPerson.chapter}</p>
              </div>
            </div>
            <p style={{ margin: '8px 0', fontSize: 13 }}><strong>Grade:</strong> {gradeMap[selectedPerson.id] || '11'}</p>
            <p style={{ margin: '8px 0', fontSize: 13 }}><strong>Position:</strong> {selectedPerson.role === 'student_leader' ? 'Student Leader' : 'Student'}</p>
            <p style={{ margin: '8px 0', fontSize: 13 }}><strong>Bio:</strong> {selectedPerson.bio || 'FBLA member focused on chapter growth and competition prep.'}</p>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', marginBottom: 10 }}>
              <Icons.Linkedin size={16} /> LinkedIn
            </a>
            {(connectStatus[selectedPerson.id] || (connectedIds.includes(selectedPerson.id) ? 'connected' : 'idle')) === 'idle' && (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => connectTo(selectedPerson.id)}>
                <Icons.UserPlus size={16} /> Connect
              </button>
            )}
            {(connectStatus[selectedPerson.id] || (connectedIds.includes(selectedPerson.id) ? 'connected' : 'idle')) === 'sent' && (
              <button className="btn btn-secondary" style={{ width: '100%' }} disabled>Request Sent</button>
            )}
            {(connectStatus[selectedPerson.id] || (connectedIds.includes(selectedPerson.id) ? 'connected' : 'idle')) === 'connected' && (
              <button className="btn btn-primary" style={{ width: '100%' }} disabled>Connected</button>
            )}
          </div>
        </div>
      )}

      {chatUserId && (
        <div className="modal-overlay" onClick={() => setChatUserId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 430, maxHeight: '86vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>{getUser(chatUserId)?.name || 'Chat'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setChatUserId(null)}><Icons.ChevronLeft size={14} /></button>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 10, flex: 1, overflowY: 'auto', marginBottom: 8 }}>
              {(messages[chatUserId] || []).map(m => (
                <div key={m.id} style={{ marginBottom: 6, textAlign: m.from === user.id ? 'right' : 'left' }}>
                  <span style={{ display: 'inline-block', background: m.from === user.id ? 'var(--primary)' : 'var(--card)', color: m.from === user.id ? 'white' : 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 9px', fontSize: 12 }}>{m.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={chatDraft} onChange={e => setChatDraft(e.target.value)} placeholder="Type a message..." style={{ padding: 10, fontSize: 13 }} />
              <button className="btn btn-sm btn-primary" onClick={sendMessage}><Icons.Send size={14} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CompeteScreen({ onNavigate }) {
  return <div style={{ padding: 16, paddingBottom: 100 }}><div className="bento-item large bento-gold" style={{ marginBottom: 16 }}><h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Competition Center</h2><p style={{ fontSize: 14, margin: 0 }}>Prepare for competitive events</p></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div className="bento-item bento-primary hover-lift" onClick={() => onNavigate('quiz')}><div style={{ textAlign: 'center' }}><Icons.Brain size={32} /><p style={{ fontSize: 14, fontWeight: 600, margin: '8px 0 0' }}>AI Quiz</p></div></div><div className="bento-item bento-purple hover-lift" onClick={() => onNavigate('checklist')}><div style={{ textAlign: 'center' }}><Icons.Clipboard size={32} /><p style={{ fontSize: 14, fontWeight: 600, margin: '8px 0 0' }}>Checklist</p></div></div></div></div>;
}

export function CalendarScreen({ user, db, setDb }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '' });
  const canAdd = hasPermission(user, 'create_calendar_global') || hasPermission(user, 'create_announcements');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDay; i += 1) days.push(null);
  for (let i = 1; i <= daysInMonth; i += 1) days.push(i);
  const monthEvents = db.events.filter(e => { const d = new Date(e.date); return d.getMonth() === month && d.getFullYear() === year; });
  const events = selectedDate ? db.events.filter(e => e.date === selectedDate) : [];
  const add = () => { if (!newEvent.title || !newEvent.date) return; setDb({ ...db, events: [...db.events, { id: Date.now().toString(), title: newEvent.title, date: newEvent.date, time: to24(newEvent.time || '12:00'), location: newEvent.location || 'TBD', type: canAdd ? 'chapter' : 'personal', color: '#0a2e7f', createdBy: user.id }] }); setNewEvent({ title: '', date: '', time: '', location: '' }); setShowAddModal(false); };
  return <div className="calendar-screen" style={{ padding: 16, paddingBottom: 100 }}><div className="calendar-shell-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><button className="btn btn-sm btn-secondary" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><Icons.ChevronLeft size={16} /></button><h3 style={{ margin: 0, fontSize: 17 }}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3><button className="btn btn-sm btn-secondary" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><Icons.ChevronRight size={16} /></button></div><div className="calendar-shell-card calendar-weekday-row calendar-grid" style={{ marginBottom: 6 }}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', padding: 4 }}>{d}</div>)}</div><div className="calendar-shell-card calendar-grid" style={{ marginBottom: 12 }}>{days.map((day, i) => { if (!day) return <div key={`e-${i}`} />; const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const hasEvent = monthEvents.some(e => e.date === dateStr); const isToday = new Date().toDateString() === new Date(year, month, day).toDateString(); return <div key={dateStr} className={`calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''} ${selectedDate === dateStr ? 'selected' : ''}`} onClick={() => setSelectedDate(dateStr)}>{day}</div>; })}</div><button className="btn btn-primary" style={{ width: '100%', marginBottom: 14 }} onClick={() => setShowAddModal(true)}><Icons.Plus size={18} /> Add Event</button>{selectedDate && <div className="calendar-events-wrap" style={{ marginTop: 8 }}>{events.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No events</p> : events.map(e => <div key={e.id} className="event-card"><div><h4 style={{ margin: '0 0 4px' }}>{e.title}</h4><p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{to12(e.time)} @ {e.location}</p></div></div>)}</div>}{showAddModal && <div className="modal-overlay" onClick={() => setShowAddModal(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add Event</h3><div style={{ marginBottom: 12 }}><label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Title</label><input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="input" /></div><div style={{ marginBottom: 12 }}><label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Date</label><input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="input" /></div><div style={{ marginBottom: 12 }}><label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Time</label><input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="input" /></div><div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Location</label><input value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} className="input" /></div><div style={{ display: 'flex', gap: 12 }}><button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button><button className="btn btn-primary" style={{ flex: 1 }} onClick={add}>Add</button></div></div></div>}</div>;
}

export function SettingsScreen({ user, setUser, db, setDb, settings }) {
  const { isOnline, setIsOnline, autoDownload, setAutoDownload } = settings;
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const [editProfile, setEditProfile] = useState(false);
  const [profile, setProfile] = useState({ name: user.name, bio: user.bio || '', linkedin: user.linkedin || '' });
  const save = () => { setUser({ ...user, ...profile }); setEditProfile(false); };
  return <div style={{ padding: 16, paddingBottom: 100 }}><div style={{ marginBottom: 24 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Appearance</h3><div className="settings-item"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{theme === 'dark' ? <Icons.Moon size={20} /> : <Icons.Sun size={20} />}<div><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Light / Dark Mode</p><p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Current: {theme === 'dark' ? 'Dark' : 'Light'}</p></div></div><div className={`switch ${theme === 'dark' ? 'active' : ''}`} onClick={toggleTheme} /></div></div><div style={{ marginBottom: 24 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Network</h3><div className="settings-item"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{isOnline ? <Icons.Wifi size={20} /> : <Icons.WifiOff size={20} />}<div><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Network Connection</p><p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{isOnline ? 'Online' : 'Offline mode'}</p></div></div><div className={`switch ${isOnline ? 'active' : ''}`} onClick={() => setIsOnline(!isOnline)} /></div><div className="settings-item"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Icons.Download size={20} /><div><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Auto-Download</p><p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Download all resources automatically</p></div></div><div className={`switch ${autoDownload ? 'active' : ''}`} onClick={() => { setAutoDownload(!autoDownload); if (!autoDownload) setDb({ ...db, resources: db.resources.map(r => ({ ...r, downloaded: true })) }); }} /></div></div><div style={{ marginBottom: 24 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Profile</h3><div className="settings-item" onClick={() => setEditProfile(true)}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{user.avatar}</div><div><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{user.name}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{user.role} @ {user.chapter}</p></div></div><Icons.ChevronRight size={20} color="var(--text-secondary)" /></div></div><button className="btn btn-secondary" style={{ width: '100%', marginBottom: 20 }} onClick={logout}><Icons.LogOut size={16} /> Sign Out</button>{editProfile && <div className="modal-overlay" onClick={() => setEditProfile(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Edit Profile</h3><div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Name</label><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input" /></div><div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Bio</label><textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} className="input" style={{ minHeight: 80 }} /></div><div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>LinkedIn Username</label><input value={profile.linkedin} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} placeholder="yourprofile" className="input" /></div><div style={{ display: 'flex', gap: 12 }}><button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditProfile(false)}>Cancel</button><button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button></div></div></div>}</div>;
}

