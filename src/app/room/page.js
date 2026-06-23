'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ROOM_USERS = [
  { id: 'u1', name: 'You', isSelf: true },
  { id: 'u2', name: 'Arjun K', isSelf: false },
  { id: 'u3', name: 'Priya N', isSelf: false },
];

const YOUTUBE_VIDEOS = [
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
  { id: 'jNQXAC9IVRw', title: 'Me at the zoo (First YouTube video)' },
  { id: 'kJQP7kiw5Fk', title: 'Despacito' },
];

export default function RoomPage() {
  const { user, addToast } = useApp();
  const router = useRouter();
  const [joined, setJoined] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [messages, setMessages] = useState([
    { id: 1, user: 'Arjun K', text: 'Hey everyone!', time: '12:30' },
    { id: 2, user: 'Priya N', text: 'Ready to watch something?', time: '12:31' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [activePanel, setActivePanel] = useState('video'); // 'video' | 'youtube' | 'chat'
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [participants, setParticipants] = useState(ROOM_USERS.slice(0, 1));
  const [speakingId, setSpeakingId] = useState(null);
  const localVideoRef = useRef(null);
  const recordTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!joined) return;
    // Simulate others joining
    const timer = setTimeout(() => {
      setParticipants(ROOM_USERS);
      addToast({ type: 'info', title: 'Room Update', message: 'Arjun K and Priya N joined the room.' });
    }, 2000);

    // Simulate random speaking
    const speakTimer = setInterval(() => {
      const ids = ['u1', 'u2', 'u3', null];
      setSpeakingId(ids[Math.floor(Math.random() * ids.length)]);
    }, 3000);

    return () => { clearTimeout(timer); clearInterval(speakTimer); };
  }, [joined]);

  useEffect(() => {
    if (recording) {
      recordTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      clearInterval(recordTimerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(recordTimerRef.current);
  }, [recording]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch {
      addToast({ type: 'warning', title: 'Camera access denied', message: 'Showing placeholder video.' });
    }
  }

  async function handleJoin() {
    if (!user) { router.push('/auth'); return; }
    const code = roomCode.trim() || `ROOM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setRoomCode(code);
    setJoined(true);
    await startCamera();
    addToast({ type: 'success', title: 'Joined Room!', message: `Room code: ${code}` });
  }

  async function toggleScreenShare() {
    if (!screenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setScreenSharing(true);
        addToast({ type: 'info', title: 'Screen Sharing', message: 'You are now sharing your screen.' });
        stream.getVideoTracks()[0].onended = () => setScreenSharing(false);
      } catch {
        addToast({ type: 'error', title: 'Screen share denied', message: 'Could not start screen sharing.' });
      }
    } else {
      await startCamera();
      setScreenSharing(false);
      addToast({ type: 'info', title: 'Screen Share Stopped', message: 'Switched back to camera.' });
    }
  }

  async function toggleRecording() {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = e => chunksRef.current.push(e.data);
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `StreamNova_Session_${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          addToast({ type: 'success', title: 'Recording saved!', message: 'Session downloaded to your device.' });
        };
        mr.start();
        mediaRecorderRef.current = mr;
        setRecording(true);
        addToast({ type: 'info', title: 'Recording started', message: 'Session is being recorded.' });
      } catch {
        addToast({ type: 'warning', title: 'Recording', message: 'Simulating session recording...' });
        setRecording(true);
      }
    } else {
      if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
      else addToast({ type: 'success', title: 'Recording stopped', message: 'Simulated session saved.' });
      setRecording(false);
    }
  }

  function handleYoutubeLoad() {
    const match = youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      setYoutubeId(match[1]);
      setActivePanel('youtube');
      addToast({ type: 'success', title: 'Co-watching!', message: 'YouTube video synced for everyone in the room.' });
    } else {
      addToast({ type: 'error', title: 'Invalid URL', message: 'Please enter a valid YouTube URL.' });
    }
  }

  function sendMessage() {
    if (!chatInput.trim()) return;
    const msg = {
      id: Date.now(),
      user: user?.name || 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    setMessages(prev => [...prev, msg]);
    setChatInput('');
  }

  function handleLeave() {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    localVideoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    setJoined(false);
    setParticipants(ROOM_USERS.slice(0, 1));
    setRecording(false);
    setScreenSharing(false);
    addToast({ type: 'info', title: 'Left Room', message: 'You have left the call.' });
  }

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Pre-join screen
  if (!joined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}></div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>Live Rooms</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
            Join HD video calls, share your screen, co-watch YouTube, and record sessions with friends.
          </p>

          {['silver', 'gold'].includes(user?.plan) || !user ? (
            <>
              <div className="input-group" style={{ marginBottom: 20, textAlign: 'left' }}>
                <label className="input-label">Room Code (optional)</label>
                <div className="input-with-icon">
                  <span className="input-icon"></span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter code or leave blank for new room"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={handleJoin}>
                Join Room
              </button>
              <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { icon: '', label: 'HD Video Calls' },
                  { icon: '', label: 'Screen Share' },
                  { icon: '', label: 'Co-Watch YouTube' },
                  { icon: '', label: 'Record Session' },
                ].map((f, i) => (
                  <span key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {f.icon} {f.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: 24, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-lg)', marginBottom: 20 }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}></div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Silver or Gold Plan Required</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                VoIP rooms are available for Silver and Gold members.
              </p>
              <Link href="/premium" className="btn btn-gold" style={{ display: 'inline-flex' }}>
                Upgrade to Unlock
              </Link>
            </div>
          )}
          <Link href="/" className="btn btn-ghost" style={{ marginTop: 16, display: 'inline-flex' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="voip-room">
      {/* Room Header */}
      <div className="voip-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontWeight: 700 }}>Room: {roomCode}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{participants.length} participants</span>
          {recording && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s infinite', display: 'inline-block' }} />
              REC {formatTime(recordingTime)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['video', 'youtube', 'chat'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${activePanel === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActivePanel(p)}
            >
              {p === 'video' ? 'Video' : p === 'youtube' ? 'Co-Watch' : 'Chat'}
            </button>
          ))}
          <button className="btn btn-danger btn-sm" onClick={handleLeave}>Leave</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: activePanel === 'chat' ? '1fr 360px' : '1fr', gap: 0, overflow: 'hidden' }}>
        {/* Main Content */}
        <div style={{ padding: 24, overflow: 'auto' }}>
          {activePanel === 'video' && (
            <>
              <div className="voip-grid">
                {/* Local video */}
                <div className={`voip-tile ${speakingId === 'u1' ? 'speaking' : ''}`}>
                  <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#1a1a2e' }} />
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                    pointerEvents: 'none',
                  }}>
                    {!camOn && <div className="avatar avatar-xl" style={{ opacity: 0.7 }}>{user?.name?.[0] || 'Y'}</div>}
                  </div>
                  <div className="voip-tile-label">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: speakingId === 'u1' ? 'var(--success)' : 'var(--text-muted)', display: 'inline-block' }} />
                    You {!micOn && 'Muted'} {!camOn && 'No Cam'} {screenSharing && 'Screen'}
                  </div>
                </div>

                {/* Other participants */}
                {participants.filter(p => !p.isSelf).map(p => (
                  <div key={p.id} className={`voip-tile ${speakingId === p.id ? 'speaking' : ''}`}>
                    <div style={{
                      width: '100%', height: '100%',
                      background: `linear-gradient(135deg, hsl(${p.id.charCodeAt(1) * 30}, 50%, 15%), hsl(${p.id.charCodeAt(1) * 30 + 60}, 40%, 20%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div className="avatar avatar-xl">{p.name[0]}</div>
                    </div>
                    <div className="voip-tile-label">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: speakingId === p.id ? 'var(--success)' : 'var(--text-muted)', display: 'inline-block' }} />
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activePanel === 'youtube' && (
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input
                  className="input-field"
                  placeholder="Paste YouTube URL to co-watch..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleYoutubeLoad()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={handleYoutubeLoad}>Load</button>
              </div>

              {youtubeId ? (
                <div className="youtube-cowatch">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Co-watch"
                  />
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>Quick Play</div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {YOUTUBE_VIDEOS.map(v => (
                      <button key={v.id} className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12 }}
                        onClick={() => { setYoutubeId(v.id); setActivePanel('youtube'); }}>
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {activePanel === 'chat' && (
          <div className="cowatch-panel" style={{ borderLeft: '1px solid var(--border)', height: '100%' }}>
            <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
              Room Chat
            </div>
            <div className="cowatch-messages">
              {messages.map(m => (
                <div key={m.id} className="cowatch-msg">
                  <span className="cowatch-msg-name">{m.user}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: 6 }}>{m.time}</span>
                  <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <input
                className="input-field"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{ flex: 1, padding: '8px 12px' }}
              />
              <button className="btn btn-primary btn-sm" onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="voip-controls">
        <button className={`voip-ctrl ${micOn ? 'active' : ''}`} onClick={() => setMicOn(!micOn)} title={micOn ? 'Mute' : 'Unmute'}>
          {micOn ? 'Mic' : 'Muted'}
        </button>
        <button className={`voip-ctrl ${camOn ? 'active' : ''}`} onClick={() => setCamOn(!camOn)} title={camOn ? 'Stop camera' : 'Start camera'}>
          {camOn ? 'Cam' : 'No Cam'}
        </button>
        <button className={`voip-ctrl ${screenSharing ? 'active' : ''}`} onClick={toggleScreenShare} title="Share screen">
          Screen
        </button>
        <button className={`voip-ctrl ${recording ? 'recording' : ''}`} onClick={toggleRecording} title={recording ? 'Stop recording' : 'Start recording'}>
          {recording ? 'Stop' : 'Record'}
        </button>
        <button
          className="voip-ctrl"
          onClick={() => { setActivePanel(activePanel === 'youtube' ? 'video' : 'youtube'); }}
          title="Co-watch YouTube"
          style={{ fontSize: '1rem' }}
        >
          Watch
        </button>
        <button
          className="voip-ctrl"
          onClick={() => setActivePanel(activePanel === 'chat' ? 'video' : 'chat')}
          title="Chat"
        >
          Chat
        </button>
        <button
          className="voip-ctrl"
          onClick={() => { navigator.clipboard?.writeText(roomCode); addToast({ type: 'success', title: 'Copied!', message: `Room code ${roomCode} copied.` }); }}
          title="Copy room code"
        >
          Link
        </button>
        <button className="voip-ctrl danger" onClick={handleLeave} title="Leave room">
          Leave
        </button>
      </div>
    </div>
  );
}
