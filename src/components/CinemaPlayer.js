'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLANS } from '@/utils/data';
import { formatDuration } from '@/utils/location';
import { FiPlay, FiPause, FiRewind, FiFastForward, FiVolume2, FiVolumeX, FiMaximize, FiDownload, FiThumbsUp, FiThumbsDown, FiShare2, FiMoreHorizontal } from 'react-icons/fi';

export default function CinemaPlayer({ video, allVideos }) {
  const { user, addToast, addDownload, canDownload } = useApp();
  const router = useRouter();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const tapTimerRef = useRef(null);
  const tapCountRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [gesture, setGesture] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const controlsTimerRef = useRef(null);

  const userPlan = user?.plan || 'free';
  const planConfig = PLANS.find(p => p.id === userPlan);
  const watchLimitSec = planConfig?.watchLimit === -1 ? Infinity : (planConfig?.watchLimit || 5) * 60;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.currentTime >= watchLimitSec) {
        v.pause();
        setPlaying(false);
        setLimitReached(true);
      }
    };
    const onDuration = () => setDuration(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onDuration);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onDuration);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [watchLimitSec]);

  const showGesture = useCallback((msg) => {
    setGesture(null);
    requestAnimationFrame(() => setGesture(msg));
    setTimeout(() => setGesture(null), 800);
  }, []);

  const autoHideControls = useCallback(() => {
    clearTimeout(controlsTimerRef.current);
    setShowControls(true);
    controlsTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => { autoHideControls(); }, [playing]);

  const handleContainerTap = useCallback((e) => {
    if (e.target.closest('.cinema-controls') || e.target.closest('.cinema-limit-overlay')) return;
    tapCountRef.current += 1;
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      const count = tapCountRef.current;
      tapCountRef.current = 0;
      const v = videoRef.current;
      if (!v) return;

      if (count === 1) {
        // Single tap: pause/resume
        if (v.paused) { v.play(); showGesture('Play'); }
        else { v.pause(); showGesture('Pause'); }
      } else if (count === 2) {
        // Double tap: seek based on tap position
        const rect = containerRef.current?.getBoundingClientRect();
        const tapX = (e.clientX - rect.left) / rect.width;
        if (tapX > 0.5) {
          v.currentTime = Math.min(v.duration, v.currentTime + 10);
          showGesture('+10s');
        } else {
          v.currentTime = Math.max(0, v.currentTime - 10);
          showGesture('-10s');
        }
      } else if (count >= 3) {
        // Triple tap: skip to next video
        const currentIdx = allVideos.findIndex(v2 => v2.id === video.id);
        const next = allVideos[(currentIdx + 1) % allVideos.length];
        if (next) { showGesture('Next Video'); setTimeout(() => router.push(`/watch/${next.id}`), 400); }
      }
    }, 250);
    autoHideControls();
  }, [video.id, allVideos, router, showGesture, autoHideControls]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }

  function handleProgress(e) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * duration;
  }

  function handleVolume(e) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }

  function handleDownload() {
    if (!user) { addToast({ type: 'warning', title: 'Sign in required', message: 'Please sign in to download.' }); return; }
    if (!canDownload(userPlan)) { addToast({ type: 'error', title: 'Limit reached', message: 'Upgrade for more downloads.' }); return; }
    addDownload(video);
    addToast({ type: 'success', title: 'Downloaded!', message: `"${video.title}" saved to Downloads.` });
  }

  const progressPct = duration > 0 ? (Math.min(currentTime, watchLimitSec) / duration) * 100 : 0;
  const limitPct = duration > 0 && isFinite(watchLimitSec) ? (watchLimitSec / duration) * 100 : 100;

  return (
    <div>
      {!limitReached && watchLimitSec < Infinity && (
        <div className="tier-limit-bar">
          {planConfig?.watchLimitLabel} watch limit •
          <strong style={{ color: 'var(--gold)', marginLeft: 4 }}>
            {Math.max(0, Math.floor(watchLimitSec - currentTime))}s remaining
          </strong>
          <Link href="/premium" className="btn btn-gold btn-sm" style={{ marginLeft: 'auto', padding: '4px 14px', fontSize: '0.78rem' }}>
            Upgrade
          </Link>
        </div>
      )}

      <div
        className="cinema-player"
        ref={containerRef}
        onClick={handleContainerTap}
        onMouseMove={autoHideControls}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail}
          preload="metadata"
          playsInline
        />

        {/* Gesture Feedback */}
        {gesture && (
          <div className="cinema-gesture-label">{gesture}</div>
        )}

        {/* Controls */}
        <div className="cinema-controls" style={{ opacity: showControls ? 1 : 0 }}>
          {/* Progress bar */}
          <div className="cinema-progress" onClick={handleProgress}>
            {/* Limit marker */}
            {isFinite(watchLimitSec) && (
              <div style={{
                position: 'absolute', top: -2, bottom: -2,
                left: `${limitPct}%`, width: 2,
                background: 'var(--gold)', borderRadius: 1, zIndex: 2,
              }} title="Watch limit" />
            )}
            <div className="cinema-progress-fill" style={{ width: `${progressPct}%` }} />
            <div className="cinema-progress-dot" style={{ left: `${progressPct}%` }} />
          </div>

          <div className="cinema-ctrl-row">
            <button className="cinema-ctrl-btn" onClick={e => { e.stopPropagation(); const v = videoRef.current; if(v) v.currentTime = Math.max(0, v.currentTime - 10); }} title="Rewind 10s"><FiRewind size={20} /></button>
            <button className="cinema-ctrl-btn" onClick={e => { e.stopPropagation(); togglePlay(); }} title={playing ? 'Pause' : 'Play'}>
              {playing ? <FiPause size={22} fill="currentColor" /> : <FiPlay size={22} fill="currentColor" />}
            </button>
            <button className="cinema-ctrl-btn" onClick={e => { e.stopPropagation(); const v = videoRef.current; if(v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }} title="Fast Forward 10s"><FiFastForward size={20} /></button>
            
            <div className="cinema-volume" onClick={e => e.stopPropagation()} style={{ marginLeft: 8 }}>
              <button className="cinema-ctrl-btn" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
                {muted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>
              <input type="range" className="cinema-vol-slider" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={handleVolume} />
            </div>

            <span className="cinema-time" style={{ marginLeft: 16 }}>{formatDuration(currentTime)} <span style={{opacity:0.4, margin: '0 4px'}}>/</span> {formatDuration(duration)}</span>
            
            <div style={{ flex: 1 }} />
            
            <button className="cinema-ctrl-btn" onClick={e => { e.stopPropagation(); handleDownload(); }} title="Download Offline">
              <FiDownload size={20} />
            </button>
            <button className="cinema-ctrl-btn" onClick={e => { e.stopPropagation(); toggleFullscreen(); }} title="Fullscreen">
              <FiMaximize size={20} />
            </button>
          </div>
        </div>

        {/* Limit Overlay */}
        {limitReached && (
          <div className="cinema-limit-overlay">
            <div style={{ fontSize: '3rem' }}></div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>Watch Limit Reached</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 360, lineHeight: 1.5 }}>
              Your <strong style={{ color: 'var(--gold)' }}>{planConfig?.name}</strong> plan allows {planConfig?.watchLimitLabel}.
              Upgrade to continue watching!
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/premium" className="btn btn-gold">Upgrade Now</Link>
              <button className="btn btn-secondary" onClick={() => { setLimitReached(false); setCurrentTime(0); if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); } }}>
                Restart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div style={{ padding: '24px 0 16px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{video.title}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Channel Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ width: 44, height: 44, fontSize: '1.2rem', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}>{video.channelAvatar}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{video.channel}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{video.views} views • {video.timestamp}</div>
            </div>
          </div>
          
          <div style={{ flex: 1 }} />
          
          {/* Action Pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button className="btn" style={{ padding: '8px 16px', background: 'transparent', borderRight: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                <FiThumbsUp size={18} /> {video.likes?.toLocaleString()}
              </button>
              <button className="btn" style={{ padding: '8px 16px', background: 'transparent', borderRadius: 0, gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                <FiThumbsDown size={18} />
              </button>
            </div>
            
            <button className="btn" style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', gap: 8, fontSize: '0.9rem', fontWeight: 600 }} onClick={handleDownload}>
              <FiDownload size={18} /> Download
            </button>
            <button className="btn" style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
              <FiShare2 size={18} /> Share
            </button>
            <button className="btn" style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMoreHorizontal size={20} />
            </button>
          </div>
        </div>

        <div style={{
          marginTop: 20, padding: 18,
          background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          {video.description}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexWrap: 'wrap', opacity: 0.6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gesture controls: Single tap = play/pause • Double tap = seek ±10s • Triple tap = skip video</span>
          </div>
        </div>
      </div>
    </div>
  );
}
