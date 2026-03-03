import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Header } from '../components/Shared';
import { ROLES, CHECKLIST_ITEMS, hasPermission } from '../data';

const formatMeridiem = value => {
  if (!value) return '';
  const raw = String(value).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return raw;
  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
};

const RESOURCE_EVENTS = [
  ['Accounting', 'accounting'],
  ['Advanced Accounting', 'advanced-accounting'],
  ['Advertising', 'advertising'],
  ['Agribusiness', 'agribusiness'],
  ['Banking & Financial Systems', 'banking-and-financial-systems'],
  ['Broadcast Journalism', 'broadcast-journalism'],
  ['Business Communication', 'business-communication'],
  ['Business Ethics', 'business-ethics'],
  ['Business Law', 'business-law'],
  ['Business Management', 'business-management'],
  ['Business Plan', 'business-plan'],
  ['Career Portfolio', 'career-portfolio'],
  ['Coding & Programming', 'coding-and-programming'],
  ['Community Service Project', 'community-service-project'],
  ['Computer Applications', 'computer-applications'],
  ['Computer Game & Simulation Programming', 'computer-game-and-simulation-programming'],
  ['Computer Problem Solving', 'computer-problem-solving'],
  ['Customer Service', 'customer-service'],
  ['Cybersecurity', 'cybersecurity'],
  ['Data Analysis', 'data-analysis'],
  ['Data Science & AI', 'data-science-and-ai'],
  ['Digital Animation', 'digital-animation'],
  ['Digital Video Production', 'digital-video-production'],
  ['Economics', 'economics'],
  ['Entrepreneurship', 'entrepreneurship'],
  ['Event Planning', 'event-planning'],
  ['Financial Planning', 'financial-planning'],
  ['Financial Statement Analysis', 'financial-statement-analysis'],
  ['Future Business Educator', 'future-business-educator'],
  ['Future Business Leader', 'future-business-leader'],
  ['Graphic Design', 'graphic-design'],
  ['Healthcare Administration', 'healthcare-administration'],
  ['Hospitality & Event Management', 'hospitality-and-event-management'],
  ['Human Resource Management', 'human-resource-management'],
  ['Impromptu Speaking', 'impromptu-speaking'],
  ['Insurance & Risk Management', 'insurance-and-risk-management'],
  ['International Business', 'international-business'],
  ['Introduction to Business Communication', 'introduction-to-business-communication'],
  ['Introduction to Business Concepts', 'introduction-to-business-concepts'],
  ['Introduction to Business Presentation', 'introduction-to-business-presentation'],
  ['Introduction to Business Procedures', 'introduction-to-business-procedures'],
  ['Introduction to FBLA', 'introduction-to-fbla'],
  ['Introduction to Information Technology', 'introduction-to-information-technology'],
  ['Introduction to Marketing Concepts', 'introduction-to-marketing-concepts'],
  ['Introduction to Parliamentary Procedure', 'introduction-to-parliamentary-procedure'],
  ['Introduction to Programming', 'introduction-to-programming'],
  ['Introduction to Public Speaking', 'introduction-to-public-speaking'],
  ['Introduction to Retail & Merchandising', 'introduction-to-retail-and-merchandising'],
  ['Introduction to Social Media Strategy', 'introduction-to-social-media-strategy'],
  ['Introduction to Supply Chain Management', 'introduction-to-supply-chain-management'],
  ['Job Interview', 'job-interview'],
  ['Journalism', 'journalism'],
  ['Local Chapter Annual Business Report', 'local-chapter-annual-business-report'],
  ['Management Information Systems', 'management-information-systems'],
  ['Marketing', 'marketing'],
  ['Mobile Application Development', 'mobile-application-development'],
  ['Network Design', 'network-design'],
  ['Networking Infrastructures', 'networking-infrastructures'],
  ['Organizational Leadership', 'organizational-leadership'],
  ['Parliamentary Procedure', 'parliamentary-procedure'],
  ['Personal Finance', 'personal-finance'],
  ['Project Management', 'project-management'],
  ['Public Administration & Management', 'public-administration-and-management'],
  ['Public Service Announcement', 'public-service-announcement'],
  ['Public Speaking', 'public-speaking'],
  ['Real Estate', 'real-estate'],
  ['Retail Management', 'retail-management'],
  ['Sales Presentation', 'sales-presentation'],
  ['Securities & Investments', 'securities-and-investments'],
  ['Social Media Strategies', 'social-media-strategies'],
  ['Sports & Entertainment Management', 'sports-and-entertainment-management'],
  ['Supply Chain Management', 'supply-chain-management'],
  ['Technology Support & Services', 'technology-support-and-services'],
  ['Visual Design', 'visual-design'],
  ['Website Coding & Development', 'website-coding-and-development'],
  ['Website Design', 'website-design']
];

