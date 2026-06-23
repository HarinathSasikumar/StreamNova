'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PLANS, VIDEOS } from '@/utils/data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateInvoiceId } from '@/utils/location';
import { FiCheck, FiX, FiShield, FiStar, FiZap, FiAward, FiGift, FiCreditCard, FiLock, FiSmartphone } from 'react-icons/fi';

const PlanIcon = ({ id, size = 32 }) => {
  if (id === 'free') return <FiGift size={size} color="#94a3b8" />;
  if (id === 'bronze') return <FiAward size={size} color="#d97706" />;
  if (id === 'silver') return <FiZap size={size} color="#a5b4fc" />;
  if (id === 'gold') return <FiStar size={size} color="#fbbf24" fill="#fbbf24" />;
  return null;
};

export default function PremiumPage() {
  const { user, upgradePlan, showInvoice, addToast } = useApp();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [mockPayModal, setMockPayModal] = useState(null); // { plan, displayPrice }
  const [payStep, setPayStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [payMethod, setPayMethod] = useState('upi');

  async function handleUpgrade(plan) {
    if (!user) {
      addToast({ type: 'warning', title: 'Sign in required', message: 'Please sign in to upgrade.' });
      router.push('/auth');
      return;
    }
    if (user.plan === plan.id) {
      addToast({ type: 'info', title: 'Already subscribed', message: `You are already on the ${plan.name} plan.` });
      return;
    }
    if (plan.price === 0) {
      upgradePlan('free');
      addToast({ type: 'success', title: 'Switched to Free', message: 'You are now on the Free plan.' });
      return;
    }
    // Show custom mock payment modal
    const displayPrice = billingCycle === 'annual' && plan.price > 0
      ? Math.round(plan.price * (1 - 0.17))
      : plan.price;
    setPayStep('form');
    setPayMethod('upi');
    setMockPayModal({ plan, displayPrice });
  }

  async function handleMockPay() {
    setPayStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    setPayStep('success');
    await new Promise(r => setTimeout(r, 1000));
    const mockPaymentId = `pay_${Date.now()}`;
    completeUpgrade(mockPayModal.plan, mockPaymentId);
    setMockPayModal(null);
    setPayStep('form');
  }

  function completeUpgrade(plan, paymentId) {
    upgradePlan(plan.id);
    const invoiceData = {
      planId: plan.id,
      invoiceId: generateInvoiceId(),
      paymentId,
      userName: user.name,
      contact: user.email || user.phone || 'N/A',
      date: new Date().toISOString(),
    };
    showInvoice(invoiceData);
    addToast({ type: 'success', title: `Welcome to ${plan.name}!`, message: `Payment successful. Invoice generated.` });
  }

  const discount = billingCycle === 'annual' ? 0.17 : 0; // 17% off annual

  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 100 }}>

      {/* ===== MOCK PAYMENT MODAL ===== */}
      {mockPayModal && (
        <div className="modal-overlay" onClick={payStep === 'form' ? () => setMockPayModal(null) : undefined}>
          <div className="modal-card" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '24px 28px', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>StreamNova Checkout</div>
                <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800 }}>{mockPayModal.plan.name} Plan</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>Amount</div>
                <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: 900 }}>₹{mockPayModal.displayPrice}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>per month</div>
              </div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {payStep === 'form' && (
                <>
                  {/* Payment Method Tabs */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', padding: 4 }}>
                    {[
                      { id: 'upi', label: '📱 UPI', },
                      { id: 'card', label: '💳 Card', },
                      { id: 'netbanking', label: '🏦 Net Banking', },
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                          background: payMethod === m.id ? 'var(--gradient-1)' : 'none',
                          color: payMethod === m.id ? 'white' : 'var(--text-muted)',
                          transition: 'all 0.25s ease',
                        }}
                      >{m.label}</button>
                    ))}
                  </div>

                  {/* UPI Form */}
                  {payMethod === 'upi' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="input-group">
                        <label className="input-label">UPI ID</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><FiSmartphone size={16} /></span>
                          <input className="input-field" style={{ paddingLeft: 40 }} placeholder="yourname@upi" defaultValue={user?.phone ? `${user.phone}@okaxis` : ''} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Form */}
                  {payMethod === 'card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="input-group">
                        <label className="input-label">Card Number</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><FiCreditCard size={16} /></span>
                          <input className="input-field" style={{ paddingLeft: 40 }} placeholder="4242 4242 4242 4242" maxLength={19} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label">Expiry</label>
                          <input className="input-field" placeholder="MM / YY" maxLength={7} />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label className="input-label">CVV</label>
                          <input className="input-field" placeholder="•••" maxLength={3} type="password" />
                        </div>
                      </div>
                      <div className="input-group">
                        <label className="input-label">Cardholder Name</label>
                        <input className="input-field" placeholder="Name on card" defaultValue={user?.name || ''} />
                      </div>
                    </div>
                  )}

                  {/* Net Banking */}
                  {payMethod === 'netbanking' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank'].map(b => (
                        <div key={b} style={{ padding: '10px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-secondary)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >{b}</div>
                      ))}
                    </div>
                  )}

                  {/* Security badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '16px 0 20px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <FiLock size={13} /> Secured by <strong style={{ color: 'var(--text-secondary)' }}>256-bit SSL encryption</strong>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMockPayModal(null)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleMockPay}>
                      Pay ₹{mockPayModal.displayPrice}
                    </button>
                  </div>
                </>
              )}

              {/* Processing State */}
              {payStep === 'processing' && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 56, height: 56, border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>Processing Payment…</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Please do not close this window</div>
                </div>
              )}

              {/* Success State */}
              {payStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--success)', animation: 'scaleIn 0.3s ease' }}>
                    <FiCheck size={32} strokeWidth={3} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)', marginBottom: 8 }}>Payment Successful!</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Activating your {mockPayModal.plan.name} plan…</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 64, position: 'relative' }}>
        {/* Glow blob behind header */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', maxWidth: 700, height: 350, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: -1 }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 20px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', marginBottom: 24, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <FiStar size={12} fill="currentColor" /> Membership Plans
        </div>
        
        <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: 16, lineHeight: 1.1,
        }}>
          Choose Your Experience
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', fontSize: '1.1rem', lineHeight: 1.7 }}>
          Unlock premium features, unlimited streaming, and a world-class viewing experience tailored to you.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: 4, gap: 4 }}>
          <button
            className={`btn btn-sm ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setBillingCycle('monthly')}
          >Monthly</button>
          <button
            className={`btn btn-sm ${billingCycle === 'annual' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => setBillingCycle('annual')}
          >
            Annual <span style={{ marginLeft: 4, fontSize: '0.7rem', background: 'var(--success)', color: 'white', borderRadius: 4, padding: '1px 5px' }}>-17%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid" style={{ marginBottom: 60 }}>
        {PLANS.map(plan => {
          const isCurrentPlan = user?.plan === plan.id;
          const displayPrice = billingCycle === 'annual' && plan.price > 0
            ? Math.round(plan.price * (1 - discount))
            : plan.price;

          return (
            <div
              key={plan.id}
              className={`plan-card ${plan.color} ${plan.popular ? 'popular' : ''} ${plan.popularGold ? 'popular-gold' : ''}`}
              style={{
                background: plan.id === 'gold' ? 'var(--bg-card)' : undefined,
                borderColor: plan.id === 'gold' ? 'var(--gold)' : undefined,
                boxShadow: plan.id === 'gold' ? 'var(--shadow-gold, 0 10px 40px rgba(245,158,11,0.15))' : undefined,
              }}
            >
              {/* Highlight top line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: plan.id === 'gold' ? 'linear-gradient(90deg, transparent, var(--gold), transparent)' : 'linear-gradient(90deg, transparent, var(--border-glow), transparent)', opacity: 0.8 }} />

              {plan.popular && <div className="plan-popular-badge">Most Popular</div>}
              {plan.popularGold && <div className="plan-popular-badge" style={{ background: 'var(--gradient-gold)', color: '#1a1000' }}>Best Value</div>}

              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                <div style={{ 
                  width: 68, height: 68, borderRadius: '50%', 
                  background: plan.id === 'gold' ? 'rgba(245,158,11,0.15)' : 'var(--bg-glass)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: plan.id === 'gold' ? '0 0 24px rgba(245,158,11,0.2)' : 'none',
                  border: '1px solid var(--border)'
                }}>
                  <PlanIcon id={plan.id} size={34} />
                </div>
              </div>
              
              <div className={`plan-name`} style={{
                fontSize: '1.5rem',
                background: plan.id === 'gold' ? 'var(--gradient-gold)' : plan.id === 'silver' ? 'var(--gradient-silver)' : plan.id === 'bronze' ? 'var(--gradient-bronze)' : undefined,
                WebkitBackgroundClip: plan.id !== 'free' ? 'text' : undefined,
                backgroundClip: plan.id !== 'free' ? 'text' : undefined,
                WebkitTextFillColor: plan.id !== 'free' ? 'transparent' : undefined,
              }}>
                {plan.name}
              </div>
              <div className="plan-price" style={{
                fontSize: '3rem',
                background: plan.id === 'gold' ? 'var(--gradient-gold)' : undefined,
                WebkitBackgroundClip: plan.id === 'gold' ? 'text' : undefined,
                backgroundClip: plan.id === 'gold' ? 'text' : undefined,
                WebkitTextFillColor: plan.id === 'gold' ? 'transparent' : undefined,
              }}>
                {plan.price === 0 ? '₹0' : `₹${displayPrice}`}
              </div>
              <div className="plan-price-sub" style={{ fontSize: '0.9rem' }}>
                {plan.price === 0 ? 'Forever Free' : billingCycle === 'annual' ? 'per month, billed annually' : 'per month'}
                {billingCycle === 'annual' && plan.price > 0 && (
                  <span style={{ display: 'block', textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>₹{plan.price}/mo</span>
                )}
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />

              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i} className="plan-feature" style={{ padding: '4px 0' }}>
                    <span className={`plan-feature-icon ${f.included ? '' : 'no'}`} style={{ color: f.included ? (plan.id === 'gold' ? 'var(--gold)' : 'var(--accent)') : 'var(--text-muted)', opacity: f.included ? 1 : 0.5 }}>
                      {f.included ? <FiCheck size={18} /> : <FiX size={18} />}
                    </span>
                    <span style={{ color: f.included ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: f.included ? 500 : 400 }}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled>
                  ✓ Current Plan
                </button>
              ) : (
                <button
                  className={`btn ${plan.id === 'gold' ? 'btn-gold' : plan.id === 'free' ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleUpgrade(plan)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id ? (
                    <><span className="spinner spinner-sm" /> Processing...</>
                  ) : plan.price === 0 ? (
                    'Start Free'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div style={{ marginBottom: 60, maxWidth: 1000, margin: '0 auto 60px' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32, fontSize: '1.6rem' }}>Full Comparison</h2>
        <div style={{ 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch',
          background: 'var(--bg-glass)', 
          backdropFilter: 'blur(20px)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card)' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Feature</th>
                {PLANS.map(p => (
                  <th key={p.id} style={{ textAlign: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, color: p.color === 'gold' ? 'var(--gold)' : p.color === 'silver' ? '#94a3b8' : p.color === 'bronze' ? '#cd7c2f' : 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{p.priceLabel}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Watch Limit', values: ['5 min', '7 min', '10 min', 'Unlimited'] },
                { label: 'Downloads/Day', values: ['1', '3', 'Unlimited', 'Unlimited'] },
                { label: 'Video Quality', values: ['HD', 'Full HD', '4K', '4K HDR'] },
                { label: 'AI Translation', values: ['✕', '✓', '✓', '✓'] },
                { label: 'VoIP Calls', values: ['✕', '✕', '✓', '✓'] },
                { label: 'Screen Sharing', values: ['✕', '✕', '✓', '✓'] },
                { label: 'Session Recording', values: ['✕', '✕', '✕', '✓'] },
                { label: 'Priority Support', values: ['✕', '✕', '✓', '✓ Dedicated'] },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i === 7 ? 'none' : '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} style={{
                      textAlign: 'center', padding: '16px 24px',
                      color: v === '✕' ? 'var(--text-muted)' : v.includes('✓') ? 'var(--success)' : 'var(--text-primary)',
                      fontWeight: v !== '✕' && !v.includes('✓') ? 700 : 500,
                    }}>
                      {v === '✕' ? <FiX size={18} style={{ opacity: 0.5 }} /> : v === '✓' ? <FiCheck size={18} strokeWidth={3} /> : v === '✓ Dedicated' ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><FiCheck size={18} strokeWidth={3} /> Dedicated</div> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 720, margin: '0 auto', marginBottom: 60 }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 32, fontSize: '1.6rem' }}>Frequently Asked</h2>
        {[
          { q: 'Can I cancel anytime?', a: 'Yes! Cancel anytime from your profile. Your access continues until the end of the billing period.' },
          { q: 'Is Razorpay payment secure?', a: 'Absolutely. All payments are processed through Razorpay with PCI-DSS Level 1 compliance and bank-grade encryption.' },
          { q: 'What happens when I hit the watch limit?', a: 'Playback pauses and you\'ll see upgrade options. You can restart the video or upgrade to continue watching.' },
          { q: 'Do unused downloads carry over?', a: 'Download counts reset daily. Free users get 1/day, Bronze 3/day, and Silver/Gold enjoy unlimited downloads.' },
        ].map((faq, i) => (
          <div key={i} style={{
            padding: '20px 24px', marginBottom: 12,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{faq.q}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{faq.a}</div>
          </div>
        ))}
      </div>

      {/* Guarantee */}
      <div style={{
        textAlign: 'center', padding: '48px 40px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(99,102,241,0.05))',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)' }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', boxShadow: '0 0 24px rgba(16,185,129,0.2)' }}>
            <FiShield size={32} />
          </div>
        </div>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>30-Day Money Back Guarantee</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Not completely satisfied? Get a full refund within 30 days. No questions asked. We're that confident you'll love it.
        </p>
      </div>
    </div>
  );
}
