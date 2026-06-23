'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { FiGlobe, FiPlayCircle, FiVideo, FiAward, FiShield, FiMoon, FiPhone, FiTrendingUp, FiStar, FiUsers, FiZap } from 'react-icons/fi';
import VideoCard from '@/components/VideoCard';
import { VIDEOS, CATEGORIES } from '@/utils/data';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

export default function HomePage() {
  const { user, theme, location } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredVideos, setFilteredVideos] = useState(VIDEOS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  useEffect(() => {
    if (activeCategory === 'All') setFilteredVideos(VIDEOS);
    else setFilteredVideos(VIDEOS.filter(v => v.category === activeCategory));
  }, [activeCategory]);

  const featuredVideo = VIDEOS[4]; // Space telescope - gold tier featured

  return (
    <div className="container">
      {/* Hero */}
      {!user && (
        <section className="hero">
          <div className={`hero-tag ${loaded ? '' : ''}`}>
            Next-Gen Streaming Platform
          </div>
          <h1 className="hero-title">
            <span style={{ 
              background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-muted) 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' 
            }}>
              Stream. Connect.
            </span>
            <br />
            <span className="gradient-text">Experience More.</span>
          </h1>
          <p className="hero-desc">
            Premium video streaming with AI-powered multilingual comments, real-time VoIP,
            cinematic gesture controls, and an intelligent membership ecosystem.
          </p>
          <div className="hero-cta">
            <Link href="/auth" className="btn btn-primary btn-lg">
              Start Watching Free
            </Link>
            <Link href="/premium" className="btn btn-secondary btn-lg">
              See Premium Plans
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {[
              { value: '12M+', label: 'Active Users' },
              { value: '50K+', label: 'Videos' },
              { value: '140+', label: 'Countries' },
              { value: '4.9★', label: 'Rating' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="hero-stat-divider" />}
                <div className="hero-stat">
                  <div className="hero-stat-value">{s.value}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>
      )}

      {/* Personalized Greeting */}
      {user && (
        <section style={{ padding: '32px 0 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '24px 28px',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 32,
          }}>
            <div className="avatar avatar-xl">{user.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                Welcome back, {user.name?.split(' ')[0]}!
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
                {location?.city || 'Loading location...'} •
                <span className={`badge badge-${user.plan || 'free'}`} style={{ marginLeft: 8 }}>
                  {(user.plan || 'FREE').toUpperCase()} PLAN
                </span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
              <Link href="/room" className="btn btn-secondary btn-sm">Join Room</Link>
              {(!user.plan || user.plan === 'free') && (
                <Link href="/premium" className="btn btn-gold btn-sm">Upgrade</Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED VIDEO (Cinematic Hero Banner) ───────────────── */}
      <section style={{ marginBottom: 52 }}>
        <div style={{
          position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          height: 'clamp(320px, 42vw, 520px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
        }}>
          {/* Background image */}
          <img
            src={featuredVideo.thumbnail}
            alt={featuredVideo.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
          />

          {/* Cinematic overlay layers */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.75) 38%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.10) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,7,15,0.95) 0%, rgba(5,7,15,0.4) 40%, transparent 70%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(99,102,241,0.06) 0%, transparent 50%)' }} />

          {/* Top shimmer line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.4), transparent)' }} />
          {/* Bottom vignette */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(5,7,15,1) 0%, rgba(5,7,15,0.6) 40%, transparent 100%)' }} />

          {/* Floating particles */}
          {[
            { top: '18%', right: '22%', size: 3, delay: 0 },
            { top: '42%', right: '14%', size: 2, delay: 1.2 },
            { top: '65%', right: '30%', size: 3, delay: 2.5 },
            { top: '28%', right: '38%', size: 2, delay: 0.8 },
            { top: '55%', right: '20%', size: 4, delay: 1.8 },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute', width: p.size, height: p.size, borderRadius: '50%',
              background: `rgba(255,255,255,${0.2 + i * 0.05})`,
              top: p.top, right: p.right, pointerEvents: 'none',
              animation: `float ${5 + i}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }} />
          ))}

          {/* Content */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', alignItems: 'flex-end',
            padding: 'clamp(24px, 4vw, 52px)',
          }}>
            <div style={{ maxWidth: 620, width: '100%' }}>

              {/* Badge row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 14px', borderRadius: 999,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#1a0a00', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                  boxShadow: '0 0 16px rgba(245,158,11,0.4)',
                }}>
                  <FiAward size={11} /> Featured · Gold
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)',
                  color: '#fca5a5', fontSize: '0.7rem', fontWeight: 700,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.4s infinite', display: 'inline-block' }} />
                  LIVE NOW
                </span>
                {/* Genre pills */}
                {['Science', 'Documentary', '4K HDR'].map(tag => (
                  <span key={tag} style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem', fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', fontWeight: 900, lineHeight: 1.1,
                marginBottom: 14, letterSpacing: '-0.02em',
                textShadow: '0 2px 30px rgba(0,0,0,0.8), 0 4px 60px rgba(0,0,0,0.5)',
                color: '#fff',
              }}>
                {featuredVideo.title}
              </h2>

              {/* Description */}
              <p style={{
                color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.65,
                marginBottom: 20, maxWidth: 480,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {featuredVideo.description}
              </p>

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', fontWeight: 600 }}>
                  <FiUsers size={13} /> {featuredVideo.channel}
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiTrendingUp size={13} /> {featuredVideo.views} views
                </span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>{featuredVideo.timestamp}</span>
                {/* Rating */}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>
                  <FiStar size={11} /> 4.9
                </span>
                {/* Duration */}
                <span style={{ padding: '2px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 700 }}>
                  {featuredVideo.duration}
                </span>
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  href={`/watch/${featuredVideo.id}`}
                  className="btn btn-primary"
                  style={{ padding: '14px 28px', fontSize: '0.95rem', fontWeight: 700, boxShadow: '0 0 32px rgba(99,102,241,0.5)', gap: 10 }}
                >
                  <FiPlayCircle size={20} /> Watch Now
                </Link>
                <Link
                  href="/premium"
                  className="btn btn-gold"
                  style={{ padding: '14px 24px', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  <FiAward size={17} /> Get Gold Access
                </Link>
                {/* Floating play button on right */}
                <div style={{
                  marginLeft: 'auto',
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white',
                  boxShadow: '0 0 0 8px rgba(255,255,255,0.05)',
                }}>
                  <FiStar size={20} fill="rgba(245,158,11,0.8)" color="#fbbf24" />
                </div>
              </div>
            </div>
          </div>

          {/* Big centered play button (right side visual) */}
          <div style={{
            position: 'absolute', top: '50%', right: '20%', transform: 'translateY(-50%)',
            zIndex: 1, pointerEvents: 'none',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 16px rgba(255,255,255,0.04), 0 0 0 32px rgba(255,255,255,0.02)',
            }}>
              <FiPlayCircle size={36} color="white" />
            </div>
          </div>
        </div>
      </section>


      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trending Section */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.4rem', marginBottom: 4 }}>
              {activeCategory === 'All' ? 'Trending Now' : activeCategory}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {filteredVideos.length} videos available
            </p>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'} · Auto-adapted
          </span>
        </div>

        <div className="video-grid">
          {filteredVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-title">No videos in this category</div>
            <div className="empty-state-desc">Check back soon!</div>
          </div>
        )}
      </section>

      {/* ── FEATURE HIGHLIGHTS (Premium Bento Grid) ──────────────── */}
      <section style={{ marginBottom: 96, position: 'relative' }}>

        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative' }}>
          {/* Background glow blob */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(30px)' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 20px', background: 'rgba(99,102,241,0.12)', border: '1px solid var(--border-glow)', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 18, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <FiZap size={12} /> Why Choose Us
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: 14, lineHeight: 1.1,
          }}>Why StreamNova?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Everything you need. Nothing you don't.
          </p>
        </div>

        {/* Bento grid */}
        <div className="feature-bento-grid">
          {[
            {
              icon: <FiGlobe size={32} />, title: 'AI Translation',
              desc: 'Comments translated instantly across 14+ languages using advanced AI in real-time.',
              color: '#06b6d4', glow: 'rgba(6,182,212,0.18)', stat: '14+', statLabel: 'Languages',
              span: 1,
            },
            {
              icon: <FiPlayCircle size={32} />, title: 'Cinematic Player',
              desc: 'Gesture controls inspired by top streaming apps — tap, swipe, pinch to perfection.',
              color: '#a855f7', glow: 'rgba(168,85,247,0.18)', stat: '60fps', statLabel: 'Smooth',
              span: 1,
            },
            {
              icon: <FiVideo size={32} />, title: 'Live VoIP Rooms',
              desc: 'HD video calls, screen sharing, and synchronized YouTube co-watching together.',
              color: '#6366f1', glow: 'rgba(99,102,241,0.18)',
              span: 1,
            },
            {
              icon: <FiAward size={32} />, title: 'Gold Membership',
              desc: 'Unlimited streaming at 4K HDR, unlimited downloads, and dedicated priority support 24/7.',
              color: '#f59e0b', glow: 'rgba(245,158,11,0.18)', stat: '4K HDR', statLabel: 'Quality',
              span: 1,
            },
            {
              icon: <FiShield size={32} />, title: 'Smart Auth',
              desc: 'Location-aware OTP — Email OTP for South India, Mobile OTP for all other regions.',
              color: '#10b981', glow: 'rgba(16,185,129,0.18)',
              span: 1,
            },
            {
              icon: <FiMoon size={32} />, title: 'Auto Dark / Light',
              desc: 'Theme adapts automatically based on your timezone and local time of day — no manual toggle needed.',
              color: '#8b5cf6', glow: 'rgba(139,92,246,0.18)',
              span: 1,
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="feature-card"
              style={{
                '--card-color': f.color,
                '--card-glow': f.glow,
                background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, ${f.color}0d 100%)`,
                border: `1px solid ${f.color}30`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 24px 64px ${f.glow}, 0 0 0 1px ${f.color}50`;
                e.currentTarget.style.borderColor = `${f.color}60`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = `${f.color}30`;
              }}
            >
              {/* Shimmer top border */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`, opacity: 0.8 }} />
              {/* Corner glow blob */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${f.color}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
              {/* Index number */}
              <div style={{ position: 'absolute', top: 18, right: 20, fontSize: '0.68rem', fontWeight: 800, color: `${f.color}55`, letterSpacing: '0.12em' }}>0{i + 1}</div>

              {/* Icon + stat row */}
              <div className="feature-card-top">
                <div style={{
                  width: 64, height: 64, borderRadius: '18px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${f.color}20 0%, ${f.color}08 100%)`,
                  border: `1.5px solid ${f.color}45`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                  boxShadow: `0 0 20px ${f.color}25`,
                }}>
                  {f.icon}
                </div>
                {f.stat && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: f.color, lineHeight: 1 }}>{f.stat}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: `${f.color}80`, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{f.statLabel}</span>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      {!user && (
        <section style={{ marginBottom: 80 }}>
          <div className="cta-banner" style={{
            padding: '48px 40px', textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>Ready to Stream?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              Join millions of viewers on the world's most intelligent streaming platform.
            </p>
            <Link href="/auth" className="btn btn-primary btn-lg pulse-animation">Get Started Free</Link>
          </div>
        </section>
      )}

      {/* VoIP Room FAB */}
      <Link href="/room" className="fab" title="Join Live Room" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiPhone size={24} color="white" />
      </Link>
    </div>
  );
}
