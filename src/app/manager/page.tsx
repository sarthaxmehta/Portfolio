'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Particles, ParticlesProvider, useParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

import {
  adminLoginAction,
  adminLogoutAction,
  checkAdminSessionAction,
  updateAdminPasscodeAction,
} from '../../actions/auth';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectFeatured,
} from '../../actions/project';
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../../actions/experience';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../../actions/skill';
import {
  getInquiries,
  deleteInquiry,
  updateInquiryStatus,
  addInquiryNote,
} from '../../actions/inquiry';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: string; num: string | null; title: string; desc: string; tags: string;
  imageUrl: string; projectUrl: string | null; githubUrl: string | null;
  architecture: string | null; contributions: string | null; challenge: string | null;
  featured: boolean; order: number; createdAt: Date;
}
interface Experience {
  id: string; title: string; organization: string; location: string | null;
  type: string; startDate: string; endDate: string | null; current: boolean;
  description: string | null; bulletPoints: string | null; technologies: string | null;
  order: number; createdAt: Date;
}
interface Skill {
  id: string; name: string; category: string; proficiency: number;
  featured: boolean; order: number; createdAt: Date;
}
interface Inquiry {
  id: string; name: string; email: string; company: string | null; budget: string;
  timeline: string; message: string; status: string; notes: string | null; createdAt: Date;
}
type Tab = 'overview' | 'experiences' | 'projects' | 'skills' | 'inquiries' | 'security';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: '#050507',
  surface: '#0C0C10',
  card: '#12121A',
  card2: '#1A1A24',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.18)',
  accent: '#FF4C24',
  accent2: '#FF6B47',
  cyan: '#00D8FF',
  violet: '#7B61FF',
  green: '#4ADE80',
  yellow: '#FBBF24',
  text1: '#F2F2F0',
  text2: 'rgba(242,242,240,0.72)',
  text3: 'rgba(242,242,240,0.44)',
  fontMono: "'Space Mono', monospace",
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'Inter', sans-serif",
};

// ─── Sidebar navigation items ─────────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '⬡' },
  { id: 'experiences', label: 'Experience', icon: '◈' },
  { id: 'projects', label: 'Projects', icon: '◻' },
  { id: 'skills', label: 'Skills Matrix', icon: '◎' },
  { id: 'inquiries', label: 'Inbox', icon: '◇' },
  { id: 'security', label: 'Security', icon: '◐' },
];

