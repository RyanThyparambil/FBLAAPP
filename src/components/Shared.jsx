import React, { useContext } from 'react';
import { ThemeContext, AuthContext, SettingsContext } from '../contexts';
import { Icons } from './Icons';

export const FBLALogo = ({ size = 60 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.22, overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.2)', background: 'transparent' }}>
    <img src="/images/fbla-app-icon.png" alt="FBLA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
  </div>
);

export const LoadingDots = () => <div className="dot-loading"><span></span><span></span><span></span></div>;
export const Skeleton = ({ width = '100%', height = 20 }) => <div className="skeleton" style={{ width, height }} />;

export function Header({ title, showBack, onBack }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const { isOnline } = useContext(SettingsContext);
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--primary)' }}>
      {!isOnline && <div className="offline-banner"><Icons.WifiOff size={14} /> Offline Mode</div>}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {showBack ? <button onClick={onBack} className="active-scale" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: 8, color: 'white', cursor: 'pointer', display: 'flex' }}><Icons.ChevronLeft size={20} /></button> : <FBLALogo size={32} />}
          <h1 style={{ color: 'var(--gold)', fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)', margin: 0 }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={toggleTheme} className="active-scale" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: 8, color: 'white', cursor: 'pointer', display: 'flex' }}>
            {theme === 'dark' ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
          </button>
          <button onClick={logout} className="active-scale" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: 8, color: 'white', cursor: 'pointer', display: 'flex' }}>
            <Icons.LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', Icon: Icons.Home },
    { id: 'social', label: 'Social', Icon: Icons.Users },
    { id: 'compete', label: 'Compete', Icon: Icons.Trophy },
    { id: 'calendar', label: 'Calendar', Icon: Icons.Calendar },
    { id: 'settings', label: 'Settings', Icon: Icons.Settings }
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}>
          <tab.Icon size={22} /><span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
