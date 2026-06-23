'use client';
import { useState, useRef, useEffect } from 'react';
import { FiSun, FiMoon, FiBell, FiSearch, FiVideo, FiMenu, FiX, FiHome, FiStar, FiRadio, FiUser, FiLogOut, FiDownload } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { VIDEOS } from '@/utils/data';

export default function Navbar() {
  const { user, logout, theme, toggleTheme, location } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const navRefs = useRef({});

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const targetPath = hoveredPath || pathname;
    const targetNode = navRefs.current[targetPath];

    if (targetNode) {
      setPillStyle({
        left: targetNode.offsetLeft,
        width: targetNode.offsetWidth,
        opacity: 1
      });
    } else {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredPath, pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  function handleSearch(e) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const results = VIDEOS.filter(v =>
        v.title.toLowerCase().includes(q.toLowerCase()) ||
        v.channel.toLowerCase().includes(q.toLowerCase()) ||
        v.category.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }

  function handleMobileSearch(e) {
    const q = e.target.value;
    setMobileSearchQuery(q);
    if (q.trim().length > 1) {
      const results = VIDEOS.filter(v =>
        v.title.toLowerCase().includes(q.toLowerCase()) ||
        v.channel.toLowerCase().includes(q.toLowerCase()) ||
        v.category.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }

  function handleSearchSelect(video) {
    setSearchQuery('');
    setMobileSearchQuery('');
    setShowSearch(false);
    setMobileMenuOpen(false);
    router.push(`/watch/${video.id}`);
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: <FiHome size={18} /> },
    { href: '/premium', label: 'Premium', icon: <FiStar size={18} /> },
    { href: '/room', label: 'Live Room', icon: <FiRadio size={18} /> },
  ];

  const planBadge = user?.plan ? {
    free: { icon: '', color: '#94a3b8' },
    bronze: { icon: '', color: '#cd7c2f' },
    silver: { icon: '', color: '#cbd5e1' },
    gold: { icon: '', color: '#f59e0b' },
  }[user.plan] : null;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
            <div className="navbar-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiVideo size={22} color="white" /></div>
            StreamNova
          </Link>

          {/* Desktop Search */}
          <div className="navbar-search hide-mobile" ref={searchRef}>
            <span className="navbar-search-icon"><FiSearch size={18} /></span>
            <input
              type="text"
              placeholder="Search videos, channels..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery.length > 1 && setShowSearch(true)}
            />
            {showSearch && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(v => (
                  <div key={v.id} className="search-result-item" onClick={() => handleSearchSelect(v)}>
                    <div className="search-result-thumb">
                      <img src={v.thumbnail} alt={v.title} />
                    </div>
                    <div>
                      <div className="search-result-title">{v.title}</div>
                      <div className="search-result-channel">{v.channel} • {v.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links (Desktop) + Actions */}
          <div className="navbar-actions" onMouseLeave={() => setHoveredPath(null)} style={{ position: 'relative', display: 'flex', gap: 4 }}>
            {/* Sliding Pill */}
            <div 
              className="hide-mobile"
              style={{
                position: 'absolute',
                top: 0, bottom: 0,
                left: pillStyle.left,
                width: pillStyle.width,
                opacity: pillStyle.opacity,
                background: 'rgba(99,102,241,0.1)',
                borderRadius: 'var(--radius-full)',
                transition: 'all 0.35s cubic-bezier(0.2, 1, 0.3, 1)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            {/* Desktop Nav Links */}
            {navLinks.map(l => (
              <Link 
                key={l.href} 
                href={l.href} 
                ref={el => navRefs.current[l.href] = el}
                onMouseEnter={() => setHoveredPath(l.href)}
                className={`nav-link hide-mobile ${pathname === l.href ? 'active' : ''}`}
                style={{ position: 'relative', zIndex: 1 }}
              >
                {l.label}
              </Link>
            ))}

            {/* Theme Toggle */}
            <button className="nav-icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Notifications */}
            {user && (
              <div className="dropdown" ref={notifRef}>
                <button 
                  className="nav-icon-btn" 
                  title="Notifications" 
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}
                >
                  <FiBell size={20} />
                  <span className="nav-badge">3</span>
                </button>
                {notifOpen && (
                  <div className="dropdown-menu" style={{ minWidth: 280, padding: 8 }}>
                    <div style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      Notifications
                    </div>
                    <div className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Welcome to StreamNova!</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Explore premium features today.</div>
                    </div>
                    <div className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>New Live Room feature</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Co-watch with friends in real-time.</div>
                    </div>
                    <div className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Update your profile</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Add an avatar to personalize your account.</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth — Desktop Only */}
            {user ? (
              <div className="dropdown hide-mobile" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <div className="avatar" style={{ background: planBadge ? `linear-gradient(135deg, ${planBadge.color}88, ${planBadge.color})` : undefined }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {planBadge && <span style={{ fontSize: '1rem' }}>{planBadge.icon}</span>}
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, cursor: 'default' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email || user.phone}</span>
                      {user.plan && (
                        <span className={`badge badge-${user.plan}`} style={{ marginTop: 4 }}>
                          {planBadge?.icon} {user.plan?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Link href="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      My Profile
                    </Link>
                    <Link href="/profile?tab=downloads" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Downloads
                    </Link>
                    <Link href="/premium" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Upgrade Plan
                    </Link>
                    <button className="dropdown-item danger" style={{ width: '100%', textAlign: 'left' }} onClick={() => { logout(); setDropdownOpen(false); }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="btn btn-primary btn-sm hide-mobile">
                Sign In
              </Link>
            )}

            {/* Hamburger — Mobile Only */}
            <button 
              className="navbar-hamburger show-mobile"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen 
                ? <FiX size={20} color="var(--text-primary)" />
                : <>
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                  </>
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Mobile Search */}
        <div style={{ position: 'relative' }}>
          <div className="navbar-mobile-search">
            <FiSearch size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search videos, channels..."
              value={mobileSearchQuery}
              onChange={handleMobileSearch}
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 16, right: 16,
              background: 'var(--bg-dropdown)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-dropdown)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 200,
              overflow: 'hidden',
            }}>
              {searchResults.map(v => (
                <div key={v.id} className="search-result-item" onClick={() => handleSearchSelect(v)}>
                  <div className="search-result-thumb"><img src={v.thumbnail} alt={v.title} /></div>
                  <div>
                    <div className="search-result-title">{v.title}</div>
                    <div className="search-result-channel">{v.channel} • {v.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Nav Links */}
        {navLinks.map(l => (
          <Link 
            key={l.href}
            href={l.href}
            className={`navbar-mobile-link ${pathname === l.href ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {l.icon} {l.label}
          </Link>
        ))}

        <div className="navbar-mobile-divider" />

        {/* Mobile User Section */}
        {user ? (
          <>
            <div style={{ padding: '10px 20px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ background: planBadge ? `linear-gradient(135deg, ${planBadge.color}88, ${planBadge.color})` : undefined }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email || user.phone}</div>
              </div>
            </div>
            <Link href="/profile" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <FiUser size={18} /> My Profile
            </Link>
            <Link href="/profile?tab=downloads" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <FiDownload size={18} /> Downloads
            </Link>
            <Link href="/premium" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <FiStar size={18} /> Upgrade Plan
            </Link>
            <div className="navbar-mobile-divider" />
            <button 
              className="navbar-mobile-link" 
              style={{ color: 'var(--danger)', width: '100%', textAlign: 'left', background: 'none', border: 'none', fontFamily: 'inherit', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, borderLeft: '3px solid transparent' }}
              onClick={() => { logout(); setMobileMenuOpen(false); }}
            >
              <FiLogOut size={18} /> Sign Out
            </button>
          </>
        ) : (
          <div style={{ padding: '8px 16px' }}>
            <Link href="/auth" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
