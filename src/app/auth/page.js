'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getUserLocation, getAuthMethod } from '@/utils/location';
import { FiMail, FiSmartphone, FiShield, FiArrowRight, FiCheck, FiVideo } from 'react-icons/fi';

const OTP_LENGTH = 6;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function AuthPage() {
  const { login, user, authMethod: globalAuthMethod, location, addToast } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [authMethod, setAuthMethod] = useState(globalAuthMethod);
  const [locLoaded, setLocLoaded] = useState(false);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  useEffect(() => {
    if (globalAuthMethod) {
      setAuthMethod(globalAuthMethod);
      setLocLoaded(true);
    }
  }, [globalAuthMethod]);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  function handleOtpChange(index, val) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[index] = val.slice(-1);
    setOtp(next);
    if (val && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }

  async function handleSendOtp() {
    if (!contact.trim()) {
      addToast({ type: 'error', title: 'Required', message: `Please enter your ${authMethod.method === 'email' ? 'email' : 'phone number'}.` });
      return;
    }
    if (tab === 'register' && !name.trim()) {
      addToast({ type: 'error', title: 'Required', message: 'Please enter your name.' });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setOtpStep(true);
    setResendTimer(30);
    setLoading(false);
    addToast({
      type: 'success',
      title: 'OTP Sent!',
      message: `Demo OTP: ${otp} (sent to ${contact})`,
    });
  }

  async function handleVerifyOtp() {
    const entered = otp.join('');
    if (entered.length < OTP_LENGTH) {
      addToast({ type: 'error', title: 'Incomplete', message: 'Please enter the full 6-digit OTP.' });
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (entered !== generatedOtp) {
      addToast({ type: 'error', title: 'Invalid OTP', message: 'The OTP you entered is incorrect.' });
      setLoading(false);
      return;
    }
    const userData = {
      id: `u_${Date.now()}`,
      name: name || (tab === 'login' ? contact.split('@')[0] || 'User' : contact),
      email: authMethod.method === 'email' ? contact : null,
      phone: authMethod.method === 'mobile' ? contact : null,
      plan: 'free',
      joinedAt: new Date().toISOString(),
      city: location?.city || 'Unknown',
    };
    login(userData);
    addToast({ type: 'success', title: `Welcome${tab === 'register' ? ' to StreamNova' : ' back'}!`, message: `Signed in as ${userData.name}` });
    setLoading(false);
    router.push('/');
  }

  function resendOtp() {
    if (resendTimer > 0) return;
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    setOtp(['', '', '', '', '', '']);
    setResendTimer(30);
    addToast({ type: 'info', title: 'OTP Resent', message: `New OTP: ${newOtp}` });
    otpRefs.current[0]?.focus();
  }

  return (
    <div className="auth-page" style={{ 
      background: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop") center/cover no-repeat',
      position: 'relative',
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      {/* Dark gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-glass)' }} />

      {/* Decorative blobs inside overlay */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: 500, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%', width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="auth-card" style={{ 
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '48px 40px',
        maxWidth: 460,
        width: '100%',
        borderRadius: 'var(--radius-xl)',
        position: 'relative', zIndex: 1
      }}>
        {/* Logo */}
        <div className="auth-logo" style={{ marginBottom: 32 }}>
          <div className="navbar-logo" style={{ justifyContent: 'center', fontSize: '1.8rem' }}>
            <div className="navbar-logo-icon" style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiVideo size={24} color="white" />
            </div>
            StreamNova
          </div>
        </div>

        {/* Auth Method Info */}
        {locLoaded && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-lg)',
            marginBottom: 32
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
              {authMethod.method === 'email' ? <FiMail size={20} /> : <FiSmartphone size={20} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {authMethod.label} Authentication <FiShield size={14} color="#10b981" />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {authMethod.description}
              </div>
            </div>
          </div>
        )}

        {!otpStep ? (
          <>
            {/* Login / Register Tabs */}
            <div style={{ background: 'var(--bg-secondary)', padding: 4, borderRadius: 999, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 32, border: '1px solid var(--border)' }}>
              <button 
                style={{ padding: '10px 0', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s', background: tab === 'login' ? 'var(--gradient-1)' : 'transparent', color: tab === 'login' ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }} 
                onClick={() => setTab('login')}
              >
                Sign In
              </button>
              <button 
                style={{ padding: '10px 0', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s', background: tab === 'register' ? 'var(--gradient-1)' : 'transparent', color: tab === 'register' ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }} 
                onClick={() => setTab('register')}
              >
                Create Account
              </button>
            </div>

            <h1 className="auth-title" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{tab === 'login' ? 'Welcome back!' : 'Join StreamNova'}</h1>
            <p className="auth-sub" style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{tab === 'login' ? 'Sign in to your account' : 'Create your free account'}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {tab === 'register' && (
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: '100%' }}
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {authMethod.method === 'email' ? 'Email Address' : 'Mobile Number'}
                </label>
                <div className="input-with-icon">
                  <input
                    type={authMethod.method === 'email' ? 'email' : 'tel'}
                    className="input-field"
                    placeholder={authMethod.method === 'email' ? 'you@example.com' : '+91 98765 43210'}
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: '100%' }}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem', fontWeight: 700, marginTop: 8 }}
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? <><span className="spinner spinner-sm" /> Sending OTP...</> : <>Send OTP <FiArrowRight /></>}
              </button>
            </div>

            <div className="auth-divider" style={{ margin: '32px 0', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
              or continue with
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'center', padding: '12px' }} onClick={() => {
                const demoUser = { id: 'demo_user', name: 'Demo User', email: 'demo@streamnova.app', plan: 'gold', joinedAt: new Date().toISOString(), city: location?.city || 'Chennai' };
                login(demoUser);
                addToast({ type: 'success', title: 'Demo Login', message: 'Signed in as Gold Demo User!' });
                router.push('/');
              }}>
                Demo Login
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'center', padding: '12px' }} onClick={() => {
                addToast({ type: 'info', title: 'Google OAuth', message: 'Coming soon! Use Demo Login for now.' });
              }}>
                Google
              </button>
            </div>
            
            <p style={{ textAlign: 'center', marginTop: 32, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              By continuing, you agree to StreamNova's <br/><span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', color: '#818cf8', marginBottom: 20 }}>
                <FiMail size={28} />
              </div>
              <h1 className="auth-title" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Verify OTP</h1>
              <p className="auth-sub" style={{ color: 'var(--text-secondary)' }}>
                We sent a 6-digit code to<br />
                <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>{contact}</strong>
              </p>
            </div>

            <div className="otp-inputs" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input"
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                  style={{ width: 48, height: 56, fontSize: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length < OTP_LENGTH}
            >
              {loading ? <><span className="spinner spinner-sm" /> Verifying...</> : <>Verify & Sign In <FiArrowRight /></>}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Didn't receive it?{' '}
              <button
                style={{ color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}
                onClick={resendOtp}
                disabled={resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16, color: 'var(--text-secondary)' }}
              onClick={() => { setOtpStep(false); setOtp(['', '', '', '', '', '']); }}
            >
              Change Contact Details
            </button>
          </>
        )}
      </div>
    </div>
  );
}