// ─── Particles config ─────────────────────────────────────────────────────────
const PARTICLES_OPTIONS: any = {
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  particles: {
    number: { value: 60, density: { enable: true, area: 900 } },
    color: { value: ['#FF4C24', '#00D8FF', '#7B61FF'] },
    links: {
      enable: true, distance: 140,
      color: '#FF4C24', opacity: 0.12, width: 1,
    },
    move: {
      enable: true, speed: 0.4,
      outModes: { default: 'bounce' },
    },
    opacity: { value: { min: 0.2, max: 0.5 } },
    size: { value: { min: 1, max: 2.5 } },
    shape: { type: 'circle' },
  },
  detectRetina: true,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, style, className, onClick }: {
  children: React.ReactNode; style?: React.CSSProperties;
  className?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        backdropFilter: 'blur(20px)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string;
  color?: string; icon?: string;
}) {
  return (
    <GlassCard style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontFamily: T.fontMono, color: T.text3, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: 18, opacity: 0.7 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 42, fontFamily: T.fontDisplay, fontWeight: 800, letterSpacing: '-2px', color: color || T.text1, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, fontFamily: T.fontMono, color: color ? `${color}99` : T.text3, marginTop: 8 }}>
          {sub}
        </div>
      )}
    </GlassCard>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#FBBF24' },
    contacted: { bg: 'rgba(74,222,128,0.15)', color: '#4ADE80' },
    archived: { bg: 'rgba(255,255,255,0.08)', color: T.text3 },
    starred: { bg: 'rgba(0,216,255,0.15)', color: '#00D8FF' },
    Internship: { bg: 'rgba(255,76,36,0.15)', color: '#FF4C24' },
    Education: { bg: 'rgba(123,97,255,0.15)', color: '#7B61FF' },
    Work: { bg: 'rgba(0,216,255,0.15)', color: '#00D8FF' },
    Leadership: { bg: 'rgba(74,222,128,0.15)', color: '#4ADE80' },
  };
  const s = map[status] || { bg: 'rgba(255,255,255,0.08)', color: T.text3 };
  return (
    <span style={{
      background: s.bg, color: s.color, borderRadius: 20,
      padding: '3px 10px', fontSize: 10, fontFamily: T.fontMono,
      textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function AdminInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontFamily: T.fontMono, color: T.text3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: '100%', background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '11px 14px', color: T.text1,
          fontFamily: props.type === 'password' ? T.fontMono : T.fontBody,
          fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
          boxSizing: 'border-box',
          ...(props.style || {}),
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = T.accent; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
      />
    </div>
  );
}

function AdminTextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontFamily: T.fontMono, color: T.text3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
        {label}
      </label>
      <textarea
        {...props}
        style={{
          width: '100%', background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '11px 14px', color: T.text1,
          fontFamily: T.fontBody, fontSize: 14, outline: 'none',
          transition: 'border-color 0.2s', resize: 'vertical', boxSizing: 'border-box',
          ...(props.style || {}),
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = T.accent; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
      />
    </div>
  );
}

function AdminSelect({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontFamily: T.fontMono, color: T.text3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>
        {label}
      </label>
      <select
        {...props}
        style={{
          width: '100%', background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '11px 14px', color: T.text1,
          fontFamily: T.fontBody, fontSize: 14, outline: 'none',
          transition: 'border-color 0.2s', boxSizing: 'border-box',
        }}
      >
        {children}
      </select>
    </div>
  );
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
      <div>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: T.text1, margin: 0 }}>
          {title}
        </h2>
        {sub && <p style={{ color: T.text3, fontSize: 13, marginTop: 6, fontFamily: T.fontBody }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function PrimaryBtn({ children, onClick, type, small, danger, style }: {
  children: React.ReactNode; onClick?: () => void; type?: 'submit' | 'button' | 'reset';
  small?: boolean; danger?: boolean; style?: React.CSSProperties;
}) {
  const bg = danger ? '#EF4444' : T.accent;
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      style={{
        background: bg, color: '#fff', border: 'none', borderRadius: 10,
        padding: small ? '8px 16px' : '12px 22px',
        fontSize: small ? 12 : 13, fontWeight: 600, fontFamily: T.fontMono,
        letterSpacing: '0.5px', boxShadow: `0 4px 16px ${bg}40`,
        transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${bg}50`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${bg}40`; }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, type, small, style }: {
  children: React.ReactNode; onClick?: () => void; type?: 'submit' | 'button' | 'reset';
  small?: boolean; style?: React.CSSProperties;
}) {
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      style={{
        background: 'transparent', color: T.text2, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: '10px 18px', fontSize: 13,
        fontFamily: T.fontMono, transition: 'border-color 0.2s, color 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text1; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; }}
    >
      {children}
    </button>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function AdminModal({ isOpen, onClose, title, subtitle, children, wide }: {
  isOpen: boolean; onClose: () => void; title: string; subtitle?: string;
  children: React.ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(20px)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            style={{
              width: '100%', maxWidth: wide ? 780 : 580,
              maxHeight: '90vh', overflowY: 'auto',
              background: T.surface,
              border: `1px solid rgba(255,76,36,0.3)`,
              borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,76,36,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '28px 32px 20px',
              borderBottom: `1px solid ${T.border}`,
              position: 'sticky', top: 0, background: T.surface, zIndex: 1,
            }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: T.fontMono, color: T.accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>
                  Admin Command Center
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 800, color: T.text1, margin: 0 }}>{title}</h3>
                {subtitle && <p style={{ color: T.text3, fontSize: 13, marginTop: 4 }}>{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: T.card,
                  border: `1px solid ${T.border}`, color: T.text2, fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a36'; e.currentTarget.style.color = T.text1; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.card; e.currentTarget.style.color = T.text2; }}
              >
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: '28px 32px 32px' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component (inner, consumed by wrapper) ──────────────────────────────
function SecureAdminPlatform() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [clock, setClock] = useState('');

  // Auth
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Data
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Toast
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  // Filters
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');

  // Modals
  const [activeModal, setActiveModal] = useState<'project' | 'experience' | 'skill' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Project form
  const [projectForm, setProjectForm] = useState({
    num: '01', title: '', desc: '', tags: '', imageUrl: '/projects/placeholder.png',
    projectUrl: '', githubUrl: '', architecture: '', contributions: [''],
    challenge: '', featured: false, order: 0,
  });

  // Experience form
  const [expForm, setExpForm] = useState({
    title: '', organization: '', location: '', type: 'Internship',
    startDate: '', endDate: '', current: false, description: '',
    bulletPoints: [''], technologies: '', order: 0,
  });

  // Skill form
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Programming', proficiency: 85, featured: true, order: 0 });

  // Security form
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });

  // Note editing
  const [editingNote, setEditingNote] = useState('');

  // Particles readiness state comes from useParticlesProvider (populated by outer ParticlesProvider)
  // No local init needed here — handled at export wrapper below
  const { loaded: particlesReady } = useParticlesProvider();

  // Mount + body class + clock
  useEffect(() => {
    setMounted(true);
    document.body.classList.add('manager-active');
    verifySession();
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => {
      clearInterval(interval);
      document.body.classList.remove('manager-active');
    };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4200);
  }, []);

  const verifySession = async () => {
    try {
      const res = await checkAdminSessionAction();
      setIsAuthenticated(res.authenticated);
      if (res.authenticated) fetchAllData();
    } catch { setIsAuthenticated(false); }
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [pR, eR, sR, iR] = await Promise.all([getProjects(), getExperiences(), getSkills(), getInquiries()]);
      if (pR.success && pR.projects) setProjects(pR.projects as any);
      if (eR.success && eR.experiences) setExperiences(eR.experiences as any);
      if (sR.success && sR.skills) setSkills(sR.skills as any);
      if (iR.success && iR.inquiries) setInquiries(iR.inquiries as any);
    } catch { showToast('Failed to sync data.', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await adminLoginAction(passcode);
      if (res.success) {
        setIsAuthenticated(true);
        setPasscode('');
        fetchAllData();
      } else { setAuthError(res.error || 'Authentication failed.'); }
    } catch { setAuthError('Connection error. Try again.'); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await adminLogoutAction();
    setIsAuthenticated(false);
    showToast('Session terminated. See you soon.', 'error');
  };

  // ── Project handlers ──────────────────────────────────────────────────────
  const openProjectModal = (p?: Project) => {
    if (p) {
      setEditingItem(p);
      let c: string[] = [''];
      try { if (p.contributions) c = JSON.parse(p.contributions); } catch {}
      setProjectForm({
        num: p.num || '01', title: p.title, desc: p.desc, tags: p.tags,
        imageUrl: p.imageUrl, projectUrl: p.projectUrl || '', githubUrl: p.githubUrl || '',
        architecture: p.architecture || '', contributions: c.length ? c : [''],
        challenge: p.challenge || '', featured: p.featured, order: p.order,
      });
    } else {
      setEditingItem(null);
      setProjectForm({ num: `0${projects.length + 1}`, title: '', desc: '', tags: '', imageUrl: '/projects/placeholder.png', projectUrl: '', githubUrl: '', architecture: '', contributions: [''], challenge: '', featured: false, order: projects.length + 1 });
    }
    setActiveModal('project');
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const contribs = projectForm.contributions.filter(c => c.trim());
    try {
      const payload = { ...projectForm, contributions: contribs };
      const res = editingItem ? await updateProject(editingItem.id, payload) : await createProject(payload);
      if (res.success) {
        showToast(editingItem ? 'Project updated!' : 'Project created!');
        setActiveModal(null); fetchAllData();
      } else { showToast(res.error || 'Failed.', 'error'); }
    } catch { showToast('Error saving project.', 'error'); }
  };

  const deleteProj = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await deleteProject(id);
    if (res.success) { showToast('Project deleted.'); fetchAllData(); }
    else showToast(res.error || 'Failed.', 'error');
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    const res = await toggleProjectFeatured(id, !featured);
    if (res.success) { showToast(`Featured: ${!featured}`); fetchAllData(); }
  };

  // ── Experience handlers ───────────────────────────────────────────────────
  const openExpModal = (exp?: Experience) => {
    if (exp) {
      setEditingItem(exp);
      let b: string[] = [''];
      try { if (exp.bulletPoints) b = JSON.parse(exp.bulletPoints); } catch {}
      setExpForm({
        title: exp.title, organization: exp.organization, location: exp.location || '',
        type: exp.type, startDate: exp.startDate, endDate: exp.endDate || '',
        current: exp.current, description: exp.description || '',
        bulletPoints: b.length ? b : [''], technologies: exp.technologies || '', order: exp.order,
      });
    } else {
      setEditingItem(null);
      setExpForm({ title: '', organization: '', location: '', type: 'Internship', startDate: '', endDate: '', current: false, description: '', bulletPoints: [''], technologies: '', order: experiences.length + 1 });
    }
    setActiveModal('experience');
  };

  const saveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    const bullets = expForm.bulletPoints.filter(b => b.trim());
    try {
      const payload = { ...expForm, bulletPoints: bullets };
      const res = editingItem ? await updateExperience(editingItem.id, payload) : await createExperience(payload);
      if (res.success) {
        showToast(editingItem ? 'Experience updated!' : 'Experience added!');
        setActiveModal(null); fetchAllData();
      } else showToast(res.error || 'Failed.', 'error');
    } catch { showToast('Error saving experience.', 'error'); }
  };

  const deleteExp = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await deleteExperience(id);
    if (res.success) { showToast('Deleted.'); fetchAllData(); }
    else showToast(res.error || 'Failed.', 'error');
  };

  // ── Skill handlers ────────────────────────────────────────────────────────
  const openSkillModal = (s?: Skill) => {
    if (s) {
      setEditingItem(s);
      setSkillForm({ name: s.name, category: s.category, proficiency: s.proficiency, featured: s.featured, order: s.order });
    } else {
      setEditingItem(null);
      setSkillForm({ name: '', category: 'Programming', proficiency: 85, featured: true, order: skills.length + 1 });
    }
    setActiveModal('skill');
  };

  const saveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = editingItem ? await updateSkill(editingItem.id, skillForm) : await createSkill(skillForm);
      if (res.success) {
        showToast(editingItem ? 'Skill updated!' : 'Skill added!');
        setActiveModal(null); fetchAllData();
      } else showToast(res.error || 'Failed.', 'error');
    } catch { showToast('Error.', 'error'); }
  };

  const deleteSkillItem = async (id: string, name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return;
    const res = await deleteSkill(id);
    if (res.success) { showToast('Skill removed.'); fetchAllData(); }
  };

  // ── Inquiry handlers ──────────────────────────────────────────────────────
  const setInquiryStatus = async (id: string, status: string) => {
    const res = await updateInquiryStatus(id, status);
    if (res.success) { showToast(`Marked as ${status}`); fetchAllData(); }
  };

  const deleteInq = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    const res = await deleteInquiry(id);
    if (res.success) { showToast('Inquiry deleted.'); setSelectedInquiry(null); fetchAllData(); }
  };

  const saveNote = async (id: string, notes: string) => {
    const res = await addInquiryNote(id, notes);
    if (res.success) { showToast('Note saved.'); fetchAllData(); }
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const filteredInquiries = inquiries.filter(i => inquiryFilter === 'all' || i.status === inquiryFilter);
  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});
  const categoryColors: Record<string, string> = {
    'Programming': T.accent, 'Frameworks': T.violet, 'AI/ML': T.cyan, 'Databases': '#4ADE80', 'Tools': '#FBBF24',
  };

  // ── Loading / Mount gate ──────────────────────────────────────────────────
  if (!mounted || isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `2px solid ${T.accent}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <div style={{ color: T.accent, fontFamily: T.fontMono, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase' }}>
            Initializing Security Gateway
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Auth Gate ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
        {/* Particle bg */}
        {particlesReady && (
          <Particles id="auth-particles" options={{ ...PARTICLES_OPTIONS, particles: { ...PARTICLES_OPTIONS.particles, number: { value: 40 } } }} style={{ position: 'absolute', inset: 0 }} />
        )}

        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, background: `radial-gradient(circle, rgba(255,76,36,0.08) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 250, height: 250, background: `radial-gradient(circle, rgba(123,97,255,0.07) 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%', maxWidth: 440, position: 'relative', zIndex: 2,
            background: 'rgba(12,12,16,0.95)',
            border: '1px solid rgba(255,76,36,0.25)',
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(255,76,36,0.08)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Logo strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent}, ${T.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: T.fontDisplay }}>
              SM
            </div>
            <div>
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14, color: T.text1 }}>Sarthak Mehta</div>
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.accent, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Admin Command Center</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: T.fontMono, fontSize: 9, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '1px' }}>LOCKED</span>
            </div>
          </div>

          <h1 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8, lineHeight: 1.1 }}>
            Access Verification
          </h1>
          <p style={{ fontSize: 13, color: T.text3, marginBottom: 32, lineHeight: 1.6 }}>
            Restricted zone. Enter your master administrator passcode to establish a secure session.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AdminInput
              label="Master Passcode"
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••••"
            />

            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13, fontFamily: T.fontMono }}
                >
                  ⚠ {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <PrimaryBtn type="submit" style={{ width: '100%', padding: '14px', justifyContent: 'center', display: 'flex' }}>
              {authLoading ? 'Authenticating...' : 'Authenticate & Enter →'}
            </PrimaryBtn>
          </form>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: T.text3, fontFamily: T.fontMono }}>Default: sarthak2026</span>
            <Link href="/" style={{ fontSize: 11, color: T.accent, fontFamily: T.fontMono, textDecoration: 'none' }}>← Public Site</Link>
          </div>
        </motion.div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  // ── Sidebar width ─────────────────────────────────────────────────────────
  const SIDEBAR_W = sidebarCollapsed ? 72 : 240;

  // ── MAIN ADMIN DASHBOARD ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text1, display: 'flex', fontFamily: T.fontBody }}>

      {/* ── TOAST STACK ── */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              style={{
                background: t.type === 'success' ? T.card : 'rgba(30,10,10,0.97)',
                border: `1px solid ${t.type === 'success' ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)'}`,
                borderRadius: 12, padding: '12px 20px',
                fontSize: 13, fontFamily: T.fontMono,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', gap: 10,
                maxWidth: 320,
              }}
            >
              <span>{t.type === 'success' ? '✓' : '✗'}</span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: SIDEBAR_W, minHeight: '100vh', background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 16px 20px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg, ${T.accent}, ${T.violet})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: T.fontDisplay,
            }}>SM</div>
            {!sidebarCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap' }}>Sarthak Mehta</div>
                <div style={{ fontSize: 9, fontFamily: T.fontMono, color: T.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Platform</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const hasBadge = item.id === 'inquiries' && pendingCount > 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: sidebarCollapsed ? '12px 16px' : '11px 14px',
                  borderRadius: 10, border: 'none',
                  background: isActive ? `rgba(255,76,36,0.12)` : 'transparent',
                  color: isActive ? T.accent : T.text2,
                  transition: 'all 0.2s',
                  position: 'relative',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  boxShadow: isActive ? `inset 1px 0 0 ${T.accent}, inset 0 0 0 1px rgba(255,76,36,0.15)` : 'none',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T.text1; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text2; } }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span style={{ fontSize: 13, fontWeight: 500, fontFamily: T.fontBody, whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {hasBadge && (
                      <span style={{ background: T.accent, color: '#fff', borderRadius: 20, padding: '2px 7px', fontSize: 10, fontWeight: 700, fontFamily: T.fontMono }}>
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && hasBadge && (
                  <span style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, borderRadius: '50%', background: T.accent }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: collapse + live clock */}
        <div style={{ padding: '16px 10px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          {!sidebarCollapsed && (
            <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.text3, textAlign: 'center', marginBottom: 12, letterSpacing: '1px' }}>
              {clock}
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text3, fontSize: 12, fontFamily: T.fontMono, transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = T.text1; e.currentTarget.style.borderColor = T.borderHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.text3; e.currentTarget.style.borderColor = T.border; }}
          >
            {sidebarCollapsed ? '→' : '← Collapse'}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, marginLeft: SIDEBAR_W, transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(5,5,7,0.9)', backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${T.border}`,
          padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 16 }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.icon} {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </div>
            <div style={{ fontSize: 11, fontFamily: T.fontMono, color: T.text3, marginTop: 2 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Live session indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: '6px 14px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: T.fontMono, fontSize: 10, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Session</span>
            </div>

            <a href="/" target="_blank" style={{ fontSize: 12, fontFamily: T.fontMono, color: T.text3, textDecoration: 'none', padding: '8px 14px', border: `1px solid ${T.border}`, borderRadius: 8, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.text1; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text3; }}>
              ↗ Public Site
            </a>

            <button
              onClick={handleLogout}
              style={{ fontSize: 12, fontFamily: T.fontMono, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 14px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main style={{ flex: 1, padding: '32px', maxWidth: 1200, width: '100%', alignSelf: 'center', boxSizing: 'border-box' }}>

          {/* ─────────── OVERVIEW ─────────── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Particle background for overview */}
              {particlesReady && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                  <Particles id="overview-particles" options={PARTICLES_OPTIONS} />
                </div>
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>
                    Command Telemetry
                  </h1>
                  <p style={{ color: T.text3, fontSize: 14 }}>Real-time overview of your portfolio platform</p>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                  <StatCard label="Total Projects" value={projects.length} sub={`${projects.filter(p => p.featured).length} featured`} color={T.accent} icon="🚀" />
                  <StatCard label="Experiences" value={experiences.length} sub={`${experiences.filter(e => e.current).length} active role(s)`} color={T.violet} icon="💼" />
                  <StatCard label="Skills Registered" value={skills.length} sub="Across 5 categories" color={T.cyan} icon="⚡" />
                  <StatCard label="Inbox Messages" value={inquiries.length} sub={pendingCount > 0 ? `${pendingCount} awaiting response` : 'All handled'} color={pendingCount > 0 ? T.yellow : T.green} icon="📬" />
                </div>

                {/* Quick actions + System info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <GlassCard style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>⚡ Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: '+ New Project', tab: 'projects' as Tab, action: () => { setActiveTab('projects'); setTimeout(() => openProjectModal(), 100); } },
                        { label: '+ Add Experience', tab: 'experiences' as Tab, action: () => { setActiveTab('experiences'); setTimeout(() => openExpModal(), 100); } },
                        { label: '+ Register Skill', tab: 'skills' as Tab, action: () => { setActiveTab('skills'); setTimeout(() => openSkillModal(), 100); } },
                        { label: '→ Review Inbox', tab: 'inquiries' as Tab, action: () => setActiveTab('inquiries') },
                      ].map(item => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          style={{
                            background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10,
                            padding: '12px 16px', color: T.text2, textAlign: 'left', fontSize: 13,
                            fontFamily: T.fontMono, transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.text1; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2; }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🛡 System Diagnostics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { k: 'Database', v: 'SQLite · Prisma ORM v7', color: T.green },
                        { k: 'Auth Model', v: 'HMAC-SHA256 · Cookie Session', color: T.cyan },
                        { k: 'Framework', v: 'Next.js 16 · App Router', color: T.violet },
                        { k: 'Session Clock', v: clock, color: T.text2 },
                        { k: 'Environment', v: typeof window !== 'undefined' ? 'Client Active' : 'SSR', color: T.yellow },
                      ].map(({ k, v, color }) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: T.fontMono, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                          <span style={{ color: T.text3 }}>{k}</span>
                          <span style={{ color }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────── EXPERIENCES ─────────── */}
          {activeTab === 'experiences' && (
            <motion.div key="experiences" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SectionHeader
                title="Experience & Education"
                sub="Manage work history, internships, academic roles, and career milestones displayed on the public timeline."
                action={<PrimaryBtn onClick={() => openExpModal()}>+ Add Entry</PrimaryBtn>}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {experiences.map((exp, i) => {
                  let bullets: string[] = [];
                  try { if (exp.bulletPoints) bullets = JSON.parse(exp.bulletPoints); } catch {}
                  return (
                    <GlassCard key={exp.id} style={{ padding: '24px 28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                            <Badge status={exp.type} />
                            <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.text3 }}>
                              {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                            </span>
                            {exp.current && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: T.fontMono, fontSize: 10, color: T.green }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
                                Active
                              </span>
                            )}
                          </div>
                          <h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{exp.title}</h3>
                          <div style={{ fontSize: 14, color: T.accent, fontFamily: T.fontMono, marginBottom: 10 }}>{exp.organization}{exp.location ? ` · ${exp.location}` : ''}</div>
                          {exp.description && <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 12 }}>{exp.description}</p>}
                          {bullets.length > 0 && (
                            <ul style={{ paddingLeft: 18, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {bullets.map((b, bi) => (
                                <li key={bi} style={{ fontSize: 13, color: T.text3, lineHeight: 1.6 }}>{b}</li>
                              ))}
                            </ul>
                          )}
                          {exp.technologies && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {exp.technologies.split(',').map(t => (
                                <span key={t} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '3px 9px', fontSize: 10, fontFamily: T.fontMono, color: T.text2 }}>
                                  {t.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                          <GhostBtn small onClick={() => openExpModal(exp)} style={{ fontSize: 12, padding: '7px 14px' }}>Edit ✏</GhostBtn>
                          <PrimaryBtn small danger onClick={() => deleteExp(exp.id, exp.title)}>Delete</PrimaryBtn>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─────────── PROJECTS ─────────── */}
          {activeTab === 'projects' && (
            <motion.div key="projects" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SectionHeader
                title="Projects Repository"
                sub="Create, edit, and manage all portfolio projects. Toggle featured status to highlight on the public site."
                action={<PrimaryBtn onClick={() => openProjectModal()}>+ Create Project</PrimaryBtn>}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
                {projects.map(p => {
                  let contribs: string[] = [];
                  try { if (p.contributions) contribs = JSON.parse(p.contributions); } catch {}
                  return (
                    <GlassCard
                      key={p.id}
                      style={{
                        padding: 24,
                        display: 'flex', flexDirection: 'column', gap: 14,
                        borderColor: p.featured ? 'rgba(255,76,36,0.35)' : T.border,
                        boxShadow: p.featured ? '0 0 24px rgba(255,76,36,0.07)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.accent }}>{p.num || '—'}</span>
                        <button
                          onClick={() => toggleFeatured(p.id, p.featured)}
                          style={{
                            background: p.featured ? 'rgba(255,76,36,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${p.featured ? 'rgba(255,76,36,0.4)' : T.border}`,
                            borderRadius: 20, padding: '3px 10px', fontSize: 10,
                            color: p.featured ? T.accent : T.text3, fontFamily: T.fontMono,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = p.featured ? 'rgba(255,76,36,0.4)' : T.border; e.currentTarget.style.color = p.featured ? T.accent : T.text3; }}
                        >
                          {p.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </div>

                      <h3 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>{p.title}</h3>
                      <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, flex: 1 }}>{p.desc}</p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {p.tags.split(',').slice(0, 5).map(t => (
                          <span key={t} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '3px 9px', fontSize: 10, fontFamily: T.fontMono, color: T.text2 }}>
                            {t.trim()}
                          </span>
                        ))}
                      </div>

                      {p.architecture && (
                        <div style={{ fontSize: 11, color: T.text3, fontFamily: T.fontMono, background: T.card2, padding: '8px 12px', borderRadius: 8, borderLeft: `3px solid ${T.accent}` }}>
                          {p.architecture}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                        <GhostBtn onClick={() => openProjectModal(p)} style={{ flex: 1, justifyContent: 'center', display: 'flex', fontSize: 12, padding: '8px' }}>Edit ✏</GhostBtn>
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 11, fontFamily: T.fontMono, color: T.text2, textDecoration: 'none' }}>
                            GitHub ↗
                          </a>
                        )}
                        <PrimaryBtn small danger onClick={() => deleteProj(p.id, p.title)} style={{ padding: '8px 12px' }}>🗑</PrimaryBtn>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─────────── SKILLS MATRIX ─────────── */}
          {activeTab === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SectionHeader
                title="Technical Skills Matrix"
                sub="Manage programming languages, frameworks, AI/ML tools, and proficiency metrics across categories."
                action={<PrimaryBtn onClick={() => openSkillModal()}>+ Register Skill</PrimaryBtn>}
              />

              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div key={category} style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: categoryColors[category] || T.accent }} />
                    <span style={{ fontFamily: T.fontMono, fontSize: 11, color: categoryColors[category] || T.accent, textTransform: 'uppercase', letterSpacing: '2px' }}>
                      {category}
                    </span>
                    <div style={{ flex: 1, height: 1, background: T.border }} />
                    <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.text3 }}>{catSkills.length} skills</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {catSkills.map(skill => (
                      <GlassCard key={skill.id} style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <h4 style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 }}>{skill.name}</h4>
                          <span style={{ fontFamily: T.fontMono, fontSize: 13, color: categoryColors[skill.category] || T.accent, fontWeight: 700 }}>
                            {skill.proficiency}%
                          </span>
                        </div>

                        {/* Proficiency bar */}
                        <div style={{ height: 5, background: T.card2, borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${skill.proficiency}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            style={{ height: '100%', background: `linear-gradient(90deg, ${categoryColors[skill.category] || T.accent}, ${categoryColors[skill.category] || T.accent}99)`, borderRadius: 4 }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <GhostBtn onClick={() => openSkillModal(skill)} style={{ flex: 1, justifyContent: 'center', display: 'flex', fontSize: 11, padding: '6px 10px' }}>Edit</GhostBtn>
                          <PrimaryBtn small danger onClick={() => deleteSkillItem(skill.id, skill.name)} style={{ padding: '6px 12px', fontSize: 11 }}>✕</PrimaryBtn>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ─────────── INQUIRIES HUB ─────────── */}
          {activeTab === 'inquiries' && (
            <motion.div key="inquiries" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SectionHeader
                title="Inquiries Command Hub"
                sub={`${inquiries.length} total messages · ${pendingCount} pending response`}
                action={
                  <div style={{ display: 'flex', gap: 6, background: T.card, padding: 4, borderRadius: 10, border: `1px solid ${T.border}` }}>
                    {['all', 'pending', 'contacted', 'archived'].map(f => (
                      <button
                        key={f}
                        onClick={() => setInquiryFilter(f)}
                        style={{
                          background: inquiryFilter === f ? T.accent : 'transparent',
                          color: inquiryFilter === f ? '#fff' : T.text3,
                          border: 'none', borderRadius: 7,
                          padding: '6px 14px', fontSize: 11, fontFamily: T.fontMono,
                          textTransform: 'capitalize', transition: 'all 0.2s',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                }
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredInquiries.length === 0 ? (
                  <GlassCard style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                    <div style={{ color: T.text3, fontFamily: T.fontMono, fontSize: 13 }}>No messages for "{inquiryFilter}"</div>
                  </GlassCard>
                ) : filteredInquiries.map(inq => (
                  <GlassCard
                    key={inq.id}
                    style={{
                      padding: '20px 24px',
                      borderColor: inq.status === 'pending' ? 'rgba(251,191,36,0.3)' : T.border,
                      boxShadow: inq.status === 'pending' ? '0 0 20px rgba(251,191,36,0.05)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <Badge status={inq.status} />
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{inq.name}</span>
                          <a href={`mailto:${inq.email}`} style={{ color: T.accent, fontSize: 13, fontFamily: T.fontMono, textDecoration: 'none' }}>{inq.email}</a>
                          {inq.company && <span style={{ color: T.text3, fontSize: 12, fontFamily: T.fontMono }}>· {inq.company}</span>}
                        </div>
                        <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, marginBottom: 10 }}>
                          "{inq.message.length > 160 ? inq.message.slice(0, 160) + '...' : inq.message}"
                        </p>
                        <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: T.fontMono, color: T.text3 }}>
                          <span>Topic: {inq.timeline}</span>
                          <span>Category: {inq.budget}</span>
                          <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                        </div>
                        {inq.notes && (
                          <div style={{ marginTop: 10, padding: '8px 12px', background: T.card2, borderRadius: 8, borderLeft: `3px solid ${T.violet}`, fontSize: 12, color: T.text2, fontFamily: T.fontMono }}>
                            📝 {inq.notes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                        <PrimaryBtn small onClick={() => setSelectedInquiry(inq)} style={{ padding: '7px 14px', fontSize: 11 }}>Inspect 🔍</PrimaryBtn>
                        <GhostBtn small onClick={() => setInquiryStatus(inq.id, inq.status === 'contacted' ? 'pending' : 'contacted')} style={{ padding: '7px 14px', fontSize: 11 }}>
                          {inq.status === 'contacted' ? 'Unmark' : '✓ Contacted'}
                        </GhostBtn>
                        <PrimaryBtn small danger onClick={() => deleteInq(inq.id)} style={{ padding: '7px 12px', fontSize: 11 }}>🗑</PrimaryBtn>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─────────── SECURITY ─────────── */}
          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SectionHeader title="Security & Platform Settings" sub="Manage authentication credentials, session configuration, and database utilities." />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Passcode updater */}
                <GlassCard style={{ padding: 28 }}>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🔑 Update Master Passcode</h3>
                  <p style={{ fontSize: 13, color: T.text3, marginBottom: 24, lineHeight: 1.6 }}>
                    Change the admin passcode used to access this platform. Must be at least 6 characters.
                  </p>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (passForm.next !== passForm.confirm) { showToast('Passwords do not match.', 'error'); return; }
                    const res = await updateAdminPasscodeAction(passForm.current, passForm.next);
                    if (res.success) { showToast('Passcode updated!'); setPassForm({ current: '', next: '', confirm: '' }); }
                    else showToast(res.error || 'Failed.', 'error');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <AdminInput label="Current Passcode" type="password" required value={passForm.current} onChange={e => setPassForm(p => ({ ...p, current: e.target.value }))} />
                    <AdminInput label="New Passcode" type="password" required value={passForm.next} onChange={e => setPassForm(p => ({ ...p, next: e.target.value }))} />
                    <AdminInput label="Confirm New Passcode" type="password" required value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} />
                    <PrimaryBtn type="submit">Update Passcode</PrimaryBtn>
                  </form>
                </GlassCard>

                {/* Database utils */}
                <GlassCard style={{ padding: 28 }}>
                  <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>💾 Database Operations</h3>
                  <p style={{ fontSize: 13, color: T.text3, marginBottom: 24, lineHeight: 1.6 }}>
                    Manage the SQLite database — force-sync cache, verify seeded data, or trigger a manual refresh.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <GhostBtn onClick={() => { fetchAllData(); showToast('Database synced!'); }} style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '12px' }}>
                      🔄 Force Sync Cache
                    </GhostBtn>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                      <div style={{ background: T.card2, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 800, color: T.accent }}>{projects.length}</div>
                        <div style={{ fontSize: 10, fontFamily: T.fontMono, color: T.text3, marginTop: 4 }}>PROJECTS</div>
                      </div>
                      <div style={{ background: T.card2, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 800, color: T.violet }}>{experiences.length}</div>
                        <div style={{ fontSize: 10, fontFamily: T.fontMono, color: T.text3, marginTop: 4 }}>EXPERIENCES</div>
                      </div>
                      <div style={{ background: T.card2, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 800, color: T.cyan }}>{skills.length}</div>
                        <div style={{ fontSize: 10, fontFamily: T.fontMono, color: T.text3, marginTop: 4 }}>SKILLS</div>
                      </div>
                      <div style={{ background: T.card2, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontFamily: T.fontDisplay, fontWeight: 800, color: T.yellow }}>{inquiries.length}</div>
                        <div style={{ fontSize: 10, fontFamily: T.fontMono, color: T.text3, marginTop: 4 }}>INQUIRIES</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* ─── MODALS ─── */}

      {/* Project Modal */}
      <AdminModal isOpen={activeModal === 'project'} onClose={() => setActiveModal(null)} title={editingItem ? 'Edit Project' : 'Create New Project'} subtitle="Fill in project details, tags, architecture, and contributions." wide>
        <form onSubmit={saveProject} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 16 }}>
            <AdminInput label="Number" value={projectForm.num} onChange={e => setProjectForm(p => ({ ...p, num: e.target.value }))} />
            <AdminInput label="Project Title *" required value={projectForm.title} onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <AdminTextArea label="Short Description *" required rows={3} value={projectForm.desc} onChange={e => setProjectForm(p => ({ ...p, desc: e.target.value }))} />
          <AdminInput label="Tags (comma-separated) *" required placeholder="Next.js, PyTorch, SQLite" value={projectForm.tags} onChange={e => setProjectForm(p => ({ ...p, tags: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <AdminInput label="GitHub URL" type="url" placeholder="https://github.com/..." value={projectForm.githubUrl} onChange={e => setProjectForm(p => ({ ...p, githubUrl: e.target.value }))} />
            <AdminInput label="Live Demo URL" type="url" placeholder="https://..." value={projectForm.projectUrl} onChange={e => setProjectForm(p => ({ ...p, projectUrl: e.target.value }))} />
          </div>
          <AdminInput label="System Architecture" placeholder="Next.js 16 + SQLite via Prisma..." value={projectForm.architecture} onChange={e => setProjectForm(p => ({ ...p, architecture: e.target.value }))} />
          <AdminTextArea label="Engineering Challenge & Solution" rows={2} value={projectForm.challenge} onChange={e => setProjectForm(p => ({ ...p, challenge: e.target.value }))} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="pfeat" checked={projectForm.featured} onChange={e => setProjectForm(p => ({ ...p, featured: e.target.checked }))} style={{ accentColor: T.accent, width: 16, height: 16 }} />
            <label htmlFor="pfeat" style={{ fontSize: 13, color: T.text2 }}>Mark as Featured Project</label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
            <GhostBtn onClick={() => setActiveModal(null)}>Cancel</GhostBtn>
            <PrimaryBtn type="submit">{editingItem ? 'Save Changes' : 'Create Project'}</PrimaryBtn>
          </div>
        </form>
      </AdminModal>

      {/* Experience Modal */}
      <AdminModal isOpen={activeModal === 'experience'} onClose={() => setActiveModal(null)} title={editingItem ? 'Edit Experience' : 'Add Experience / Role'} subtitle="Add a work experience, internship, or academic milestone.">
        <form onSubmit={saveExp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <AdminInput label="Role / Degree Title *" required value={expForm.title} onChange={e => setExpForm(p => ({ ...p, title: e.target.value }))} />
            <AdminInput label="Organization / University *" required value={expForm.organization} onChange={e => setExpForm(p => ({ ...p, organization: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <AdminSelect label="Type" value={expForm.type} onChange={e => setExpForm(p => ({ ...p, type: e.target.value }))}>
              <option>Internship</option>
              <option>Work</option>
              <option>Education</option>
              <option>Leadership</option>
            </AdminSelect>
            <AdminInput label="Start Date *" required placeholder="Jan 2026" value={expForm.startDate} onChange={e => setExpForm(p => ({ ...p, startDate: e.target.value }))} />
            <AdminInput label="End Date" placeholder="Feb 2026" value={expForm.endDate} onChange={e => setExpForm(p => ({ ...p, endDate: e.target.value }))} disabled={expForm.current} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="cur" checked={expForm.current} onChange={e => setExpForm(p => ({ ...p, current: e.target.checked }))} style={{ accentColor: T.green, width: 16, height: 16 }} />
            <label htmlFor="cur" style={{ fontSize: 13, color: T.text2 }}>Currently Active Role</label>
          </div>
          <AdminInput label="Location" placeholder="Remote / City, Country" value={expForm.location} onChange={e => setExpForm(p => ({ ...p, location: e.target.value }))} />
          <AdminInput label="Technologies (comma-separated)" placeholder="PyTorch, Google Earth Engine, QGIS" value={expForm.technologies} onChange={e => setExpForm(p => ({ ...p, technologies: e.target.value }))} />
          <AdminTextArea label="Overview Description" rows={3} value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
            <GhostBtn onClick={() => setActiveModal(null)}>Cancel</GhostBtn>
            <PrimaryBtn type="submit">{editingItem ? 'Save Changes' : 'Add Experience'}</PrimaryBtn>
          </div>
        </form>
      </AdminModal>

      {/* Skill Modal */}
      <AdminModal isOpen={activeModal === 'skill'} onClose={() => setActiveModal(null)} title={editingItem ? 'Edit Skill' : 'Register Skill'} subtitle="Set proficiency level and category for this technical skill.">
        <form onSubmit={saveSkill} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <AdminInput label="Skill Name *" required placeholder="PyTorch / Next.js / QGIS" value={skillForm.name} onChange={e => setSkillForm(p => ({ ...p, name: e.target.value }))} />
          <AdminSelect label="Category *" value={skillForm.category} onChange={e => setSkillForm(p => ({ ...p, category: e.target.value }))}>
            <option>Programming</option>
            <option>Frameworks</option>
            <option>AI/ML</option>
            <option>Databases</option>
            <option>Tools</option>
          </AdminSelect>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontFamily: T.fontMono, color: T.text3, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>
              Proficiency — {skillForm.proficiency}%
            </label>
            <input
              type="range" min={10} max={100} value={skillForm.proficiency}
              onChange={e => setSkillForm(p => ({ ...p, proficiency: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: categoryColors[skillForm.category] || T.accent }}
            />
            {/* Preview bar */}
            <div style={{ height: 6, background: T.card2, borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
              <div style={{ width: `${skillForm.proficiency}%`, height: '100%', background: categoryColors[skillForm.category] || T.accent, borderRadius: 4, transition: 'width 0.2s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
            <GhostBtn onClick={() => setActiveModal(null)}>Cancel</GhostBtn>
            <PrimaryBtn type="submit">{editingItem ? 'Save Changes' : 'Register Skill'}</PrimaryBtn>
          </div>
        </form>
      </AdminModal>

      {/* Inquiry Inspect Modal */}
      <AdminModal isOpen={!!selectedInquiry} onClose={() => setSelectedInquiry(null)} title="Inquiry Details" subtitle={selectedInquiry ? `From ${selectedInquiry.name} · ${new Date(selectedInquiry.createdAt).toLocaleDateString()}` : ''}>
        {selectedInquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { k: 'From', v: selectedInquiry.name },
                { k: 'Email', v: selectedInquiry.email },
                { k: 'Topic', v: selectedInquiry.timeline },
                { k: 'Category', v: selectedInquiry.budget },
                { k: 'Company', v: selectedInquiry.company || '—' },
                { k: 'Status', v: selectedInquiry.status },
              ].map(({ k, v }) => (
                <div key={k} style={{ background: T.card2, borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontFamily: T.fontMono, color: T.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, color: T.text1 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ background: T.card2, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontFamily: T.fontMono, color: T.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Full Message</div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedInquiry.message}</p>
            </div>

            <AdminTextArea
              label="Admin Notes (auto-saved on blur)"
              rows={2}
              defaultValue={selectedInquiry.notes || ''}
              onBlur={e => saveNote(selectedInquiry.id, e.target.value)}
              placeholder="Internal notes about this contact..."
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: Portfolio Inquiry`}
                style={{ background: T.accent, color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, fontFamily: T.fontMono, boxShadow: `0 4px 16px ${T.accent}40` }}
              >
                ✉ Send Email Reply
              </a>
              <GhostBtn onClick={() => setSelectedInquiry(null)}>Close</GhostBtn>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Global spinner keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

// ─── Particles init function ──────────────────────────────────────────────────
async function particlesInit(engine: any) {
  await loadSlim(engine);
}

// ─── Root export wraps in ParticlesProvider ───────────────────────────────────
export default function SecureAdminPlatformWrapper() {
  return (
    <ParticlesProvider init={particlesInit}>
      <SecureAdminPlatform />
    </ParticlesProvider>
  );
}
