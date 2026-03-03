import React, { useState, useEffect, useRef } from 'react';
import { ThemeContext, AuthContext, SettingsContext } from './contexts';
import { initialDB, ROLES } from './data';
import { LoginScreen } from './screens/Auth';
import { Icons } from './components/Icons';
import { HomeScreen, FundraisingScreen, SocialScreen, CompeteScreen, CalendarScreen, SettingsScreen } from './screens/MainScreens';
import { QuizScreen, ServiceHoursScreen, RankingsScreen, ChecklistScreen, AlbumScreen, ResourcesScreen, AnnouncementsScreen, ChaperoneScreen } from './screens/FeatureScreens';

export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('fbla_theme') || 'light');
  const [db, setDb] = useState(initialDB);
  const [screen, setScreen] = useState(null);
  const [screenData, setScreenData] = useState(null);
  const [rootTab, setRootTab] = useState('home');
  const [isOnline, setIsOnline] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);
  const canSwipe = useRef(false);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('fbla_theme', theme); }, [theme]);
  useEffect(() => {
    // Always start at sign-in screen; do not auto-restore prior sessions.
    localStorage.removeItem('fbla_user');
  }, []);
  useEffect(() => {
    if (!screen) return;
    setPanelOpen(false);
    const id = requestAnimationFrame(() => setPanelOpen(true));
    return () => cancelAnimationFrame(id);
  }, [screen]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const login = u => { setUser(u); setRootTab('home'); localStorage.setItem('fbla_user', JSON.stringify(u)); };
  const logout = () => { localStorage.removeItem('fbla_user'); setUser(null); setScreen(null); setPanelOpen(false); };
  const navigate = (s, data = null) => {
    if (s === 'home') {
      closePanel();
      return;
    }
    setScreen(s);
    setScreenData(data);
  };
  const switchRoot = tab => {
    if (screen) closePanel();
    setRootTab(tab);
  };
  const closePanel = () => {
    if (!screen) return;
    setPanelOpen(false);
    setDragX(0);
    setIsDragging(false);
    setTimeout(() => {
      setScreen(null);
      setScreenData(null);
    }, 950);
  };
  const back = () => closePanel();

  const settings = { isOnline, setIsOnline, autoDownload, setAutoDownload };

  if (!user) return <ThemeContext.Provider value={{ theme, toggleTheme }}><AuthContext.Provider value={{ user, login, logout }}><SettingsContext.Provider value={settings}><LoginScreen onLogin={login} db={db} /></SettingsContext.Provider></AuthContext.Provider></ThemeContext.Provider>;

  const Wrapper = ({ children }) => <ThemeContext.Provider value={{ theme, toggleTheme }}><AuthContext.Provider value={{ user, login, logout }}><SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider></AuthContext.Provider></ThemeContext.Provider>;

  const screenTitles = {
    quiz: 'AI Quiz',
    service: 'Service Hours',
    rankings: 'Rankings',
    checklist: 'Checklist',
    album: 'Album',
    resources: 'Resources',
    announcements: 'Announcements',
    social: 'Social',
    compete: 'Compete',
    calendar: 'Calendar',
    settings: 'Settings',
    chaperone: 'Chaperone'
  };

  const renderScreen = () => {
    if (screen === 'quiz') return <QuizScreen onBack={back} db={db} />;
    if (screen === 'service') return <ServiceHoursScreen user={user} db={db} setDb={setDb} onBack={back} />;
    if (screen === 'rankings') return <RankingsScreen db={db} onBack={back} />;
    if (screen === 'checklist') return <ChecklistScreen onBack={back} />;
    if (screen === 'album') return <AlbumScreen user={user} db={db} setDb={setDb} onBack={back} />;
    if (screen === 'resources') return <ResourcesScreen db={db} setDb={setDb} settings={settings} onBack={back} onNavigate={navigate} />;
    if (screen === 'announcements') return <AnnouncementsScreen user={user} db={db} setDb={setDb} onBack={back} />;
    if (screen === 'social') return <SocialScreen user={user} db={db} setDb={setDb} initialTab={screenData?.tab || 'feed'} />;
    if (screen === 'compete') return <CompeteScreen onNavigate={navigate} db={db} />;
    if (screen === 'calendar') return <CalendarScreen user={user} db={db} setDb={setDb} />;
    if (screen === 'settings') return <SettingsScreen user={user} setUser={setUser} db={db} setDb={setDb} settings={settings} setSettings={{ setIsOnline, setAutoDownload }} />;
    if (screen === 'chaperone') return <ChaperoneScreen user={user} db={db} setDb={setDb} onBack={back} />;
    return null;
  };

  const beginSwipe = (x, y) => {
    swipeStartX.current = x ?? 0;
    swipeStartY.current = y ?? 0;
    canSwipe.current = true;
    setIsDragging(false);
    setDragX(0);
  };

  const moveSwipe = (x, y, preventDefault) => {
    if (!canSwipe.current) return;
    const dxRaw = x - swipeStartX.current;
    const dy = Math.abs(y - swipeStartY.current);
    if (!isDragging) {
      if (dxRaw > 10 && dxRaw > dy) setIsDragging(true);
      else return;
    }
    const dx = Math.max(0, dxRaw);
    setDragX(dx);
    if (dx > 0 && preventDefault) preventDefault();
  };

  const endSwipe = () => {
    if (isDragging && dragX > 100) {
      closePanel();
    } else {
      setDragX(0);
    }
    canSwipe.current = false;
    setIsDragging(false);
  };

  const onPanelPointerDown = e => beginSwipe(e.clientX, e.clientY);
  const onPanelPointerMove = e => moveSwipe(e.clientX ?? 0, e.clientY ?? 0, () => e.preventDefault());
  const onPanelPointerUp = () => endSwipe();
  const onPanelTouchStart = e => {
    const t = e.touches?.[0];
    beginSwipe(t?.clientX ?? 0, t?.clientY ?? 0);
  };
  const onPanelTouchMove = e => {
    const t = e.touches?.[0];
    moveSwipe(t?.clientX ?? 0, t?.clientY ?? 0, () => e.preventDefault());
  };
  const onPanelTouchEnd = () => endSwipe();

  return (
    <Wrapper>
      <div className={`container ${screen ? 'screen-view' : 'home-view'}`}>
        <main>
          <div className="root-tabs-wrap">
            <section className={`root-tab-pane ${rootTab === 'home' ? 'active' : ''}`}>
              <HomeScreen user={user} db={db} setDb={setDb} onNavigate={navigate} settings={settings} />
            </section>
            <section className={`root-tab-pane ${rootTab === 'fundraising' ? 'active' : ''}`}>
              <FundraisingScreen user={user} />
            </section>
          </div>
        </main>
        <div className="app-floating-dock">
          <button type="button" className={`dock-btn ${rootTab === 'home' ? 'active' : ''}`} onClick={() => switchRoot('home')} aria-label="Home">
            <img src="/images/fbla-app-icon.png" alt="FBLA" onError={e => { e.currentTarget.style.display = 'none'; }} />
          </button>
          <button type="button" className={`dock-btn ${rootTab === 'fundraising' ? 'active' : ''}`} onClick={() => switchRoot('fundraising')} aria-label="Fundraising">
            <Icons.DollarSign size={20} />
          </button>
        </div>
        {screen && (
          <section
            className={`route-panel ${panelOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
            style={isDragging ? { transform: `translateX(${dragX}px)` } : undefined}
            onPointerDown={onPanelPointerDown}
            onPointerMove={onPanelPointerMove}
            onPointerUp={onPanelPointerUp}
            onPointerCancel={onPanelPointerUp}
            onTouchStart={onPanelTouchStart}
            onTouchMove={onPanelTouchMove}
            onTouchEnd={onPanelTouchEnd}
            onTouchCancel={onPanelTouchEnd}
          >
            <div className="route-topbar">
              <div className="route-topbar-left">
                <button type="button" className="route-close" onClick={closePanel}>
                  <Icons.X size={18} />
                </button>
                <h2>{screenTitles[screen] || 'Details'}</h2>
              </div>
              <div className="route-top-actions">
                <button type="button" className="route-top-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'dark' ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
                </button>
                <button type="button" className="route-top-icon-btn" onClick={logout} aria-label="Sign out">
                  <Icons.LogOut size={16} />
                </button>
              </div>
            </div>
            <div className="route-content">
              {renderScreen()}
            </div>
          </section>
        )}
      </div>
    </Wrapper>
  );
}
