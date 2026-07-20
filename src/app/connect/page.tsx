'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { submitInquiry } from '../../actions/inquiry';

export default function ConnectPage() {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState('19:40:30');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: 'Just saying hello 👋',
    timeline: 'Developer / Engineer',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    inquiryId?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.cursor = 'none';

    const clock = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => {
      document.body.style.cursor = '';
      clearInterval(clock);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitInquiry(formData);
      if (res.success) {
        setSubmitStatus({
          success: true,
          inquiryId: res.inquiryId,
        });
      } else {
        alert(res.error || 'Failed to submit connection request.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', position: 'relative', display: 'flex', flexDirection: 'column', color: 'var(--white)', overflowX: 'hidden' }}>
      {/* Background Matrix Grid */}
      <div className="console-grid-bg" />
      <div className="ambient-glow-orb" style={{ top: '20%', left: '10%', background: 'var(--glow-purple)', width: '600px', height: '600px' }} />
      <div className="ambient-glow-orb" style={{ bottom: '10%', right: '10%', background: 'var(--glow-orange)', width: '600px', height: '600px' }} />

      {/* Nav HUD bar */}
      <header className="hud-frame" style={{ margin: '20px', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--white)', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 'bold' }}>
            ← MEHTA_OS // HOME
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>CONNECT_PORTAL_v1.0</span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', display: 'flex', gap: '20px' }}>
          <span>TIME // {timeStr}</span>
          <span style={{ color: '#50c878' }}>● ONLINE</span>
        </div>
      </header>

      {/* Main Console Box */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hud-frame liquid-glass-panel"
          style={{ width: '100%', maxWidth: '720px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <div className="specular-glare" />

          {/* Console metadata block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Operational Connection Console
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                Input parameters below to generate a database connection log transaction.
              </p>
            </div>
            <div className="hud-dot-group">
              <span className="hud-dot red" />
              <span className="hud-dot yellow" />
              <span className="hud-dot green" />
            </div>
          </div>

          {submitStatus ? (
            /* Terminal log success state */
            <div style={{ background: '#050505', borderRadius: '12px', padding: '24px', fontFamily: 'var(--mono)', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ color: '#e8c84a' }}>sarthak@mehta-os:~$ execute_submit_script --payload=json</span>
                <span style={{ color: '#50c878' }}>&gt; Resolving database write operations... OK</span>
                <span style={{ color: '#50c878' }}>&gt; Validating fields (Name: {formData.name}, Email: {formData.email})... OK</span>
                <span style={{ color: '#50c878' }}>&gt; Performing remote write transaction... OK</span>
                <span style={{ color: '#50c878' }}>&gt; Database insertion successful!</span>
                
                <div style={{ background: 'rgba(80, 200, 120, 0.06)', border: '1px dashed rgba(80, 200, 120, 0.25)', padding: '14px', margin: '12px 0', borderRadius: '8px' }}>
                  <div style={{ color: '#50c878', fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.05em' }}>SQLITE_INSERTION_SUCCESS</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '6px', fontSize: '11px' }}>CONN_ID: {submitStatus.inquiryId}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>AFFILIATION: {formData.timeline}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>REASON: {formData.budget}</div>
                </div>
                
                <span style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                  &gt; Sarthak Mehta has been notified of the transaction. Direct communications will resolve at {formData.email} within 24 hours.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button
                  className="glass-capsule capsule-glow-orange"
                  onClick={() => {
                    setSubmitStatus(null);
                    setFormData({
                      name: '',
                      email: '',
                      company: '',
                      budget: 'Just saying hello 👋',
                      timeline: 'Developer / Engineer',
                      message: '',
                    });
                  }}
                  style={{ padding: '10px 24px', fontSize: '12px' }}
                >
                  Create New Session
                </button>
                <Link href="/" className="glass-capsule capsule-glow-cyan" style={{ padding: '10px 24px', fontSize: '12px', textDecoration: 'none' }}>
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="inquiry-grid-form">
                <div className="glass-input-container">
                  <label className="glass-input-label">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input-field"
                    placeholder="John Doe"
                  />
                </div>
                <div className="glass-input-container">
                  <label className="glass-input-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input-field"
                    placeholder="john@email.com"
                  />
                </div>
              </div>

              <div className="glass-input-container">
                <label className="glass-input-label">Affiliated Organization / School (Optional)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="glass-input-field"
                  placeholder="e.g. NIT Jalandhar"
                />
              </div>

              <div className="inquiry-grid-form">
                <div className="glass-input-container">
                  <label className="glass-input-label">Reason for Connection</label>
                  <div className="glass-select-wrapper">
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="glass-select-field"
                    >
                      <option value="Just saying hello 👋">Just saying hello 👋</option>
                      <option value="Technical collaboration 🤝">Technical collaboration 🤝</option>
                      <option value="NIT Jalandhar discussion 🎓">NIT Jalandhar discussion 🎓</option>
                      <option value="General Q&A or chat 💻">General Q&A or chat 💻</option>
                    </select>
                  </div>
                </div>
                <div className="glass-input-container">
                  <label className="glass-input-label">Your Affiliation / Role</label>
                  <div className="glass-select-wrapper">
                    <select
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="glass-select-field"
                    >
                      <option value="Developer / Engineer">Developer / Engineer</option>
                      <option value="Researcher / Student">Researcher / Student</option>
                      <option value="Recruiter / Tech Manager">Recruiter / Tech Manager</option>
                      <option value="Tech Enthusiast">Tech Enthusiast</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-input-container">
                <label className="glass-input-label">Message Content *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="glass-input-field"
                  style={{ resize: 'vertical' }}
                  placeholder="What would you like to discuss? Project ideas, collaborations, or tech topics..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--mono)' }}>
                  * Required operational fields
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-capsule capsule-glow-orange"
                  style={{ minWidth: '220px' }}
                >
                  {isSubmitting ? 'WRITING TRANSACTION...' : 'EXECUTE DB WRITE TRANSACTION ↗'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </main>

      <footer style={{ padding: '24px', textAlign: 'center', fontSize: '11px', fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        © 2026 SARTHAK MEHTA. ALL SYSTEM METRICS REGISTERED.
      </footer>
    </div>
  );
}
