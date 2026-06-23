'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { PLANS } from '@/utils/data';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/utils/location';
import { Suspense } from 'react';

function ProfileContent() {
  const { user, logout, downloads, downloadCountToday, location } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    if (!user) router.push('/auth');
  }, [user, router]);

  if (!user) return null;

  const plan = PLANS.find(p => p.id === (user.plan || 'free'));
  const planColor = { free: '#94a3b8', bronze: '#cd7c2f', silver: '#cbd5e1', gold: '#f59e0b' }[user.plan || 'free'];
  const dlLimit = user.plan === 'free' ? 1 : user.plan === 'bronze' ? 3 : Infinity;
  const dlUsed = downloadCountToday;
  const dlPct = isFinite(dlLimit) ? Math.min((dlUsed / dlLimit) * 100, 100) : (dlUsed > 0 ? 30 : 0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar avatar-xl" style={{
          background: `linear-gradient(135deg, ${planColor}88, ${planColor})`,
          border: `3px solid ${planColor}`,
          boxShadow: `0 0 30px ${planColor}44`,
          fontSize: '2rem',
        }}>
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <div className="profile-name">{user.name}</div>
          <div className="profile-email">{user.email || user.phone || 'streamnova@user.com'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <span className={`badge badge-${user.plan || 'free'}`}>
              {plan?.icon} {plan?.name} Plan
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {location?.city || user.city || 'Unknown'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Joined {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/premium" className="btn btn-gold btn-sm">Upgrade Plan</Link>
          <button className="btn btn-danger btn-sm" onClick={() => { logout(); router.push('/'); }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`profile-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Plan Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { icon: '', label: 'Watch Limit', value: plan?.watchLimitLabel || '5 min/video', sub: 'per video' },
              { icon: '', label: 'Downloads Today', value: `${dlUsed}/${isFinite(dlLimit) ? dlLimit : '∞'}`, sub: 'resets daily' },
              { icon: '', label: 'AI Translation', value: (user.plan && user.plan !== 'free') ? 'Enabled' : 'Upgrade to unlock', sub: 'multilingual comments' },
              { icon: '', label: 'VoIP Access', value: (user.plan === 'silver' || user.plan === 'gold') ? 'Enabled' : 'Silver+ required', sub: 'video calls & rooms' },
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Download Progress */}
          {isFinite(dlLimit) && (
            <div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>Daily Downloads</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dlUsed}/{dlLimit} used</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${dlPct}%`,
                  background: dlPct >= 100 ? 'var(--danger)' : 'var(--gradient-1)',
                  borderRadius: 4, transition: 'width 0.5s ease',
                }} />
              </div>
              {dlPct >= 100 && (
                <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--warning)' }}>
                  Daily limit reached. <Link href="/premium" style={{ color: 'var(--accent)' }}>Upgrade for more downloads -&gt;</Link>
                </div>
              )}
            </div>
          )}

          {/* Plan Features */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Your {plan?.name} Plan Features</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {plan?.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: f.included ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  <span style={{ color: f.included ? 'var(--success)' : 'var(--text-muted)' }}>{f.included ? '✓' : '✕'}</span>
                  {f.text}
                </div>
              ))}
            </div>
            {user.plan !== 'gold' && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Want more? Upgrade to unlock all features.</span>
                <Link href="/premium" className="btn btn-gold btn-sm">Upgrade Now</Link>
              </div>
            )}
          </div>

          {/* Recent Downloads Preview */}
          {downloads.length > 0 && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 700 }}>Recent Downloads</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('downloads')}>View All →</button>
              </div>
              {downloads.slice(0, 3).map(d => (
                <div key={d.dlId} className="download-item">
                  <div className="download-thumb">
                    <img src={d.thumbnail} alt={d.title} />
                  </div>
                  <div className="download-info">
                    <div className="download-title">{d.title}</div>
                    <div className="download-meta">{d.channel} • {d.duration}</div>
                  </div>
                  <div className="download-date">
                    {new Date(d.downloadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Downloads Tab */}
      {activeTab === 'downloads' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Downloads Hub</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                {downloads.length} saved video{downloads.length !== 1 ? 's' : ''}
              </p>
            </div>
            {!isFinite(dlLimit) && (
              <span className="badge badge-gold">♾ Unlimited Downloads</span>
            )}
          </div>

          {downloads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"></div>
              <div className="empty-state-title">No downloads yet</div>
              <div className="empty-state-desc">Save videos to watch offline anytime.</div>
              <Link href="/" className="btn btn-primary" style={{ marginTop: 20 }}>Browse Videos</Link>
            </div>
          ) : (
            downloads.map(d => (
              <div key={d.dlId} className="download-item">
                <div className="download-thumb">
                  <img src={d.thumbnail} alt={d.title} />
                </div>
                <div className="download-info">
                  <div className="download-title">{d.title}</div>
                  <div className="download-meta">{d.channel} • {d.duration} • {d.category}</div>
                  <div className="download-date">
                    Downloaded {new Date(d.downloadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <Link href={`/watch/${d.id}`} className="btn btn-primary btn-sm">Watch</Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <div className="glass-card" style={{ padding: '24px', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Account Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Display Name</label>
                <input className="input-field" defaultValue={user.name} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div className="input-group">
                <label className="input-label">Email / Phone</label>
                <input className="input-field" defaultValue={user.email || user.phone || 'N/A'} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <input className="input-field" value={`${location?.city || 'Unknown'}, ${location?.country || ''}`} readOnly style={{ opacity: 0.7 }} />
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Preferences</h3>
            {[
              { label: 'Email Notifications', checked: true },
              { label: 'Auto-translate comments', checked: user.plan !== 'free' },
              { label: 'Auto dark/light theme', checked: true },
              { label: 'Cinematic gesture controls', checked: true },
            ].map((pref, i) => (
              <div key={i} className="check-wrap" style={{ marginBottom: 14 }}>
                <input type="checkbox" defaultChecked={pref.checked} id={`pref_${i}`} />
                <label htmlFor={`pref_${i}`} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>{pref.label}</label>
              </div>
            ))}
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => {}}>
              Save Preferences
            </button>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderColor: 'rgba(239,68,68,0.2)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--danger)' }}>Danger Zone</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              These actions are permanent and cannot be undone.
            </p>
            <button className="btn btn-danger btn-sm" onClick={() => { logout(); router.push('/'); }}>
              Sign Out All Devices
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