const buildPrettyPdfName = slug => {
  const words = slug.split('-').map(part => {
    if (part === 'and' || part === 'to') return part;
    if (part === 'fbla') return 'FBLA';
    if (part === 'ai') return 'AI';
    return part.charAt(0).toUpperCase() + part.slice(1);
  });
  return `${words.join('-')}.pdf`;
};

const specialFilenameBySlug = {
  'computer-game-and-simulation-programming': 'Computer-Game-Simulation-Programming.pdf'
};

const resolvePdfPath = async slug => {
  const pretty = specialFilenameBySlug[slug] || buildPrettyPdfName(slug);
  const candidates = [
    `/rubrics/${pretty}`,
    `/rubrics/${slug}.pdf`,
    `/rubrics/${slug.replace('-and-', '-')}.pdf`,
    `/rubrics/${slug.replace('-and-', '-').replace(/(^|-)\\w/g, m => m.toUpperCase())}.pdf`
  ];
  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { method: 'HEAD' });
      if (res.ok) return candidate;
    } catch {}
  }
  return `/rubrics/${pretty}`;
};

export function QuizScreen({ onBack, db }) {
  const [event, setEvent] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);

  const startQuiz = id => { const qs = db.quizQuestions[id] || []; const shuffled = [...qs].sort(() => Math.random() - 0.5); setQuiz(shuffled.map((q, i) => ({ id: i, ...q }))); setEvent(db.competitiveEvents.find(e => e.id === id)); setCurrent(0); setScore(0); setComplete(false); setSelected(null); setShowResult(false) };
  const submit = () => { setShowResult(true); if (selected === quiz[current].answer) setScore(s => s + 1) };
  const next = () => { if (current < quiz.length - 1) { setCurrent(c => c + 1); setSelected(null); setShowResult(false) } else setComplete(true) };
  const reset = () => { setEvent(null); setQuiz([]) };

  if (!event) return (<div className="container"><Header title="AI Quiz" showBack onBack={onBack} /><div style={{ padding: 16, paddingBottom: 100 }}><div className="bento-item large bento-primary" style={{ marginBottom: 20, textAlign: 'center' }}><Icons.Brain size={48} /><h2 style={{ fontSize: 20, fontWeight: 700, margin: '16px 0 8px' }}>AI-Powered Quizzes</h2></div>{db.competitiveEvents.filter(e => e.type === 'objective' && db.quizQuestions[e.id]).map(e => (<div key={e.id} className="resource-card hover-lift" onClick={() => startQuiz(e.id)}><span style={{ fontSize: 28 }}>{e.icon}</span><div style={{ flex: 1 }}><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{e.name}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{db.quizQuestions[e.id]?.length || 0} questions</p></div><Icons.ChevronRight size={20} /></div>))}</div></div>);

  if (complete) { const pct = Math.round((score / quiz.length) * 100); return (<div className="container"><Header title="Complete" showBack onBack={reset} /><div style={{ padding: 16, textAlign: 'center' }}><div className="bento-item large" style={{ padding: 32 }}><div style={{ width: 100, height: 100, margin: '0 auto 24px', borderRadius: '50%', background: pct >= 70 ? 'rgba(10,46,127,0.15)' : 'rgba(242,169,0,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 36, fontWeight: 800, color: pct >= 70 ? 'var(--primary)' : 'var(--gold)' }}>{pct}%</span></div><h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>{pct >= 70 ? 'Great Job! 🎉' : 'Keep Practicing! 💪'}</h2><p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 0 24px' }}>{score} / {quiz.length} correct</p><div style={{ display: 'flex', gap: 12 }}><button onClick={() => startQuiz(event.id)} className="btn btn-secondary" style={{ flex: 1 }}><Icons.RefreshCw size={18} /> Retry</button><button onClick={reset} className="btn btn-primary" style={{ flex: 1 }}>New Quiz</button></div></div></div></div>) }

  const q = quiz[current];
  return (<div className="container"><Header title={event.name} showBack onBack={reset} /><div style={{ padding: 16 }}><div style={{ marginBottom: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 14, fontWeight: 600 }}>Q{current + 1}/{quiz.length}</span><span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Score: {score}</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${((current + 1) / quiz.length) * 100}%` }} /></div></div><div className="bento-item" style={{ marginBottom: 16 }}><h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{q.q}</h3></div>{q.options.map((opt, i) => { let bg = 'var(--bg-secondary)', border = 'var(--border)'; if (showResult) { if (i === q.answer) { bg = 'rgba(10,46,127,0.15)'; border = 'var(--primary)' } else if (i === selected) { bg = 'rgba(242,169,0,0.15)'; border = 'var(--gold)' } } else if (selected === i) { bg = 'rgba(10,46,127,0.1)'; border = 'var(--primary)' } return <button key={i} onClick={() => !showResult && setSelected(i)} disabled={showResult} className="active-scale" style={{ width: '100%', textAlign: 'left', padding: 16, marginBottom: 10, borderRadius: 14, border: `2px solid ${border}`, background: bg, cursor: showResult ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)' }}><span style={{ fontWeight: 600, marginRight: 12 }}>{String.fromCharCode(65 + i)}.</span>{opt}</button> })}<button onClick={showResult ? next : submit} disabled={selected === null && !showResult} className="btn btn-primary" style={{ width: '100%', marginTop: 8, opacity: selected === null && !showResult ? 0.5 : 1 }}>{showResult ? (current < quiz.length - 1 ? 'Next' : 'Results') : 'Submit'}</button></div></div>);
}

export function TimerScreen({ onBack, db }) {
  const [event, setEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => { if (!running || timeLeft <= 0) return; const i = setInterval(() => { setTimeLeft(t => { if (t <= 1) { setRunning(false); if (navigator.vibrate) navigator.vibrate([500, 200, 500]) } return t - 1 }) }, 1000); return () => clearInterval(i) }, [running, timeLeft]);

  const startTimer = ev => { setEvent(ev); setTimeLeft(ev.duration * 60); setRunning(false) };
  const formatTime = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const reset = () => { setRunning(false); setTimeLeft(event.duration * 60) };
  const timerColor = timeLeft <= 30 ? 'var(--gold)' : timeLeft <= 120 ? 'var(--gold)' : 'var(--primary)';

  if (!event) return (<div className="container"><Header title="Timer" showBack onBack={onBack} /><div style={{ padding: 16, paddingBottom: 100 }}><div className="bento-item large bento-gold" style={{ marginBottom: 20, textAlign: 'center' }}><Icons.Clock size={48} /><h2 style={{ fontSize: 20, fontWeight: 700, margin: '16px 0 8px' }}>Performance Timer</h2><p style={{ fontSize: 14, margin: 0 }}>Alerts at 2:00 and 0:30</p></div><h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Select Event</h3>{db.competitiveEvents.filter(e => e.type === 'performance').map(e => (<div key={e.id} className="resource-card hover-lift" onClick={() => startTimer(e)}><span style={{ fontSize: 28 }}>{e.icon}</span><div style={{ flex: 1 }}><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{e.name}</p><p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{e.duration} minutes</p></div><Icons.ChevronRight size={20} /></div>))}</div></div>);

  return (<div className="container"><Header title={event.name} showBack onBack={() => setEvent(null)} /><div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}><p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{event.duration} Min Performance</p><div style={{ fontSize: 72, fontWeight: 800, color: timerColor, fontFamily: 'monospace', marginBottom: 24 }}>{formatTime(timeLeft)}</div><svg width="200" height="200" style={{ marginBottom: 32 }}><circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="8" /><circle cx="100" cy="100" r="90" fill="none" stroke={timerColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={565} strokeDashoffset={565 - 565 * (timeLeft / (event.duration * 60))} transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset 1s linear' }} /></svg><div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 300 }}><button onClick={() => setRunning(!running)} className="btn btn-primary" style={{ flex: 1 }}>{running ? <><Icons.Pause size={18} /> Pause</> : <><Icons.Play size={18} /> Start</>}</button><button onClick={reset} className="btn btn-secondary" style={{ flex: 1 }}><Icons.RefreshCw size={18} /> Reset</button></div></div></div>);
}

export function ServiceHoursScreen({ user, db, setDb, onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hours: '', description: '', date: '' });
  const [error, setError] = useState('');
  const canApprove = hasPermission(user, 'approve_hours');
  const myHours = db.serviceHours.filter(h => h.userId === user.id);
  const pendingHours = canApprove ? db.serviceHours.filter(h => h.status === 'pending') : [];
  const approved = myHours.filter(h => h.status === 'approved').reduce((s, h) => s + h.hours, 0);
  const pending = myHours.filter(h => h.status === 'pending').reduce((s, h) => s + h.hours, 0);

  const submit = () => { if (!form.hours || !form.description || !form.date) { setError('Fill all fields'); return } if (!/^\d+(\.\d{1,2})?$/.test(form.hours)) { setError('Invalid hours'); return } setDb({ ...db, serviceHours: [...db.serviceHours, { id: Date.now().toString(), userId: user.id, hours: parseFloat(form.hours), description: form.description, date: form.date, status: 'pending', approvedBy: null }] }); setForm({ hours: '', description: '', date: '' }); setShowForm(false); setError('') };
  const approveHour = id => { setDb({ ...db, serviceHours: db.serviceHours.map(h => h.id === id ? { ...h, status: 'approved', approvedBy: user.id } : h) }) };
  const rejectHour = id => { setDb({ ...db, serviceHours: db.serviceHours.filter(h => h.id !== id) }) };

  return (<div className="container"><Header title="Service Hours" showBack onBack={onBack} /><div style={{ padding: 16, paddingBottom: 100 }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}><div className="bento-item bento-success"><p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{approved}</p><p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>Approved</p></div><div className="bento-item bento-gold"><p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{pending}</p><p style={{ fontSize: 12, margin: 0 }}>Pending</p></div></div><button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ width: '100%', marginBottom: 20 }}><Icons.Plus size={18} /> Log Hours</button>{canApprove && pendingHours.length > 0 && <><h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Pending Approval</h3>{pendingHours.map(h => { const member = db.users.find(u => u.id === h.userId); return (<div key={h.id} style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 14, marginBottom: 10, borderLeft: '4px solid var(--gold)' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><div><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{h.hours} hours - {member?.name}</p><p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0' }}>{h.description}</p><p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{h.date}</p></div></div><div style={{ display: 'flex', gap: 8 }}><button onClick={() => approveHour(h.id)} className="btn btn-sm btn-success" style={{ flex: 1 }}><Icons.Check size={14} /> Approve</button><button onClick={() => rejectHour(h.id)} className="btn btn-sm" style={{ flex: 1, background: 'rgba(242,169,0,0.16)', color: 'var(--gold)' }}><Icons.X size={14} /> Reject</button></div></div>) })}</>}<h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Your Hours</h3>{myHours.map(h => (<div key={h.id} style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 14, marginBottom: 10, borderLeft: `4px solid ${h.status === 'approved' ? 'var(--primary)' : 'var(--gold)'}` }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{h.hours} hours</p><span className={`badge ${h.status === 'approved' ? 'badge-success' : 'badge-gold'}`} style={{ fontSize: 10 }}>{h.status}</span></div><p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0' }}>{h.description}</p><p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{h.date}</p></div>))}{showForm && <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Log Service Hours</h3>{error && <div style={{ background: 'rgba(242,169,0,0.16)', borderRadius: 10, padding: 12, marginBottom: 14 }}><p style={{ color: 'var(--gold)', fontSize: 13, margin: 0 }}>{error}</p></div>}<div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Hours</label><input type="text" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="e.g., 5" className="input" /></div><div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe activity" className="input" style={{ minHeight: 80 }} /></div><div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input" /></div><div style={{ display: 'flex', gap: 12 }}><button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" style={{ flex: 1 }} onClick={submit}>Submit</button></div></div></div>}</div></div>);
}

export function RankingsScreen({ db, onBack }) {
  const rankings = [...db.users].filter(u => u.role === ROLES.STUDENT).sort((a, b) => b.points - a.points);
  const maxPoints = rankings[0]?.points || 1;

  return (
    <div className="container">
      <Header title="Rankings" showBack onBack={onBack} />
      <div className="rankings-screen" style={{ padding: 16, paddingBottom: 100 }}>
        {rankings.map((m, i) => (
          <div key={m.id} className="ranking-item">
            <div className={`ranking-position ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`} style={i > 2 ? { background: 'var(--bg-secondary)' } : {}}>{i + 1}</div>
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{m.avatar}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{m.name}</p>
              <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, marginTop: 6 }}>
                <div style={{ height: '100%', width: `${(m.points / maxPoints) * 100}%`, background: 'linear-gradient(90deg,var(--primary),var(--primary-light))', borderRadius: 3 }} />
              </div>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{m.points.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ChecklistScreen({ onBack }) {
  const [checked, setChecked] = useState({});
  const categories = [...new Set(CHECKLIST_ITEMS.map(i => i.category))];
  const total = CHECKLIST_ITEMS.length;
  const done = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((done / total) * 100);
  
  return (
    <div className="checklist-screen" style={{ padding: 16, paddingBottom: 170 }}>
      <div className="bento-item bento-pink" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Comp Day Prep</h3>
            <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>{done} of {total} items</p>
          </div>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{progress}%</span>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 8, background: 'rgba(255,255,255,0.3)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'white', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase' }}>{cat}</h3>
          {CHECKLIST_ITEMS.filter(i => i.category === cat).map(item => (
            <div key={item.id} className={`checklist-item ${checked[item.id] ? 'checked' : ''}`} onClick={() => setChecked({ ...checked, [item.id]: !checked[item.id] })}>
              <div className={`checkbox ${checked[item.id] ? 'checked' : ''}`}>{checked[item.id] && <Icons.Check size={16} color="white" />}</div>
              <span className="checklist-text" style={{ fontSize: 14 }}>{item.text}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AlbumScreen({ user, db, setDb, onBack }) {
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFileDataUrl, setSelectedFileDataUrl] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const canApprove = hasPermission(user, 'approve_photos');
  const curatedPhotos = [
    { id: 'curated-1', url: '/images/fbla-1.jpg', caption: 'NLC 2024' },
    { id: 'curated-2', url: '/images/fbla-2.jpg', caption: 'Beach Day' },
    { id: 'curated-3', url: '/images/fbla-3.jpg', caption: 'Conference Group' }
  ];
  const approved = curatedPhotos;
  const pending = db.photos.filter(p => p.status === 'pending');

  const openPhotoPicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onPickPhoto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFileDataUrl(String(reader.result || ''));
      setShowUpload(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const uploadPhoto = () => {
    if (!caption || !selectedFileDataUrl) return;
    setDb({
      ...db,
      photos: [
        ...db.photos,
        {
          id: Date.now().toString(),
          userId: user.id,
          url: selectedFileDataUrl,
          caption,
          status: 'pending',
          approvedBy: null,
          timestamp: Date.now()
        }
      ]
    });
    setCaption('');
    setSelectedFileDataUrl('');
    setShowUpload(false);
  };

  const approvePhoto = id => {
    setDb({ ...db, photos: db.photos.map(p => p.id === id ? { ...p, status: 'approved', approvedBy: user.id } : p) });
  };

  const rejectPhoto = id => {
    setDb({ ...db, photos: db.photos.filter(p => p.id !== id) });
  };

  return (
    <div className="container">
      <Header title="Chapter Album" showBack onBack={onBack} />
      <div style={{ padding: 16, paddingBottom: 100 }}>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickPhoto} />
        <button onClick={openPhotoPicker} className="btn btn-primary" style={{ width: '100%', marginBottom: 20 }}>
          <Icons.Upload size={18} /> Upload Photo
        </button>

        {canApprove && pending.length > 0 && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Pending Approval ({pending.length})</h3>
            <div className="photo-grid" style={{ marginBottom: 20 }}>
              {pending.map(p => {
                const member = db.users.find(u => u.id === p.userId);
                return (
                  <div key={p.id} className="photo-item" style={{ position: 'relative' }}>
                    <img src={p.url} alt={p.caption} onClick={() => setSelectedPhoto({ url: p.url, caption: p.caption })} style={{ cursor: 'pointer' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                      <p style={{ color: 'white', fontSize: 10, marginBottom: 8, textAlign: 'center' }}>{member?.name}: {p.caption}</p>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => approvePhoto(p.id)} className="btn btn-sm" style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px' }}><Icons.Check size={12} /></button>
                        <button onClick={() => rejectPhoto(p.id)} className="btn btn-sm" style={{ background: 'var(--gold)', color: 'white', padding: '6px 12px' }}><Icons.X size={12} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Album ({approved.length})</h3>
        <div className="photo-grid">
          {approved.map(p => (
            <div key={p.id} className="photo-item" onClick={() => setSelectedPhoto(p)} style={{ cursor: 'pointer' }}>
              <img src={p.url} alt={p.caption} />
            </div>
          ))}
        </div>

        {selectedPhoto && (
          <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, padding: 12 }}>
              <button className="btn btn-sm btn-secondary" style={{ marginBottom: 10 }} onClick={() => setSelectedPhoto(null)}><Icons.X size={14} /> Close</button>
              <img src={selectedPhoto.url} alt={selectedPhoto.caption} style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 12 }} />
              {selectedPhoto.caption && <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>{selectedPhoto.caption}</p>}
            </div>
          </div>
        )}

        {showUpload && (
          <div className="modal-overlay" onClick={() => setShowUpload(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Upload Photo</h3>
              <div style={{ width: '100%', height: 220, background: 'var(--bg-secondary)', borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {selectedFileDataUrl ? <img src={selectedFileDataUrl} alt="Selected upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <p style={{ color: 'var(--text-secondary)' }}>No image selected</p>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Caption</label>
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Describe this photo" className="input" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowUpload(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={uploadPhoto}>Upload</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResourcesScreen({ db, setDb, settings }) {
  const { isOnline, autoDownload } = settings;
  const [resourceTab, setResourceTab] = useState(() => sessionStorage.getItem('fbla_resources_tab') || 'rubrics');
  useEffect(() => {
    sessionStorage.setItem('fbla_resources_tab', resourceTab);
  }, [resourceTab]);
  const existingByEvent = new Map(db.resources.map(r => [r.eventId, r]));
  const legacyToSlug = {
    accounting1: 'accounting',
    'cyber-security': 'cybersecurity',
    impromptu: 'impromptu-speaking',
    'public-speaking': 'public-speaking',
    'business-management': 'business-management',
    marketing: 'marketing',
    economics: 'economics',
    entrepreneurship: 'entrepreneurship',
    'personal-finance': 'personal-finance'
  };
  const existingBySlug = new Map(db.resources.map(r => [legacyToSlug[r.eventId] || r.eventId, r]));

  const rubricResources = RESOURCE_EVENTS.map(([name, slug]) => {
    const existing = existingBySlug.get(slug) || existingByEvent.get(slug);
    return {
      id: existing?.id || `generated-${slug}`,
      eventId: slug,
      title: `${name} Rubric`,
      downloaded: Boolean(existing?.downloaded),
      file: `/rubrics/${slug}.pdf`,
      openResolver: () => resolvePdfPath(slug)
    };
  });

  const mapResources = [
    { id: 'map-slc', eventId: 'map-slc', title: 'SLC Map', downloaded: Boolean(existingByEvent.get('map-slc')?.downloaded), file: '/docs/maps/SLC-Map.pdf', openResolver: async () => '/docs/maps/SLC-Map.pdf' },
    { id: 'map-nlc', eventId: 'map-nlc', title: 'NLC Map', downloaded: Boolean(existingByEvent.get('map-nlc')?.downloaded), file: '/docs/maps/NLC-Map.pdf', openResolver: async () => '/docs/maps/NLC-Map.pdf' }
  ];

  const scheduleResources = [
    { id: 'schedule-slc', eventId: 'schedule-slc', title: 'SLC Event Schedule', downloaded: Boolean(existingByEvent.get('schedule-slc')?.downloaded), file: '/docs/schedules/SLC-Event-Schedule.pdf', openResolver: async () => '/docs/schedules/SLC-Event-Schedule.pdf' }
  ];

  const tabResources = resourceTab === 'maps' ? mapResources : resourceTab === 'schedule' ? scheduleResources : rubricResources;
  const visible = isOnline ? tabResources : tabResources.filter(r => r.downloaded || autoDownload);

  const handleDownload = resource => {
    const exists = db.resources.find(r => r.eventId === resource.eventId);
    if (exists) {
      setDb({ ...db, resources: db.resources.map(r => r.eventId === resource.eventId ? { ...r, downloaded: true } : r) });
      return;
    }
    setDb({ ...db, resources: [...db.resources, { id: resource.id, eventId: resource.eventId, title: resource.title, downloaded: true, file: resource.file, type: 'pdf', pages: '--' }] });
  };

  const handleOpen = async resource => {
    if (!(resource.downloaded || autoDownload)) return;
    const filePath = await resource.openResolver();
    window.open(filePath, '_blank');
  };

  return (
    <div className="resources-screen" style={{ padding: 16, paddingBottom: 120 }}>
      {!isOnline && (
        <div style={{ background: 'rgba(242,169,0,0.16)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--gold)', margin: 0 }}><strong>Offline Mode:</strong> Only downloaded resources shown</p>
        </div>
      )}

      <div className="tab-bar" style={{ marginBottom: 14 }}>
        <button className={`tab ${resourceTab === 'rubrics' ? 'active' : ''}`} onClick={() => setResourceTab('rubrics')}>Rubrics</button>
        <button className={`tab ${resourceTab === 'maps' ? 'active' : ''}`} onClick={() => setResourceTab('maps')}>Maps</button>
        <button className={`tab ${resourceTab === 'schedule' ? 'active' : ''}`} onClick={() => setResourceTab('schedule')}>Event Schedule</button>
      </div>

      {visible.map(r => {
        const openable = r.downloaded || autoDownload;
        return (
          <div key={r.id} className="resource-card hover-lift">
            <div className="resource-icon" style={{ width: 42, height: 42, borderRadius: 10, background: openable ? 'rgba(10,46,127,0.15)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {openable ? <Icons.Check size={22} color="var(--primary)" /> : <Icons.File size={22} color="var(--text-secondary)" />}
            </div>
            <div className="resource-main">
              <p className="resource-title-line">{r.title}</p>
              <div className="resource-actions-row">
                <button onClick={() => !r.downloaded && handleDownload(r)} className="btn btn-sm btn-secondary" disabled={r.downloaded} style={{ opacity: r.downloaded ? 0.65 : 1 }}>
                  <Icons.Download size={14} /> {r.downloaded ? 'Downloaded' : 'Download'}
                </button>
                <button onClick={() => handleOpen(r)} className="btn btn-sm btn-primary" disabled={!openable} style={{ opacity: openable ? 1 : 0.5 }}>
                  <Icons.ExternalLink size={14} /> View
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnnouncementsScreen({ user, db, setDb, onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' });
  const canCreate = hasPermission(user, 'create_announcements');
  const createAnnouncement = () => { if (!form.title || !form.content) return; setDb({ ...db, announcements: [{ id: Date.now().toString(), userId: user.id, title: form.title, content: form.content, priority: form.priority, timestamp: Date.now() }, ...db.announcements] }); setForm({ title: '', content: '', priority: 'normal' }); setShowForm(false) };

  return (<div className="container"><Header title="Announcements" showBack onBack={onBack} /><div className="announcements-screen" style={{ padding: 16, paddingBottom: 100 }}>{canCreate && <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ width: '100%', marginBottom: 20 }}><Icons.Plus size={18} /> Create Announcement</button>}{db.announcements.map(ann => { const author = db.users.find(u => u.id === ann.userId); return (<div key={ann.id} className="announcement-card" style={{ background: 'var(--card)', borderRadius: 16, padding: 16, marginBottom: 12, borderLeft: `4px solid ${ann.priority === 'high' ? 'var(--gold)' : '#F2A900'}`, border: '1px solid var(--border)' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{ann.title}</h3>{ann.priority === 'high' && <span className="badge badge-error" style={{ fontSize: 10 }}>Important</span>}</div><p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>{ann.content}</p><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{author?.avatar}</div><p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{author?.name}</p></div><p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{new Date(ann.timestamp).toLocaleDateString()}</p></div></div>) })}{showForm && <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Create Announcement</h3><div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" className="input" /></div><div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Content</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Announcement content" className="input" style={{ minHeight: 100 }} /></div><div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Priority</label><div style={{ display: 'flex', gap: 8 }}><button className={`filter-chip ${form.priority === 'normal' ? 'active' : ''}`} onClick={() => setForm({ ...form, priority: 'normal' })}>Normal</button><button className={`filter-chip ${form.priority === 'high' ? 'active' : ''}`} onClick={() => setForm({ ...form, priority: 'high' })}>High Priority</button></div></div><div style={{ display: 'flex', gap: 12 }}><button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" style={{ flex: 1 }} onClick={createAnnouncement}>Post</button></div></div></div>}</div></div>);
}

export function ChaperoneScreen({ user, db, setDb, onBack }) {
  const students = db.users.filter(u => [ROLES.STUDENT, ROLES.STUDENT_LEADER, ROLES.LEADER].includes(u.role));
  const schedules = db.checkInSchedules || [];
  const records = db.checkInRecords || [];
  const [tab, setTab] = useState('schedule');
  const [form, setForm] = useState({
    title: 'Daily Check-In',
    startDate: new Date().toISOString().slice(0, 10),
    time: '08:00',
    days: 7
  });

  const createSchedule = () => {
    if (!form.title || !form.startDate || !form.time) return;
    const scheduleId = `checkin_${Date.now()}`;
    const dayCount = Math.max(1, Math.min(7, Number(form.days) || 7));
    const newSchedule = {
      id: scheduleId,
      title: form.title,
      startDate: form.startDate,
      time: form.time,
      days: dayCount,
      createdBy: user.id
    };

    const generatedEvents = Array.from({ length: dayCount }).map((_, i) => {
      const d = new Date(form.startDate + 'T12:00:00');
      d.setDate(d.getDate() + i);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        id: `${scheduleId}_${i}`,
        title: `Check-In: ${form.title}`,
        date,
        time: form.time,
        location: 'Check-In Station',
        type: 'checkin',
        color: '#F2A900',
        createdBy: user.id
      };
    });

    setDb({
      ...db,
      checkInSchedules: [...schedules, newSchedule],
      events: [...db.events, ...generatedEvents]
    });
  };

  const toggleRecord = (scheduleId, studentId) => {
    const existing = records.find(r => r.scheduleId === scheduleId && r.studentId === studentId);
    if (existing) {
      setDb({
        ...db,
        checkInRecords: records.filter(r => !(r.scheduleId === scheduleId && r.studentId === studentId))
      });
      return;
    }
    setDb({
      ...db,
      checkInRecords: [...records, { id: `record_${Date.now()}`, scheduleId, studentId, checkedBy: user.id, timestamp: Date.now() }]
    });
  };

  return (
    <div className="container">
      <Header title="Chaperone Check-Ins" showBack onBack={onBack} />
      <div style={{ padding: 16, paddingBottom: 100 }}>
        <div className="tab-bar" style={{ marginBottom: 16 }}>
          <button className={`tab ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>Set Times</button>
          <button className={`tab ${tab === 'mark' ? 'active' : ''}`} onClick={() => setTab('mark')}>Check Off</button>
        </div>

        {tab === 'schedule' && (
          <>
            <div className="settings-item" style={{ marginBottom: 12 }}>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Check-In Title</label>
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div className="settings-item" style={{ margin: 0 }}>
                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Start Date</label>
                  <input type="date" className="input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
              </div>
              <div className="settings-item" style={{ margin: 0 }}>
                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Time</label>
                  <input type="time" className="input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="settings-item" style={{ marginBottom: 12 }}>
              <div style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Days (1-7)</label>
                <input type="number" min={1} max={7} className="input" value={form.days} onChange={e => setForm({ ...form, days: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={createSchedule}><Icons.Plus size={16} /> Create Check-In Schedule</button>
            <h3 style={{ marginBottom: 10 }}>Created Schedules</h3>
            {schedules.map(s => <div key={s.id} className="resource-card"><div style={{ flex: 1 }}><p style={{ margin: 0, fontWeight: 700 }}>{s.title}</p><p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{s.startDate} @ {formatMeridiem(s.time)} @ {s.days} day(s)</p></div></div>)}
            {schedules.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No check-in schedules created yet.</p>}
          </>
        )}

        {tab === 'mark' && (
          <>
            {schedules.map(schedule => (
              <div key={schedule.id} className="post-card">
                <p style={{ fontWeight: 700, marginBottom: 8 }}>{schedule.title}</p>
                {students.map(student => {
                  const checked = records.some(r => r.scheduleId === schedule.id && r.studentId === student.id);
                  return (
                    <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span>{student.name}</span>
                      <button className={`btn btn-sm ${checked ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleRecord(schedule.id, student.id)}>
                        {checked ? 'Checked' : 'Mark'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
            {schedules.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Create a schedule in "Set Times" first.</p>}
          </>
        )}
      </div>
    </div>
  );
}




