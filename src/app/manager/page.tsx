'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getInquiries, deleteInquiry, updateInquiryStatus } from '../../actions/inquiry';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  budget: string;
  timeline: string;
  message: string;
  status: string;
  createdAt: Date;
}

export default function ManagerPage() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<{ name: string; role: string } | null>(null);
  
  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('Admin');

  // Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);

  // Stats Analytics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    archived: 0,
    avgBudget: 'Just saying hello 👋',
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.cursor = 'none';

    // Simulated local storage auth check
    const savedName = sessionStorage.getItem('mehtaOSUser');
    const savedRole = sessionStorage.getItem('mehtaOSRole');
    if (savedName && savedRole) {
      setSession({ name: savedName, role: savedRole });
    }

    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  // Fetch inquiries once authenticated
  useEffect(() => {
    if (session) {
      fetchInquiries();
    }
  }, [session]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await getInquiries();
      if (res.success && res.inquiries) {
        // Parse date strings to Date objects if necessary
        const data = res.inquiries.map((inq: any) => ({
          ...inq,
          createdAt: new Date(inq.createdAt),
        }));
        setInquiries(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Inquiry[]) => {
    const total = data.length;
    const pending = data.filter(i => i.status === 'pending').length;
    const contacted = data.filter(i => i.status === 'contacted').length;
    const archived = data.filter(i => i.status === 'archived').length;
    
    // Estimate dominant reason based on counts
    const budgetCounts: Record<string, number> = {};
    data.forEach(i => {
      budgetCounts[i.budget] = (budgetCounts[i.budget] || 0) + 1;
    });
    
    let maxCount = 0;
    let mainBudget = 'N/A';
    Object.entries(budgetCounts).forEach(([b, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mainBudget = b;
      }
    });

    setStats({ total, pending, contacted, archived, avgBudget: mainBudget });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim()) {
      alert('Please enter a student name to authenticate.');
      return;
    }
    sessionStorage.setItem('mehtaOSUser', authName);
    sessionStorage.setItem('mehtaOSRole', authRole);
    setSession({ name: authName, role: authRole });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mehtaOSUser');
    sessionStorage.removeItem('mehtaOSRole');
    setSession(null);
    setInquiries([]);
    setSelectedInquiry(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry record from SQLite?')) return;
    try {
      const res = await deleteInquiry(id);
      if (res.success) {
        const updated = inquiries.filter(i => i.id !== id);
        setInquiries(updated);
        calculateStats(updated);
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
      } else {
        alert(res.error || 'Failed to delete record.');
      }
    } catch (e) {
      alert('Error deleting record.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await updateInquiryStatus(id, newStatus);
      if (res.success && res.inquiry) {
        const updated = inquiries.map(i => {
          if (i.id === id) {
            const updatedInq = { ...i, status: newStatus };
            if (selectedInquiry?.id === id) setSelectedInquiry(updatedInq);
            return updatedInq;
          }
          return i;
        });
        setInquiries(updated);
        calculateStats(updated);
      } else {
        alert(res.error || 'Failed to update status.');
      }
    } catch (e) {
      alert('Error updating status.');
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', position: 'relative', display: 'flex', flexDirection: 'column', color: 'var(--white)' }}>
      {/* Background Matrix Grid */}
      <div className="console-grid-bg" />
      <div className="ambient-glow-orb" style={{ top: '10%', right: '10%', background: 'var(--glow-cyan)', width: '600px', height: '600px' }} />
      <div className="ambient-glow-orb" style={{ bottom: '10%', left: '10%', background: 'var(--glow-purple)', width: '600px', height: '600px' }} />

      {/* Nav HUD bar */}
      <header className="hud-frame" style={{ margin: '20px', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--white)', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 'bold' }}>
            ← MEHTA_OS // HOME
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>MANAGER_CONTROL_DECK_v1.0</span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          {session && (
            <span style={{ color: '#e8c84a' }}>
              OPERATOR // {session.name} ({session.role})
            </span>
          )}
          {session && (
            <button
              onClick={handleLogout}
              style={{ background: 'rgba(224, 90, 78, 0.15)', border: '1px solid rgba(224, 90, 78, 0.3)', borderRadius: '4px', padding: '2px 8px', color: '#e05a4e', fontSize: '9px', fontFamily: 'var(--mono)', cursor: 'pointer' }}
            >
              LOGOUT
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', padding: '0 20px 40px', gap: '20px' }}>
        <AnimatePresence mode="wait">
          {!session ? (
            /* Authentication Screen (Zenvvy simulated login style) */
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className="hud-frame liquid-glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="specular-glare" />
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', textAlign: 'center' }}>
                  <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    RESTRICTED ADMINISTRATIVE CONSOLE
                  </h1>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--mono)', marginTop: '4px' }}>
                    SYS_SECURITY: SIMULATED PASSWORDLESS LOGIN ACTIVE
                  </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass-input-container">
                    <label className="glass-input-label">Operator Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="glass-input-field"
                      placeholder="Enter name to persist session..."
                    />
                  </div>

                  <div className="glass-input-container">
                    <label className="glass-input-label">Operational Role</label>
                    <div className="glass-select-wrapper">
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value)}
                        className="glass-select-field"
                      >
                        <option value="Admin">System Administrator</option>
                        <option value="Recruiter">Technical Recruiter</option>
                        <option value="Educator">NIT Jalandhar Professor</option>
                        <option value="Guest">Guest Operator</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="glass-capsule capsule-glow-orange" style={{ width: '100%', marginTop: '8px' }}>
                    EXECUTE SECURE AUTHENTICATION ↗
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* Dashboard Screen */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Analytics Bento Banner */}
              <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="bento-card" style={{ padding: '20px' }}>
                  <div className="specular-glare" />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>TOTAL INQUIRIES</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 4px', color: 'var(--accent)' }}>{stats.total}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--mono)' }}>SQLITE_ACTIVE_RECORDS</div>
                </div>
                
                <div className="bento-card" style={{ padding: '20px' }}>
                  <div className="specular-glare" />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>PENDING DISPATCH</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 4px', color: '#e8c84a' }}>{stats.pending}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--mono)' }}>REQUIRING_COMMUNICATION</div>
                </div>

                <div className="bento-card" style={{ padding: '20px' }}>
                  <div className="specular-glare" />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>COMPLETED TRANS</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 4px', color: '#50c878' }}>{stats.contacted + stats.archived}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--mono)' }}>CONTACTED_OR_ARCHIVED</div>
                </div>

                <div className="bento-card" style={{ padding: '20px' }}>
                  <div className="specular-glare" />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>DOMINANT CONNECTION REASON</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '14px 0 8px', color: '#5a8fc8', textTransform: 'uppercase' }}>{stats.avgBudget}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--mono)' }}>MOST_COMMON_CONNECTION_TYPE</div>
                </div>
              </div>

              {/* Main Panel Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flex: 1, minHeight: '500px' }} className="manager-dashboard-layout">
                {/* Left Side: Table List of Inquiries */}
                <div className="hud-frame liquid-glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div className="specular-glare" />
                  <h2 style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '-0.01em', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>DATABASE TRANSACTIONS CABINET</span>
                    <button
                      onClick={fetchInquiries}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--mono)', fontSize: '10px', cursor: 'pointer' }}
                    >
                      REFRESH
                    </button>
                  </h2>

                  {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                      EXECUTING DB_QUERY TRANSACTION...
                    </div>
                  ) : inquiries.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                      NO INQUIRIES REGISTERED IN DATABASE.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', flex: 1 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--mono)', fontSize: '10px' }}>
                            <th style={{ padding: '12px 8px' }}>VISITOR NAME</th>
                            <th style={{ padding: '12px 8px' }}>REASON</th>
                            <th style={{ padding: '12px 8px' }}>AFFILIATION</th>
                            <th style={{ padding: '12px 8px' }}>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inquiries.map((inq) => {
                            let statusColor = '#e8c84a'; // pending
                            if (inq.status === 'contacted') statusColor = '#50c878';
                            if (inq.status === 'archived') statusColor = 'rgba(255,255,255,0.3)';
                            
                            const isSelected = selectedInquiry?.id === inq.id;

                            return (
                              <tr
                                key={inq.id}
                                onClick={() => setSelectedInquiry(inq)}
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: isSelected ? 'rgba(255,255,255,0.03)' : 'transparent', transition: 'background 0.2s' }}
                                className="manager-table-row"
                              >
                                <td style={{ padding: '14px 8px', fontWeight: 'bold' }}>
                                  {inq.name}
                                  {inq.company && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>{inq.company}</div>}
                                </td>
                                <td style={{ padding: '14px 8px', fontFamily: 'var(--mono)', fontSize: '12px' }}>{inq.budget}</td>
                                <td style={{ padding: '14px 8px', fontSize: '12px' }}>{inq.timeline}</td>
                                <td style={{ padding: '14px 8px' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: statusColor, textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }}></span>
                                    {inq.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Side: Inquiry Detailed Inspector Panel */}
                <div className="hud-frame" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="hud-header">
                    <span>OPERATIONAL_INSPECTION_BUFFER</span>
                    <span style={{ color: selectedInquiry ? '#50c878' : 'rgba(255,255,255,0.2)' }}>
                      {selectedInquiry ? 'BUFFER LOADED' : 'BUFFER EMPTY'}
                    </span>
                  </div>

                  <div className="terminal-scroll-panel" style={{ flex: '1', background: '#050505', padding: '24px', overflowY: 'auto' }}>
                    {selectedInquiry ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <span style={{ color: '#e8c84a', fontWeight: 'bold', fontFamily: 'var(--mono)', fontSize: '10px' }}>[[VISITOR PROFILE]]</span>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '6px' }}>{selectedInquiry.name}</h3>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
                            <a href={`mailto:${selectedInquiry.email}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{selectedInquiry.email}</a>
                            {selectedInquiry.company && <span> // {selectedInquiry.company}</span>}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px 16px' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>CONNECTION REASON</div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px', color: '#50c878', fontFamily: 'var(--mono)' }}>{selectedInquiry.budget}</div>
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>AFFILIATION / ROLE</div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px', color: '#5a8fc8' }}>{selectedInquiry.timeline}</div>
                          </div>
                        </div>

                        <div>
                          <span style={{ color: '#e8c84a', fontWeight: 'bold', fontFamily: 'var(--mono)', fontSize: '10px' }}>[MESSAGE CONTENT]</span>
                          <p style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '16px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            {selectedInquiry.message}
                          </p>
                        </div>

                        <div>
                          <span style={{ color: '#e8c84a', fontWeight: 'bold', fontFamily: 'var(--mono)', fontSize: '10px' }}>[SYSTEM METRICS]</span>
                          <div style={{ marginTop: '6px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span>RECORD_UUID // {selectedInquiry.id}</span>
                            <span>CREATED_AT // {selectedInquiry.createdAt.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="rules-divider" style={{ margin: '10px 0' }} />

                        {/* Action Panel */}
                        <div>
                          <span style={{ color: '#e8c84a', fontWeight: 'bold', fontFamily: 'var(--mono)', fontSize: '10px' }}>[OPERATIONAL DISPATCH]</span>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleStatusChange(selectedInquiry.id, 'pending')}
                              className="glass-capsule"
                              style={{ padding: '6px 12px', fontSize: '10px', background: selectedInquiry.status === 'pending' ? '#e8c84a' : 'transparent', color: selectedInquiry.status === 'pending' ? 'var(--black)' : 'var(--white)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              SET PENDING
                            </button>
                            <button
                              onClick={() => handleStatusChange(selectedInquiry.id, 'contacted')}
                              className="glass-capsule"
                              style={{ padding: '6px 12px', fontSize: '10px', background: selectedInquiry.status === 'contacted' ? '#50c878' : 'transparent', color: selectedInquiry.status === 'contacted' ? 'var(--black)' : 'var(--white)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              SET CONTACTED
                            </button>
                            <button
                              onClick={() => handleStatusChange(selectedInquiry.id, 'archived')}
                              className="glass-capsule"
                              style={{ padding: '6px 12px', fontSize: '10px', background: selectedInquiry.status === 'archived' ? 'rgba(255,255,255,0.2)' : 'transparent', color: selectedInquiry.status === 'archived' ? 'var(--black)' : 'var(--white)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              SET ARCHIVED
                            </button>
                            <button
                              onClick={() => handleDelete(selectedInquiry.id)}
                              className="glass-capsule"
                              style={{ padding: '6px 12px', fontSize: '10px', background: 'rgba(224, 90, 78, 0.15)', color: '#e05a4e', border: '1px solid rgba(224, 90, 78, 0.3)' }}
                            >
                              DELETE RECORD
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--mono)', fontSize: '12px', textAlign: 'center' }}>
                        SELECT A SYSTEM TRANSACTION FROM THE CABINET<br />TO INITIATE OPERATIONAL DISPATCH &amp; INSPECTION.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .manager-table-row:hover {
          background: rgba(255, 255, 255, 0.015) !important;
        }
        @media (max-width: 900px) {
          .manager-dashboard-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <footer style={{ padding: '24px', textAlign: 'center', fontSize: '11px', fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', zIndex: 10 }}>
        © 2026 SARTHAK MEHTA. CONTROL PORTAL LOGGED &amp; REGISTERED.
      </footer>
    </div>
  );
}
