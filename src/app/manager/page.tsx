'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

// Data Types
interface Project {
  id: string;
  num: string | null;
  title: string;
  desc: string;
  tags: string;
  imageUrl: string;
  projectUrl: string | null;
  githubUrl: string | null;
  architecture: string | null;
  contributions: string | null;
  challenge: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
}

interface Experience {
  id: string;
  title: string;
  organization: string;
  location: string | null;
  type: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  bulletPoints: string | null;
  technologies: string | null;
  order: number;
  createdAt: Date;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  featured: boolean;
  order: number;
  createdAt: Date;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  budget: string;
  timeline: string;
  message: string;
  status: string;
  notes: string | null;
  createdAt: Date;
}

export default function SecureAdminPlatform() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'experiences' | 'projects' | 'skills' | 'inquiries' | 'security'>('overview');

  // Auth Form State
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Data Loading & Content State
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Toast Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter States
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'pending' | 'contacted' | 'starred' | 'archived'>('all');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('all');

  // Modal Dialog States
  const [activeModal, setActiveModal] = useState<'project' | 'experience' | 'skill' | 'inquiry' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Form State for Modals
  const [projectForm, setProjectForm] = useState({
    num: '01',
    title: '',
    desc: '',
    tags: '',
    imageUrl: '/projects/placeholder.png',
    projectUrl: '',
    githubUrl: '',
    architecture: '',
    contributions: [''],
    challenge: '',
    featured: false,
    order: 0,
  });

  const [expForm, setExpForm] = useState({
    title: '',
    organization: '',
    location: '',
    type: 'Work',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    bulletPoints: [''],
    technologies: '',
    order: 0,
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Programming',
    proficiency: 85,
    featured: true,
    order: 0,
  });

  const [passcodeForm, setPasscodeForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check auth session on mount
  useEffect(() => {
    setMounted(true);
    verifySession();
  }, []);

  const verifySession = async () => {
    try {
      const res = await checkAdminSessionAction();
      setIsAuthenticated(res.authenticated);
      if (res.authenticated) {
        fetchAllData();
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, expRes, skillRes, inqRes] = await Promise.all([
        getProjects(),
        getExperiences(),
        getSkills(),
        getInquiries(),
      ]);

      if (projRes.success && projRes.projects) setProjects(projRes.projects as any);
      if (expRes.success && expRes.experiences) setExperiences(expRes.experiences as any);
      if (skillRes.success && skillRes.skills) setSkills(skillRes.skills as any);
      if (inqRes.success && inqRes.inquiries) setInquiries(inqRes.inquiries as any);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Failed to load some dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
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
        showToast('Authenticated successfully as Administrator.');
        fetchAllData();
      } else {
        setAuthError(res.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setAuthError('Error communicating with server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await adminLogoutAction();
    setIsAuthenticated(false);
    showToast('Logged out of Admin Command Center.');
  };

  // Change passcode handler
  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeForm.newPass !== passcodeForm.confirmPass) {
      showToast('New passcodes do not match.', 'error');
      return;
    }
    try {
      const res = await updateAdminPasscodeAction(passcodeForm.currentPass, passcodeForm.newPass);
      if (res.success) {
        showToast('Admin passcode updated successfully!');
        setPasscodeForm({ currentPass: '', newPass: '', confirmPass: '' });
      } else {
        showToast(res.error || 'Failed to update passcode.', 'error');
      }
    } catch {
      showToast('Error updating passcode.', 'error');
    }
  };

  // --- PROJECT ACTIONS ---
  const openProjectModal = (project?: Project) => {
    if (project) {
      setEditingItem(project);
      let parsedContribs = [''];
      try {
        if (project.contributions) parsedContribs = JSON.parse(project.contributions);
      } catch {}
      setProjectForm({
        num: project.num || '01',
        title: project.title,
        desc: project.desc,
        tags: project.tags,
        imageUrl: project.imageUrl,
        projectUrl: project.projectUrl || '',
        githubUrl: project.githubUrl || '',
        architecture: project.architecture || '',
        contributions: parsedContribs.length ? parsedContribs : [''],
        challenge: project.challenge || '',
        featured: project.featured,
        order: project.order,
      });
    } else {
      setEditingItem(null);
      setProjectForm({
        num: `0${projects.length + 1}`,
        title: '',
        desc: '',
        tags: '',
        imageUrl: '/projects/placeholder.png',
        projectUrl: '',
        githubUrl: '',
        architecture: '',
        contributions: [''],
        challenge: '',
        featured: false,
        order: projects.length + 1,
      });
    }
    setActiveModal('project');
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const contribsFiltered = projectForm.contributions.filter(c => c.trim() !== '');
    try {
      if (editingItem) {
        const res = await updateProject(editingItem.id, {
          ...projectForm,
          contributions: contribsFiltered,
        });
        if (res.success) {
          showToast('Project updated successfully!');
          setActiveModal(null);
          fetchAllData();
        } else {
          showToast(res.error || 'Failed to update project.', 'error');
        }
      } else {
        const res = await createProject({
          ...projectForm,
          contributions: contribsFiltered,
        });
        if (res.success) {
          showToast('Project created successfully!');
          setActiveModal(null);
          fetchAllData();
        } else {
          showToast(res.error || 'Failed to create project.', 'error');
        }
      }
    } catch {
      showToast('Error saving project.', 'error');
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      const res = await deleteProject(id);
      if (res.success) {
        showToast('Project deleted.');
        fetchAllData();
      } else {
        showToast(res.error || 'Failed to delete.', 'error');
      }
    } catch {
      showToast('Error deleting project.', 'error');
    }
  };

  const handleToggleFeaturedProject = async (id: string, current: boolean) => {
    try {
      const res = await toggleProjectFeatured(id, !current);
      if (res.success) {
        showToast(`Project featured status set to ${!current}`);
        fetchAllData();
      }
    } catch {
      showToast('Error toggling featured status.', 'error');
    }
  };

  // --- EXPERIENCE ACTIONS ---
  const openExperienceModal = (exp?: Experience) => {
    if (exp) {
      setEditingItem(exp);
      let parsedBullets = [''];
      try {
        if (exp.bulletPoints) parsedBullets = JSON.parse(exp.bulletPoints);
      } catch {}
      setExpForm({
        title: exp.title,
        organization: exp.organization,
        location: exp.location || '',
        type: exp.type || 'Work',
        startDate: exp.startDate,
        endDate: exp.endDate || '',
        current: exp.current,
        description: exp.description || '',
        bulletPoints: parsedBullets.length ? parsedBullets : [''],
        technologies: exp.technologies || '',
        order: exp.order,
      });
    } else {
      setEditingItem(null);
      setExpForm({
        title: '',
        organization: '',
        location: '',
        type: 'Work',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        bulletPoints: [''],
        technologies: '',
        order: experiences.length + 1,
      });
    }
    setActiveModal('experience');
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    const bulletsFiltered = expForm.bulletPoints.filter(b => b.trim() !== '');
    try {
      if (editingItem) {
        const res = await updateExperience(editingItem.id, {
          ...expForm,
          bulletPoints: bulletsFiltered,
        });
        if (res.success) {
          showToast('Experience entry updated!');
          setActiveModal(null);
          fetchAllData();
        } else {
          showToast(res.error || 'Failed to update experience.', 'error');
        }
      } else {
        const res = await createExperience({
          ...expForm,
          bulletPoints: bulletsFiltered,
        });
        if (res.success) {
          showToast('New experience entry added!');
          setActiveModal(null);
          fetchAllData();
        } else {
          showToast(res.error || 'Failed to create experience.', 'error');
        }
      }
    } catch {
      showToast('Error saving experience.', 'error');
    }
  };

  const handleDeleteExperience = async (id: string, title: string) => {
    if (!confirm(`Delete experience item "${title}"?`)) return;
    try {
      const res = await deleteExperience(id);
      if (res.success) {
        showToast('Experience entry deleted.');
        fetchAllData();
      } else {
        showToast(res.error || 'Failed to delete experience.', 'error');
      }
    } catch {
      showToast('Error deleting experience.', 'error');
    }
  };

  // --- SKILLS ACTIONS ---
  const openSkillModal = (skill?: Skill) => {
    if (skill) {
      setEditingItem(skill);
      setSkillForm({
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        featured: skill.featured,
        order: skill.order,
      });
    } else {
      setEditingItem(null);
      setSkillForm({
        name: '',
        category: 'Programming',
        proficiency: 85,
        featured: true,
        order: skills.length + 1,
      });
    }
    setActiveModal('skill');
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await updateSkill(editingItem.id, skillForm);
        if (res.success) {
          showToast('Skill updated!');
          setActiveModal(null);
          fetchAllData();
        } else {
          showToast(res.error || 'Failed to update skill.', 'error');
        }
      } else {
        const res = await createSkill(skillForm);
        if (res.success) {
          showToast('New skill added!');
          setActiveModal(null);
          fetchAllData();
        } else {
          showToast(res.error || 'Failed to create skill.', 'error');
        }
      }
    } catch {
      showToast('Error saving skill.', 'error');
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return;
    try {
      const res = await deleteSkill(id);
      if (res.success) {
        showToast('Skill deleted.');
        fetchAllData();
      }
    } catch {
      showToast('Error deleting skill.', 'error');
    }
  };

  // --- INQUIRY ACTIONS ---
  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    try {
      const res = await updateInquiryStatus(id, status);
      if (res.success) {
        showToast(`Status updated to ${status}`);
        fetchAllData();
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status });
        }
      }
    } catch {
      showToast('Error updating status.', 'error');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry record?')) return;
    try {
      const res = await deleteInquiry(id);
      if (res.success) {
        showToast('Inquiry deleted.');
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        fetchAllData();
      }
    } catch {
      showToast('Error deleting inquiry.', 'error');
    }
  };

  const handleSaveInquiryNote = async (id: string, notes: string) => {
    try {
      const res = await addInquiryNote(id, notes);
      if (res.success) {
        showToast('Saved admin notes.');
        fetchAllData();
      }
    } catch {
      showToast('Error saving note.', 'error');
    }
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter(i => {
    if (inquiryFilter === 'all') return true;
    return i.status === inquiryFilter;
  });

  const pendingInquiriesCount = inquiries.filter(i => i.status === 'pending').length;

  if (!mounted || isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#040404', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FF4C24', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>
          INITIALIZING MEHTA OS SECURITY GATEWAY...
        </div>
      </div>
    );
  }

  // --- UNAUTHENTICATED PASSCODE GATE ---
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#040404', color: '#F2F2F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '440px',
            background: '#0E0E0E',
            border: '1px solid rgba(255, 76, 36, 0.3)',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 30px rgba(255, 76, 36, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Glow accent */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,76,36,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF4C24', boxShadow: '0 0 8px #FF4C24' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#FF4C24', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              MEHTA OS // ADMIN COMMAND CENTER
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Access Verification
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(242, 242, 240, 0.6)', marginBottom: '28px', lineHeight: '1.5' }}>
            This platform is strictly restricted. Enter your master administrator passcode to authenticate session.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242, 242, 240, 0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Master Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                style={{
                  width: '100%',
                  background: '#161616',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: '#F2F2F0',
                  fontSize: '16px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF4C24'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
              />
            </div>

            {authError && (
              <div style={{ background: 'rgba(255, 76, 36, 0.1)', border: '1px solid rgba(255, 76, 36, 0.4)', borderRadius: '8px', padding: '10px 14px', color: '#FF6B47', fontSize: '13px', marginBottom: '20px' }}>
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                background: '#FF4C24',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '1px',
                cursor: authLoading ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(255, 76, 36, 0.35)',
                transition: 'transform 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FF6B47'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FF4C24'}
            >
              {authLoading ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE & ENTER →'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(242,242,240,0.4)', fontFamily: 'var(--font-mono)' }}>Default PIN: sarthak2026</span>
            <Link href="/" style={{ fontSize: '12px', color: '#FF4C24', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
              ← Return Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- AUTHENTICATED ADMIN PLATFORM DASHBOARD ---
  return (
    <div style={{ minHeight: '100vh', background: '#040404', color: '#F2F2F0', fontFamily: 'var(--font-body)', paddingBottom: '60px' }}>
      
      {/* Toast Notification Floating */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              zIndex: 9999,
              background: toast.type === 'success' ? '#161616' : '#2A0E0A',
              border: `1px solid ${toast.type === 'success' ? '#FF4C24' : '#FF3333'}`,
              borderRadius: '12px',
              padding: '12px 24px',
              color: '#F2F2F0',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>{toast.type === 'success' ? '⚡' : '⚠️'}</span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER NAV BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(14, 14, 14, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: '#F2F2F0', letterSpacing: '-0.5px' }}>
              sarthak mehta <span style={{ color: '#FF4C24' }}>// admin</span>
            </span>
          </Link>
          <span style={{ background: 'rgba(255,76,36,0.15)', border: '1px solid rgba(255,76,36,0.4)', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', color: '#FF4C24', fontFamily: 'var(--font-mono)' }}>
            ● LIVE SESSION
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" target="_blank" style={{ color: 'rgba(242,242,240,0.7)', textDecoration: 'none', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            View Public Site ↗
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#F2F2F0',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 76, 36, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            Logout 🔒
          </button>
        </div>
      </header>

      {/* ADMIN NAVIGATION TABS */}
      <nav style={{ padding: '24px 32px 0 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'experiences', label: `💼 Experiences (${experiences.length})` },
            { id: 'projects', label: `🚀 Projects (${projects.length})` },
            { id: 'skills', label: `⚡ Skills Matrix (${skills.length})` },
            { id: 'inquiries', label: `📬 Inquiries (${inquiries.length})`, badge: pendingInquiriesCount },
            { id: 'security', label: '🔒 Security & Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(255, 76, 36, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#FF4C24' : 'rgba(242, 242, 240, 0.65)',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #FF4C24' : '2px solid transparent',
                padding: '12px 18px',
                fontSize: '14px',
                fontFamily: 'var(--font-mono)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              {tab.badge ? (
                <span style={{ background: '#FF4C24', color: '#FFF', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', fontWeight: 700 }}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 32px' }}>
        
        {/* --- TAB 1: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '24px' }}>
              Command Telemetry
            </h2>

            {/* Stat Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', marginBottom: '8px' }}>TOTAL PROJECTS</div>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#F2F2F0' }}>{projects.length}</div>
                <div style={{ fontSize: '12px', color: '#FF4C24', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {projects.filter(p => p.featured).length} Featured Projects
                </div>
              </div>

              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', marginBottom: '8px' }}>WORK & EDUCATION</div>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#F2F2F0' }}>{experiences.length}</div>
                <div style={{ fontSize: '12px', color: '#FF4C24', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {experiences.filter(e => e.current).length} Active Role(s)
                </div>
              </div>

              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', marginBottom: '8px' }}>TECHNICAL SKILLS</div>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#F2F2F0' }}>{skills.length}</div>
                <div style={{ fontSize: '12px', color: '#FF4C24', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>Across 5 Categories</div>
              </div>

              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,76,36,0.3)', borderRadius: '16px', padding: '24px', boxShadow: '0 0 20px rgba(255,76,36,0.08)' }}>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', marginBottom: '8px' }}>INCOMING INQUIRIES</div>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#FF4C24' }}>{inquiries.length}</div>
                <div style={{ fontSize: '12px', color: '#F2F2F0', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {pendingInquiriesCount} Pending Review
                </div>
              </div>
            </div>

            {/* Quick Actions & Diagnostics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>⚡ Quick Management</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button onClick={() => openProjectModal()} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px', color: '#F2F2F0', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                    + Create New Project Entry
                  </button>
                  <button onClick={() => openExperienceModal()} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px', color: '#F2F2F0', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                    + Add Experience / Role
                  </button>
                  <button onClick={() => openSkillModal()} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px', color: '#F2F2F0', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
                    + Register Skill Item
                  </button>
                </div>
              </div>

              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>🛡️ System Diagnostics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span>Database Engine:</span>
                    <span style={{ color: '#FF4C24' }}>SQLite (Prisma ORM)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span>Authorization Model:</span>
                    <span style={{ color: '#FF4C24' }}>HMAC Token + HTTP Cookie</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span>Environment:</span>
                    <span style={{ color: '#F2F2F0' }}>{process.env.NODE_ENV || 'development'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Last Sync:</span>
                    <span style={{ color: 'rgba(242,242,240,0.5)' }}>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 2: EXPERIENCES --- */}
        {activeTab === 'experiences' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Experience & Education</h2>
                <p style={{ color: 'rgba(242,242,240,0.6)', fontSize: '14px' }}>Manage work internships, education, and career timeline milestones.</p>
              </div>
              <button
                onClick={() => openExperienceModal()}
                style={{
                  background: '#FF4C24',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                + Add Experience
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp) => {
                let bullets: string[] = [];
                try { if (exp.bulletPoints) bullets = JSON.parse(exp.bulletPoints); } catch {}

                return (
                  <div
                    key={exp.id}
                    style={{
                      background: '#0E0E0E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '24px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ background: 'rgba(255,76,36,0.15)', color: '#FF4C24', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                          {exp.type}
                        </span>
                        <span style={{ color: 'rgba(242,242,240,0.5)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                          {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                        </span>
                        {exp.location && (
                          <span style={{ color: 'rgba(242,242,240,0.4)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                            📍 {exp.location}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{exp.title}</h3>
                      <div style={{ fontSize: '15px', color: '#FF4C24', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
                        {exp.organization}
                      </div>

                      {exp.description && (
                        <p style={{ color: 'rgba(242,242,240,0.8)', fontSize: '14px', marginBottom: '12px' }}>{exp.description}</p>
                      )}

                      {bullets.length > 0 && (
                        <ul style={{ paddingLeft: '20px', color: 'rgba(242,242,240,0.7)', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
                          {bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}

                      {exp.technologies && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                          {exp.technologies.split(',').map((tech) => (
                            <span key={tech} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.8)' }}>
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => openExperienceModal(exp)}
                        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        Edit ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(exp.id, exp.title)}
                        style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#FF5555', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        Delete 🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* --- TAB 3: PROJECTS --- */}
        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Projects Repository</h2>
                <p style={{ color: 'rgba(242,242,240,0.6)', fontSize: '14px' }}>Manage portfolio projects, tech stacks, architecture details, and featured highlights.</p>
              </div>
              <button
                onClick={() => openProjectModal()}
                style={{
                  background: '#FF4C24',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                + Create Project
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {projects.map((p) => {
                let contribs: string[] = [];
                try { if (p.contributions) contribs = JSON.parse(p.contributions); } catch {}

                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#0E0E0E',
                      border: p.featured ? '1px solid rgba(255,76,36,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: '#FF4C24' }}>{p.num || '01'}</span>
                        <button
                          onClick={() => handleToggleFeaturedProject(p.id, p.featured)}
                          style={{
                            background: p.featured ? 'rgba(255,76,36,0.2)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${p.featured ? '#FF4C24' : 'rgba(255,255,255,0.15)'}`,
                            borderRadius: '20px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            color: p.featured ? '#FF4C24' : 'rgba(242,242,240,0.6)',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                          }}
                        >
                          {p.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </div>

                      <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>{p.title}</h3>
                      <p style={{ fontSize: '13px', color: 'rgba(242,242,240,0.7)', lineHeight: '1.5', marginBottom: '16px' }}>{p.desc}</p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {p.tags.split(',').map((t) => (
                          <span key={t} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                            {t.trim()}
                          </span>
                        ))}
                      </div>

                      {p.architecture && (
                        <div style={{ fontSize: '12px', background: '#141414', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px', color: 'rgba(242,242,240,0.7)' }}>
                          <strong style={{ color: '#FF4C24' }}>Arch:</strong> {p.architecture}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <button
                        onClick={() => openProjectModal(p)}
                        style={{ flex: 1, background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '8px', padding: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        Edit Details ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id, p.title)}
                        style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#FF5555', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        Delete 🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* --- TAB 4: SKILLS --- */}
        {activeTab === 'skills' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Technical Skills Matrix</h2>
                <p style={{ color: 'rgba(242,242,240,0.6)', fontSize: '14px' }}>Manage programming languages, frameworks, AI/ML tools, and proficiency metrics.</p>
              </div>
              <button
                onClick={() => openSkillModal()}
                style={{
                  background: '#FF4C24',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                + Register Skill
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    background: '#0E0E0E',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#FF4C24', textTransform: 'uppercase' }}>
                        {skill.category}
                      </span>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)' }}>
                        {skill.proficiency}%
                      </span>
                    </div>

                    <h4 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>{skill.name}</h4>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: '#161616', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                      <div style={{ width: `${skill.proficiency}%`, height: '100%', background: '#FF4C24' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openSkillModal(skill)}
                      style={{ flex: 1, background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '6px', padding: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                    >
                      Edit ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id, skill.name)}
                      style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#FF5555', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- TAB 5: INQUIRIES HUB --- */}
        {activeTab === 'inquiries' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Inquiries Command Hub</h2>
                <p style={{ color: 'rgba(242,242,240,0.6)', fontSize: '14px' }}>View and respond to client and collaboration contact submissions.</p>
              </div>

              {/* Status Filter Buttons */}
              <div style={{ display: 'flex', gap: '6px', background: '#0E0E0E', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {['all', 'pending', 'contacted', 'archived'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setInquiryFilter(f as any)}
                    style={{
                      background: inquiryFilter === f ? '#FF4C24' : 'transparent',
                      color: inquiryFilter === f ? '#FFF' : 'rgba(242,242,240,0.6)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredInquiries.length === 0 ? (
                <div style={{ background: '#0E0E0E', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '16px', padding: '48px', textAlign: 'center', color: 'rgba(242,242,240,0.5)', fontFamily: 'var(--font-mono)' }}>
                  No inquiry submissions found for status "{inquiryFilter}".
                </div>
              ) : (
                filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    style={{
                      background: '#0E0E0E',
                      border: inq.status === 'pending' ? '1px solid rgba(255,76,36,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px',
                      padding: '20px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ background: inq.status === 'pending' ? '#FF4C24' : '#222', color: '#FFF', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                          {inq.status}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#F2F2F0' }}>{inq.name}</span>
                        <span style={{ fontSize: '13px', color: '#FF4C24', fontFamily: 'var(--font-mono)' }}>({inq.email})</span>
                        {inq.company && <span style={{ fontSize: '12px', color: 'rgba(242,242,240,0.5)', fontFamily: 'var(--font-mono)' }}>• {inq.company}</span>}
                      </div>

                      <p style={{ fontSize: '14px', color: 'rgba(242,242,240,0.85)', lineHeight: '1.5', marginBottom: '10px' }}>
                        "{inq.message}"
                      </p>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)' }}>
                        <span>Topic/Role: {inq.timeline}</span>
                        <span>Reason: {inq.budget}</span>
                        <span>Date: {new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>

                      {inq.notes && (
                        <div style={{ marginTop: '10px', padding: '8px 12px', background: '#161616', borderRadius: '6px', borderLeft: '3px solid #FF4C24', fontSize: '12px', color: 'rgba(242,242,240,0.7)', fontFamily: 'var(--font-mono)' }}>
                          <strong>Admin Note:</strong> {inq.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        Inspect 🔍
                      </button>
                      <button
                        onClick={() => handleUpdateInquiryStatus(inq.id, inq.status === 'contacted' ? 'pending' : 'contacted')}
                        style={{ background: 'rgba(255,76,36,0.1)', border: '1px solid rgba(255,76,36,0.3)', color: '#FF4C24', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        {inq.status === 'contacted' ? 'Mark Pending' : 'Mark Contacted ✓'}
                      </button>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#FF5555', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        Delete 🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* --- TAB 6: SECURITY & SETTINGS --- */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '24px' }}>
              Security & Platform Settings
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>🔑 Update Master Passcode</h3>
                <p style={{ fontSize: '13px', color: 'rgba(242,242,240,0.6)', marginBottom: '20px', lineHeight: '1.5' }}>
                  Change the master secret PIN required to log into the Admin Command Center.
                </p>

                <form onSubmit={handleChangePasscode}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>
                      CURRENT PASSCODE
                    </label>
                    <input
                      type="password"
                      required
                      value={passcodeForm.currentPass}
                      onChange={(e) => setPasscodeForm({ ...passcodeForm, currentPass: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>
                      NEW PASSCODE
                    </label>
                    <input
                      type="password"
                      required
                      value={passcodeForm.newPass}
                      onChange={(e) => setPasscodeForm({ ...passcodeForm, newPass: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>
                      CONFIRM NEW PASSCODE
                    </label>
                    <input
                      type="password"
                      required
                      value={passcodeForm.confirmPass}
                      onChange={(e) => setPasscodeForm({ ...passcodeForm, confirmPass: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                  >
                    Update Master Passcode
                  </button>
                </form>
              </div>

              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>💾 Database Operations</h3>
                <p style={{ fontSize: '13px', color: 'rgba(242,242,240,0.6)', marginBottom: '20px', lineHeight: '1.5' }}>
                  Refresh local SQLite database models or re-seed default dataset.
                </p>

                <button
                  onClick={() => fetchAllData()}
                  style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '8px', padding: '12px', fontSize: '13px', fontFamily: 'var(--font-mono)', cursor: 'pointer', marginBottom: '12px' }}
                >
                  🔄 Force Sync Database Cache
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* --- MODAL DIALOGS --- */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              style={{
                width: '100%',
                maxWidth: '640px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#0E0E0E',
                border: '1px solid rgba(255, 76, 36, 0.4)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL: PROJECT */}
              {activeModal === 'project' && (
                <form onSubmit={handleSaveProject}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>
                    {editingItem ? 'Edit Project Entry' : 'Create New Project'}
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>NUM (#)</label>
                      <input type="text" value={projectForm.num} onChange={(e) => setProjectForm({ ...projectForm, num: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF', fontFamily: 'var(--font-mono)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>PROJECT TITLE *</label>
                      <input type="text" required value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>SHORT DESCRIPTION *</label>
                    <textarea required rows={3} value={projectForm.desc} onChange={(e) => setProjectForm({ ...projectForm, desc: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF', resize: 'vertical' }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>TAGS (COMMA SEPARATED) *</label>
                    <input type="text" required value={projectForm.tags} onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })} placeholder="Next.js, React, PyTorch" style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF', fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>GITHUB URL</label>
                      <input type="url" value={projectForm.githubUrl} onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })} placeholder="https://github.com/..." style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF', fontFamily: 'var(--font-mono)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>LIVE DEMO URL</label>
                      <input type="url" value={projectForm.projectUrl} onChange={(e) => setProjectForm({ ...projectForm, projectUrl: e.target.value })} placeholder="https://..." style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF', fontFamily: 'var(--font-mono)' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>SYSTEM ARCHITECTURE SUMMARY</label>
                    <input type="text" value={projectForm.architecture} onChange={(e) => setProjectForm({ ...projectForm, architecture: e.target.value })} placeholder="e.g. Next.js 16 + SQLite via Prisma ORM..." style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>ENGINEERING CHALLENGE & SOLUTION</label>
                    <textarea rows={2} value={projectForm.challenge} onChange={(e) => setProjectForm({ ...projectForm, challenge: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <input type="checkbox" id="feat" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} style={{ accentColor: '#FF4C24', width: '18px', height: '18px' }} />
                    <label htmlFor="feat" style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Mark as Featured Project</label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={() => setActiveModal(null)} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: '8px', padding: '10px 20px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ background: '#FF4C24', border: 'none', color: '#FFF', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Save Project</button>
                  </div>
                </form>
              )}

              {/* MODAL: EXPERIENCE */}
              {activeModal === 'experience' && (
                <form onSubmit={handleSaveExperience}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>
                    {editingItem ? 'Edit Experience Entry' : 'Add Experience / Role'}
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>ROLE / DEGREE TITLE *</label>
                      <input type="text" required value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>ORGANIZATION / UNIVERSITY *</label>
                      <input type="text" required value={expForm.organization} onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>TYPE</label>
                      <select value={expForm.type} onChange={(e) => setExpForm({ ...expForm, type: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }}>
                        <option value="Work">Work</option>
                        <option value="Internship">Internship</option>
                        <option value="Education">Education</option>
                        <option value="Leadership">Leadership</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>START DATE *</label>
                      <input type="text" required value={expForm.startDate} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} placeholder="Jan 2026" style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>END DATE</label>
                      <input type="text" value={expForm.endDate} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} placeholder="Feb 2026 / Present" disabled={expForm.current} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>TECHNOLOGIES (COMMA SEPARATED)</label>
                    <input type="text" value={expForm.technologies} onChange={(e) => setExpForm({ ...expForm, technologies: e.target.value })} placeholder="PyTorch, QGIS, GEE" style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF', fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>OVERVIEW DESCRIPTION</label>
                    <textarea rows={3} value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={() => setActiveModal(null)} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: '8px', padding: '10px 20px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ background: '#FF4C24', border: 'none', color: '#FFF', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Save Experience</button>
                  </div>
                </form>
              )}

              {/* MODAL: SKILL */}
              {activeModal === 'skill' && (
                <form onSubmit={handleSaveSkill}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>
                    {editingItem ? 'Edit Skill' : 'Register Skill'}
                  </h2>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>SKILL NAME *</label>
                    <input type="text" required value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="PyTorch / Next.js" style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>CATEGORY *</label>
                    <select value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF' }}>
                      <option value="Programming">Programming</option>
                      <option value="Frameworks">Frameworks</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Databases">Databases</option>
                      <option value="Tools">Tools</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>
                      PROFICIENCY LEVEL ({skillForm.proficiency}%)
                    </label>
                    <input type="range" min="10" max="100" value={skillForm.proficiency} onChange={(e) => setSkillForm({ ...skillForm, proficiency: parseInt(e.target.value, 10) })} style={{ width: '100%', accentColor: '#FF4C24' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={() => setActiveModal(null)} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: '8px', padding: '10px 20px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ background: '#FF4C24', border: 'none', color: '#FFF', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Save Skill</button>
                  </div>
                </form>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- INQUIRY INSPECTION MODAL --- */}
      <AnimatePresence>
        {selectedInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setSelectedInquiry(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '560px',
                background: '#0E0E0E',
                border: '1px solid rgba(255,76,36,0.4)',
                borderRadius: '20px',
                padding: '32px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-display)' }}>Inquiry Details</h3>
                <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ marginBottom: '16px', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                <div><strong style={{ color: '#FF4C24' }}>From:</strong> {selectedInquiry.name} ({selectedInquiry.email})</div>
                {selectedInquiry.company && <div><strong style={{ color: '#FF4C24' }}>Org:</strong> {selectedInquiry.company}</div>}
                <div><strong style={{ color: '#FF4C24' }}>Subject:</strong> {selectedInquiry.timeline} / {selectedInquiry.budget}</div>
              </div>

              <div style={{ background: '#161616', borderRadius: '10px', padding: '16px', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
                {selectedInquiry.message}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', marginBottom: '6px' }}>INTERNAL ADMIN NOTES</label>
                <textarea
                  rows={2}
                  defaultValue={selectedInquiry.notes || ''}
                  onBlur={(e) => handleSaveInquiryNote(selectedInquiry.id, e.target.value)}
                  placeholder="Add notes about response status..."
                  style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px', color: '#FFF', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: Portfolio Inquiry (${selectedInquiry.timeline})`}
                  style={{ background: '#FF4C24', color: '#FFF', textDecoration: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
                >
                  Send Email Reply ✉️
                </a>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
