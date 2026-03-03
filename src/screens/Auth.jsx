import React, { useState, useEffect } from 'react';
import { FBLALogo, LoadingDots } from '../components/Shared';
import { Icons } from '../components/Icons';
import { ROLES } from '../data';

export function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => { const i = setInterval(() => { setProgress(p => { if (p >= 100) { clearInterval(i); setTimeout(onComplete, 300); return 100; } return p + 4; }); }, 50); return () => clearInterval(i); }, [onComplete]);
  return (<div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0a2e7f 0%,#002a42 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}><div className="animate-float" style={{ marginBottom: 32 }}><FBLALogo size={100} /></div><h1 style={{ color: 'white', fontSize: 32, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>FBLA Connect</h1><p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 48 }}>Future Business Leaders of America</p><div style={{ width: '80%', maxWidth: 280, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#F2A900,#fbbf24)', borderRadius: 2, transition: 'width 0.1s' }} /></div></div>);
}

export function LoginScreen({ onLogin, db }) {
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [chaperoneName, setChaperoneName] = useState('');

  const handleLogin = () => { if (!memberId || !password) { setError('Please fill all fields'); return; } setLoading(true); setError(''); setTimeout(() => { const user = db.users.find(u => u.memberId === memberId); if (user && password === 'password123') { onLogin(user); } else { setError('Invalid credentials'); setLoading(false); } }, 1000); };
  const handleGoogleLogin = () => { setLoading(true); setTimeout(() => onLogin(db.users[0]), 1500); };
  const handleChaperoneLogin = () => {
    if (!chaperoneName) { setError('Enter your name'); return; }
    setLoading(true);
    setTimeout(() => {
      const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
      onLogin({
        id: 'chap_' + Date.now(),
        memberId: 'TEMP_CHAP',
        name: chaperoneName,
        role: ROLES.CHAPERONE,
        chapter: 'Lincoln High',
        avatar: chaperoneName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        points: 0,
        bio: 'Temporary competition chaperone account',
        expiresAt
      });
    }, 1000);
  };

  return (<div className="container" style={{ minHeight: '100vh', background: 'linear-gradient(180deg,var(--primary) 0%,var(--primary) 35%,var(--bg) 35%)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}><div style={{ padding: '40px 24px 50px', textAlign: 'center' }} className="animate-fadeInUp"><FBLALogo size={70} /><h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginTop: 16 }}>{mode === 'login' ? 'Welcome Back' : 'Chaperone Access'}</h1></div><div style={{ background: 'var(--card)', borderRadius: '32px 32px 0 0', padding: '28px 24px 40px', minHeight: 'calc(100vh - 200px)', marginTop: -26 }}>{mode === 'login' ? (<><button onClick={handleGoogleLogin} disabled={loading} className="btn btn-secondary active-scale" style={{ width: '100%', marginBottom: 12 }}>{loading ? <LoadingDots /> : <><Icons.Google size={20} /> Continue with Google</>}</button><button onClick={handleGoogleLogin} disabled={loading} className="btn btn-primary active-scale" style={{ width: '100%', marginBottom: 20 }}>{loading ? <LoadingDots /> : <><FBLALogo size={18} /> Sign in with FBLA Connect</>}</button><div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}><div style={{ flex: 1, height: 1, background: 'var(--border)' }} /><span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>or use Member ID</span><div style={{ flex: 1, height: 1, background: 'var(--border)' }} /></div><div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Member ID</label><input type="text" value={memberId} onChange={e => setMemberId(e.target.value)} placeholder="e.g., FBLA001" className="input" /></div><div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="input" onKeyPress={e => e.key === 'Enter' && handleLogin()} /></div>{error && <div style={{ background: 'rgba(242,169,0,0.16)', borderRadius: 10, padding: 12, marginBottom: 14 }}><p style={{ color: 'var(--gold)', fontSize: 13, margin: 0 }}>{error}</p></div>}<button onClick={handleLogin} disabled={loading} className="btn btn-primary active-scale" style={{ width: '100%' }}>{loading ? <LoadingDots /> : 'Sign In'}</button><button onClick={() => setMode('chaperone')} className="btn btn-secondary active-scale" style={{ width: '100%', marginTop: 12 }}><Icons.Shield size={18} /> Chaperone Access</button><div style={{ marginTop: 20, padding: 14, background: 'var(--bg-secondary)', borderRadius: 12, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}><strong>Demo Accounts:</strong><br />FBLA001 Student | FBLA002 Student Leader | FBLA003 Advisor | FBLA008 Chaperone<br />Password: password123</div></>) : (<><div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Your Name</label><input type="text" value={chaperoneName} onChange={e => setChaperoneName(e.target.value)} placeholder="Full name" className="input" /></div><p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Temporary account will be valid for 7 days.</p>{error && <div style={{ background: 'rgba(242,169,0,0.16)', borderRadius: 10, padding: 12, marginBottom: 14 }}><p style={{ color: 'var(--gold)', fontSize: 13, margin: 0 }}>{error}</p></div>}<button onClick={handleChaperoneLogin} disabled={loading} className="btn btn-primary active-scale" style={{ width: '100%' }}>{loading ? <LoadingDots /> : 'Create 7-Day Temporary Account'}</button><button onClick={() => setMode('login')} className="btn btn-secondary active-scale" style={{ width: '100%', marginTop: 12 }}><Icons.ChevronLeft size={18} /> Back to Login</button></>)}</div></div>);
}


