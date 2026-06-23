'use client';
import { useApp } from '@/context/AppContext';
import { generateInvoiceId, formatCurrency } from '@/utils/location';
import { PLANS } from '@/utils/data';

export default function InvoiceModal() {
  const { modalOpen, closeModal, invoiceData } = useApp();

  if (modalOpen !== 'invoice' || !invoiceData) return null;

  const plan = PLANS.find(p => p.id === invoiceData.planId);
  const invoiceId = invoiceData.invoiceId || generateInvoiceId();
  const date = new Date(invoiceData.date || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  function handleDownloadInvoice() {
    const content = `
STREAMNOVA INVOICE
==================
Invoice ID: ${invoiceId}
Date: ${date}
Customer: ${invoiceData.userName}
Email/Phone: ${invoiceData.contact}

PLAN: ${plan?.name} Plan
Amount: ${formatCurrency(plan?.price || 0)}
Tax (18% GST): ${formatCurrency((plan?.price || 0) * 0.18)}
TOTAL: ${formatCurrency((plan?.price || 0) * 1.18)}

Payment Method: Razorpay
Status: PAID

Thank you for subscribing to StreamNova!
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StreamNova_Invoice_${invoiceId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tax = (plan?.price || 0) * 0.18;
  const total = (plan?.price || 0) + tax;

  const planColors = { free: '#94a3b8', bronze: '#cd7c2f', silver: '#cbd5e1', gold: '#f59e0b' };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="invoice-header" style={{ background: `linear-gradient(135deg, ${planColors[invoiceData.planId] || '#6366f1'}, #6366f1)` }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}></div>
          <h2>Payment Successful!</h2>
          <p style={{ opacity: 0.85, fontSize: '0.9rem', marginTop: 4 }}>Welcome to {plan?.name} Plan</p>
          <div style={{
            marginTop: 12, padding: '6px 16px',
            background: 'rgba(255,255,255,0.2)', borderRadius: 20,
            fontSize: '0.8rem', fontWeight: 700, display: 'inline-block'
          }}>
            Invoice #{invoiceId}
          </div>
        </div>

        <div className="invoice-body">
          <div className="invoice-row">
            <span className="invoice-row-label">Customer</span>
            <span className="invoice-row-value">{invoiceData.userName}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-row-label">Contact</span>
            <span className="invoice-row-value">{invoiceData.contact}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-row-label">Date</span>
            <span className="invoice-row-value">{date}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-row-label">Plan</span>
            <span className="invoice-row-value">
              <span className={`badge badge-${invoiceData.planId}`}>{plan?.name}</span>
            </span>
          </div>
          <div className="invoice-row">
            <span className="invoice-row-label">Subtotal</span>
            <span className="invoice-row-value">{formatCurrency(plan?.price || 0)}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-row-label">GST (18%)</span>
            <span className="invoice-row-value">{formatCurrency(tax)}</span>
          </div>

          <div className="invoice-row invoice-total-row">
            <span className="invoice-total-label">Total Paid</span>
            <span className="invoice-total-value">{formatCurrency(total)}</span>
          </div>

          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--success)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            Confirmation email sent to <strong>{invoiceData.contact}</strong>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleDownloadInvoice}>
              Download Invoice
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={closeModal}>
              Start Streaming
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
