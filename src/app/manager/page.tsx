'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  adminLoginAction,
  verify2FAAction,
  adminLogoutAction,
  checkAdminSessionAction,
  updateAdminPasscodeAction,
  getTotpSetupAction,
  enableTotpAction,
  disableTotpAction,
  getSmtpConfigAction,
  updateSmtpConfigAction,
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

  // 2FA Login Verification State
  const [requires2FA, setRequires2FA] = useState(false);
  const [temp2faToken, setTemp2faToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  // 2FA Setup State (Security Tab)
  const [totpSetup, setTotpSetup] = useState<{ enabled: boolean; secret: string; qrCodeUrl: string } | null>(null);
  const [verifySetupCode, setVerifySetupCode] = useState('');
  const [totpActionLoading, setTotpActionLoading] = useState(false);

  // SMTP Email Config State
  const [smtpForm, setSmtpForm] = useState({
    host: 'smtp.gmail.com',
    port: 465,
    user: '',
    pass: '',
    to: 'sarthakm.cs.24@nitj.ac.in',
    isConfigured: false,
  });
  const [smtpLoading, setSmtpLoading] = useState(false);

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
    document.body.classList.add('manager-page');
    document.body.classList.add('manager-active');
    document.body.style.cursor = 'auto';
    document.documentElement.style.cursor = 'auto';
    verifySession();

    return () => {
      document.body.classList.remove('manager-page');
      document.body.classList.remove('manager-active');
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
    };
  }, []);

  const verifySession = async () => {
    try {
      const res = await checkAdminSessionAction();
      setIsAuthenticated(res.authenticated);
      if (res.authenticated) {
        fetchAllData();
        fetchSecurityConfigs();
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchSecurityConfigs = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        getTotpSetupAction(),
        getSmtpConfigAction(),
      ]);

      if (tRes.success) {
        setTotpSetup({
          enabled: Boolean(tRes.enabled),
          secret: tRes.secret || '',
          qrCodeUrl: tRes.qrCodeUrl || '',
        });
      }

      if (sRes.success && sRes.config) {
        setSmtpForm({
          host: sRes.config.host || 'smtp.gmail.com',
          port: sRes.config.port || 465,
          user: sRes.config.user || '',
          pass: sRes.config.pass || '',
          to: sRes.config.to || 'sarthakm.cs.24@nitj.ac.in',
          isConfigured: sRes.config.isConfigured,
        });
      }
    } catch (err) {
      console.error('Error fetching security configs:', err);
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
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler Step 1: Passcode
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await adminLoginAction(passcode);
      if (res.success) {
        if (res.requires2FA && res.tempToken) {
          setRequires2FA(true);
          setTemp2faToken(res.tempToken);
          setAuthError('');
          showToast('Passcode verified! Enter 6-digit Authenticator code.');
        } else {
          setIsAuthenticated(true);
          setPasscode('');
          showToast('Authenticated successfully as Administrator.');
          fetchAllData();
          fetchSecurityConfigs();
        }
      } else {
        setAuthError(res.error || 'Authentication failed.');
      }
    } catch {
      setAuthError('Error communicating with authentication server.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Login handler Step 2: 6-digit Google/Microsoft Authenticator Code
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || !temp2faToken) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await verify2FAAction(temp2faToken, totpCode);
      if (res.success) {
        setIsAuthenticated(true);
        setRequires2FA(false);
        setTemp2faToken('');
        setTotpCode('');
        setPasscode('');
        showToast('2FA verified! Logged into Admin Command Center.');
        fetchAllData();
        fetchSecurityConfigs();
      } else {
        setAuthError(res.error || 'Invalid 6-digit Authenticator code.');
      }
    } catch {
      setAuthError('Failed to verify 2FA token.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await adminLogoutAction();
    setIsAuthenticated(false);
    setRequires2FA(false);
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

  // Enable 2FA handler
  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpSetup?.secret || !verifySetupCode) return;
    setTotpActionLoading(true);
    try {
      const res = await enableTotpAction(totpSetup.secret, verifySetupCode);
      if (res.success) {
        showToast(res.message || '2FA activated successfully!');
        setVerifySetupCode('');
        fetchSecurityConfigs();
      } else {
        showToast(res.error || 'Failed to verify 2FA code.', 'error');
      }
    } catch {
      showToast('Error enabling 2FA.', 'error');
    } finally {
      setTotpActionLoading(false);
    }
  };

  // Disable 2FA handler
  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Google/Microsoft Authenticator 2FA?')) return;
    setTotpActionLoading(true);
    try {
      const res = await disableTotpAction();
      if (res.success) {
        showToast('2FA has been disabled.');
        fetchSecurityConfigs();
      } else {
        showToast(res.error || 'Failed to disable 2FA.', 'error');
      }
    } catch {
      showToast('Error disabling 2FA.', 'error');
    } finally {
      setTotpActionLoading(false);
    }
  };

  // Update SMTP Email notification settings
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpLoading(true);
    try {
      const res = await updateSmtpConfigAction(smtpForm);
      if (res.success) {
        showToast('Email alert credentials saved successfully!');
        fetchSecurityConfigs();
      } else {
        showToast(res.error || 'Failed to update SMTP settings.', 'error');
      }
    } catch {
      showToast('Error saving email settings.', 'error');
    } finally {
      setSmtpLoading(false);
    }
  };

  // --- PROJECT ACTIONS ---
  const openProjectModal = (project?: Project) => {
    if (project) {
      setEditingItem(project);
      let parsedContribs = [''];
      try {
        if (project.contributions) parsedContribs = JSON.parse(project.contributions);
      } catch { }
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
      }
    } catch {
      showToast('Error deleting project.', 'error');
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleProjectFeatured(id, !currentStatus);
      if (res.success) {
        showToast(`Featured status set to ${!currentStatus}`);
        fetchAllData();
      }
    } catch {
      showToast('Error toggling featured.', 'error');
    }
  };

  // --- EXPERIENCE ACTIONS ---
  const openExpModal = (exp?: Experience) => {
    if (exp) {
      setEditingItem(exp);
      let parsedBullets = [''];
      try {
        if (exp.bulletPoints) parsedBullets = JSON.parse(exp.bulletPoints);
      } catch { }
      setExpForm({
        title: exp.title,
        organization: exp.organization,
        location: exp.location || '',
        type: exp.type,
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
          showToast('Experience updated successfully!');
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
    if (!confirm(`Delete experience "${title}"?`)) return;
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

  const handleSaveInquiryNotes = async (id: string, notes: string) => {
    try {
      const res = await addInquiryNote(id, notes);
      if (res.success) {
        showToast('Admin note saved.');
        fetchAllData();
      }
    } catch {
      showToast('Error saving note.', 'error');
    }
  };

  // Computed Values
  const pendingInquiriesCount = inquiries.filter(i => i.status === 'pending').length;
  const filteredInquiries = inquiries.filter(i => {
    if (inquiryFilter === 'all') return true;
    return i.status === inquiryFilter;
  });

  const categories = ['Programming', 'Frameworks', 'AI/ML', 'Databases', 'Tools'];
  const skillsByCategory = categories.reduce<Record<string, Skill[]>>((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat);
    return acc;
  }, {});

  if (!mounted || isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#040404', color: '#F2F2F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #FF4C24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          INITIALIZING MEHTA OS SECURITY GATEWAY...
        </div>
      </div>
    );
  }

  // --- UNAUTHENTICATED PASSCODE & 2FA GATE ---
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

          {!requires2FA ? (
            /* STEP 1: Passcode Input */
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
                Access Verification
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(242, 242, 240, 0.6)', marginBottom: '28px', lineHeight: '1.5' }}>
                Enter your master administrator passcode to verify authorization.
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
                    }}
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
                    cursor: 'pointer',
                  }}
                >
                  {authLoading ? 'Verifying Credentials...' : 'Authenticate →'}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: 6-Digit Google / Microsoft Authenticator Code */
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
                🛡 2FA Security Verification
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(242, 242, 240, 0.65)', marginBottom: '24px', lineHeight: '1.5' }}>
                Open your <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong> app and enter the current 6-digit code.
              </p>

              <form onSubmit={handleVerify2FA}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#FF4C24', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    6-Digit Authenticator Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    style={{
                      width: '100%',
                      background: '#161616',
                      border: '1px solid #FF4C24',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      color: '#FFF',
                      fontSize: '24px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      outline: 'none',
                    }}
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
                    cursor: 'pointer',
                    marginBottom: '12px',
                  }}
                >
                  {authLoading ? 'Verifying 2FA Token...' : 'Verify & Authorize Session →'}
                </button>

                <button
                  type="button"
                  onClick={() => { setRequires2FA(false); setAuthError(''); }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'rgba(242, 242, 240, 0.5)',
                    border: 'none',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                  }}
                >
                  ← Back to Passcode
                </button>
              </form>
            </>
          )}

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(242, 242, 240, 0.4)', fontFamily: 'var(--font-mono)' }}>Default Pass: sarthak2026</span>
            <Link href="/" style={{ fontSize: '12px', color: '#FF4C24', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>← Public Site</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD ---
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#F2F2F0', display: 'flex', flexDirection: 'column' }}>

      {/* Toast Notification Floating Banner */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: toast.type === 'success' ? '#121212' : '#2A0808',
            border: toast.type === 'success' ? '1px solid #FF4C24' : '1px solid #FF3333',
            color: toast.type === 'success' ? '#F2F2F0' : '#FF7777',
            padding: '12px 20px',
            borderRadius: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {toast.type === 'success' ? '✓ ' : '⚠️ '}
          {toast.message}
        </motion.div>
      )}

      {/* TOP COMMAND NAV BAR */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0C0C0C', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF4C24', boxShadow: '0 0 10px #FF4C24' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>SARTHAK MEHTA // ADMIN PLATFORM</div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.4)' }}>Full Control CMS & Security Telemetry Center</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#4ADE80', fontFamily: 'var(--font-mono)', background: 'rgba(74,222,128,0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(74,222,128,0.3)' }}>
            ● Session Active
          </span>
          <Link href="/" target="_blank" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }}>
            View Public Site ↗
          </Link>
          <button
            onClick={handleLogout}
            style={{ background: 'rgba(255,50,50,0.12)', border: '1px solid rgba(255,50,50,0.3)', color: '#FF6666', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* DASHBOARD TAB NAVIGATION BAR */}
      <div style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 40px', display: 'flex', gap: '4px' }}>
        {[
          { id: 'overview', label: '📊 Telemetry Overview' },
          { id: 'experiences', label: `💼 Experiences (${experiences.length})` },
          { id: 'projects', label: `🚀 Projects (${projects.length})` },
          { id: 'skills', label: `⚡ Skills Matrix (${skills.length})` },
          { id: 'inquiries', label: `📬 Inquiries ${pendingInquiriesCount > 0 ? `(${pendingInquiriesCount} New)` : ''}` },
          { id: 'security', label: '🛡 Security & 2FA Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #FF4C24' : '2px solid transparent',
              color: activeTab === tab.id ? '#FF4C24' : 'rgba(242,242,240,0.6)',
              padding: '16px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>

        {/* --- TAB 1: OVERVIEW TELEMETRY --- */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '24px' }}>System Overview & Telemetry</h2>

            {/* Quick Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Projects</div>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#FF4C24' }}>{projects.length}</div>
                <div style={{ fontSize: '12px', color: 'rgba(242,242,240,0.4)', marginTop: '4px' }}>{projects.filter(p => p.featured).length} Featured on Site</div>
              </div>

              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', textTransform: 'uppercase', marginBottom: '8px' }}>Experiences & Roles</div>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#FFF' }}>{experiences.length}</div>
                <div style={{ fontSize: '12px', color: 'rgba(242,242,240,0.4)', marginTop: '4px' }}>{experiences.filter(e => e.current).length} Active Current Roles</div>
              </div>

              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', textTransform: 'uppercase', marginBottom: '8px' }}>Skills Registered</div>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#FFF' }}>{skills.length}</div>
                <div style={{ fontSize: '12px', color: 'rgba(242,242,240,0.4)', marginTop: '4px' }}>Across {categories.length} Categories</div>
              </div>

              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Inquiries</div>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 700, color: pendingInquiriesCount > 0 ? '#FF4C24' : '#4ADE80' }}>
                  {pendingInquiriesCount}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(242,242,240,0.4)', marginTop: '4px' }}>{inquiries.length} Total Messages Received</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>⚡ Quick Management Shortcuts</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => { openProjectModal(); }} style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '12px 20px', fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: 'pointer' }}>
                  + Create New Project
                </button>
                <button onClick={() => { openExpModal(); }} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '8px', padding: '12px 20px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                  + Add Experience
                </button>
                <button onClick={() => { openSkillModal(); }} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '8px', padding: '12px 20px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                  + Register Skill
                </button>
                <button onClick={() => setActiveTab('inquiries')} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '8px', padding: '12px 20px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                  📬 Review Inquiries
                </button>
                <button onClick={() => setActiveTab('security')} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#FF4C24', borderRadius: '8px', padding: '12px 20px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                  🛡 Configure 2FA & Email Alerts
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 2: EXPERIENCES --- */}
        {activeTab === 'experiences' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Experience & Career Timeline</h2>
                <p style={{ color: 'rgba(242,242,240,0.6)', fontSize: '14px' }}>Manage work history, internships, education, and roles.</p>
              </div>
              <button
                onClick={() => openExpModal()}
                style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                + Add Experience Entry
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ background: '#1A1A1A', color: '#FF4C24', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                        {exp.type}
                      </span>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)' }}>
                        {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                      </span>
                      {exp.current && <span style={{ color: '#4ADE80', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>● Current Role</span>}
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '4px 0' }}>{exp.title}</h3>
                    <div style={{ color: 'rgba(242,242,240,0.8)', fontSize: '14px', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                      {exp.organization} {exp.location ? `• ${exp.location}` : ''}
                    </div>

                    {exp.description && <p style={{ fontSize: '14px', color: 'rgba(242,242,240,0.7)', lineHeight: '1.6', marginBottom: '12px' }}>{exp.description}</p>}

                    {exp.technologies && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {exp.technologies.split(',').map((t) => (
                          <span key={t} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.7)' }}>
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openExpModal(exp)} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                      Edit ✏️
                    </button>
                    <button onClick={() => handleDeleteExperience(exp.id, exp.title)} style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#FF5555', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                      Delete 🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- TAB 3: PROJECTS --- */}
        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Projects & Work Portfolio</h2>
                <p style={{ color: 'rgba(242,242,240,0.6)', fontSize: '14px' }}>Manage portfolio projects, tech stack tags, architectures, and features.</p>
              </div>
              <button
                onClick={() => openProjectModal()}
                style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                + Create New Project
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {projects.map((p) => (
                <div key={p.id} style={{ background: '#0E0E0E', border: p.featured ? '1px solid rgba(255,76,36,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#FF4C24' }}>Project {p.num || '00'}</span>
                      <button
                        onClick={() => handleToggleFeatured(p.id, p.featured)}
                        style={{ background: p.featured ? '#FF4C24' : '#161616', color: p.featured ? '#FFF' : 'rgba(242,242,240,0.5)', border: 'none', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                      >
                        {p.featured ? '★ Featured' : '☆ Feature'}
                      </button>
                    </div>

                    <h3 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>{p.title}</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(242,242,240,0.7)', lineHeight: '1.5', marginBottom: '16px' }}>{p.desc}</p>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {p.tags.split(',').map((t) => (
                        <span key={t} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)' }}>
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={() => openProjectModal(p)} style={{ flex: 1, background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '6px', padding: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                      Edit ✏️
                    </button>
                    <button onClick={() => handleDeleteProject(p.id, p.title)} style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#FF5555', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                      Delete 🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- TAB 4: SKILLS MATRIX --- */}
        {activeTab === 'skills' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px' }}>Technical Skills Matrix</h2>
                <p style={{ color: 'rgba(242,242,240,0.6)', fontSize: '14px' }}>Manage programming languages, frameworks, AI/ML tools, and databases.</p>
              </div>
              <button
                onClick={() => openSkillModal()}
                style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                + Register New Skill
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {skills.map((skill) => (
                <div key={skill.id} style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#FF4C24', textTransform: 'uppercase' }}>{skill.category}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '2px 0 6px 0' }}>{skill.name}</h3>
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)' }}>Proficiency: {skill.proficiency}%</div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => openSkillModal(skill)}
                      style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.15)', color: '#F2F2F0', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
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

        {/* --- TAB 6: SECURITY, 2FA & EMAIL ALERTS --- */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '8px' }}>
              Security & Authentication Telemetry
            </h2>
            <p style={{ color: 'rgba(242,242,240,0.6)', fontSize: '14px', marginBottom: '28px' }}>
              Configure Google/Microsoft Authenticator 2FA, master credentials, and instant login attempt email alerts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '28px' }}>

              {/* CARD 1: Google / Microsoft Authenticator (2FA) */}
              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,76,36,0.3)', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>🛡 Google / Microsoft Authenticator</h3>
                  <span style={{
                    background: totpSetup?.enabled ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
                    color: totpSetup?.enabled ? '#4ADE80' : '#EF4444',
                    border: `1px solid ${totpSetup?.enabled ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}>
                    {totpSetup?.enabled ? '● 2FA ENABLED' : '○ 2FA DISABLED'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'rgba(242,242,240,0.65)', lineHeight: '1.5', marginBottom: '20px' }}>
                  Scan the QR code below using your mobile app (<strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong>) to secure your admin account with 6-digit TOTP codes.
                </p>

                {totpSetup?.qrCodeUrl && (
                  <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={totpSetup.qrCodeUrl} alt="2FA QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
                  </div>
                )}

                {totpSetup?.secret && (
                  <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>Secret Key (Manual Entry)</div>
                    <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: '#FF4C24', fontWeight: 'bold', letterSpacing: '2px' }}>{totpSetup.secret}</div>
                  </div>
                )}

                <form onSubmit={handleEnable2FA} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code to verify..."
                    value={verifySetupCode}
                    onChange={(e) => setVerifySetupCode(e.target.value.replace(/\D/g, ''))}
                    style={{ flex: 1, background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
                  />
                  <button
                    type="submit"
                    disabled={totpActionLoading || !verifySetupCode}
                    style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                  >
                    Verify & Enable 2FA
                  </button>
                </form>

                {totpSetup?.enabled && (
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={totpActionLoading}
                    style={{ width: '100%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', borderRadius: '8px', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                  >
                    Disable 2FA Security
                  </button>
                )}
              </div>

              {/* CARD 2: Email Alert Telemetry Settings */}
              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>✉ Login Attempt Email Alerts</h3>
                  <span style={{
                    background: smtpForm.isConfigured ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
                    color: smtpForm.isConfigured ? '#4ADE80' : '#FBBF24',
                    border: `1px solid ${smtpForm.isConfigured ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}>
                    {smtpForm.isConfigured ? '● ALERTS ACTIVE' : '○ PENDING SMTP SETUP'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'rgba(242,242,240,0.65)', lineHeight: '1.5', marginBottom: '16px' }}>
                  Receive an instant email notification for <strong>every login attempt</strong> (successful or failed) containing IP address and timestamp telemetry.
                </p>

                <div style={{ background: '#161616', borderRadius: '8px', padding: '12px', fontSize: '12px', color: 'rgba(242,242,240,0.6)', fontFamily: 'var(--font-mono)', marginBottom: '20px', borderLeft: '3px solid #FF4C24' }}>
                  💡 <strong>100% Free Setup via Gmail:</strong> Enter your Gmail address and a 16-character <strong>Gmail App Password</strong> (generated in Google Account → Security → App Passwords).
                </div>

                <form onSubmit={handleSaveSmtp}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '4px' }}>SENDER GMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={smtpForm.user}
                      onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '4px' }}>GMAIL APP PASSWORD (16 chars)</label>
                    <input
                      type="password"
                      required
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={smtpForm.pass}
                      onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '4px' }}>ALERT RECIPIENT EMAIL</label>
                    <input
                      type="email"
                      required
                      placeholder="sarthakm.cs.24@nitj.ac.in"
                      value={smtpForm.to}
                      onChange={(e) => setSmtpForm({ ...smtpForm, to: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={smtpLoading}
                    style={{ width: '100%', background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                  >
                    {smtpLoading ? 'Saving...' : 'Save Email Alert Credentials →'}
                  </button>
                </form>
              </div>

            </div>

            {/* Master Passcode & DB Utils */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
              <div style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px' }}>
                <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>🔑 Update Master Passcode</h3>
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
                <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>💾 Database & Telemetry Cache</h3>
                <p style={{ fontSize: '13px', color: 'rgba(242,242,240,0.6)', marginBottom: '20px', lineHeight: '1.5' }}>
                  Refresh local SQLite database models or re-sync active content.
                </p>

                <button
                  onClick={() => { fetchAllData(); fetchSecurityConfigs(); showToast('Database cache synced!'); }}
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
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '650px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#0E0E0E',
                border: '1px solid rgba(255,76,36,0.4)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>
                  {activeModal === 'project' && (editingItem ? 'Edit Project' : 'Create New Project')}
                  {activeModal === 'experience' && (editingItem ? 'Edit Experience' : 'Add Experience Entry')}
                  {activeModal === 'skill' && (editingItem ? 'Edit Skill' : 'Register New Skill')}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(242,242,240,0.6)', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* PROJECT FORM */}
              {activeModal === 'project' && (
                <form onSubmit={handleSaveProject}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>PROJECT NUM</label>
                      <input
                        type="text"
                        value={projectForm.num}
                        onChange={(e) => setProjectForm({ ...projectForm, num: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>PROJECT TITLE *</label>
                      <input
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>SHORT DESCRIPTION *</label>
                    <textarea
                      required
                      rows={3}
                      value={projectForm.desc}
                      onChange={(e) => setProjectForm({ ...projectForm, desc: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>TAGS (COMMA SEPARATED) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Next.js, TypeScript, PyTorch"
                      value={projectForm.tags}
                      onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>GITHUB URL</label>
                      <input
                        type="url"
                        value={projectForm.githubUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>LIVE DEMO URL</label>
                      <input
                        type="url"
                        value={projectForm.projectUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, projectUrl: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <input
                      type="checkbox"
                      id="feat"
                      checked={projectForm.featured}
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                      style={{ accentColor: '#FF4C24', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="feat" style={{ fontSize: '14px', color: 'rgba(242,242,240,0.85)', cursor: 'pointer' }}>Mark as Featured Project on Main Website</label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={() => setActiveModal(null)} style={{ background: '#161616', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 18px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Save Project</button>
                  </div>
                </form>
              )}

              {/* EXPERIENCE FORM */}
              {activeModal === 'experience' && (
                <form onSubmit={handleSaveExperience}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>ROLE / TITLE *</label>
                      <input
                        type="text"
                        required
                        value={expForm.title}
                        onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>ORGANIZATION *</label>
                      <input
                        type="text"
                        required
                        value={expForm.organization}
                        onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>TYPE</label>
                      <select
                        value={expForm.type}
                        onChange={(e) => setExpForm({ ...expForm, type: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                      >
                        <option>Work</option>
                        <option>Internship</option>
                        <option>Education</option>
                        <option>Leadership</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>START DATE *</label>
                      <input
                        type="text"
                        required
                        placeholder="Jan 2026"
                        value={expForm.startDate}
                        onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>END DATE</label>
                      <input
                        type="text"
                        placeholder="Feb 2026"
                        disabled={expForm.current}
                        value={expForm.endDate}
                        onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <input
                      type="checkbox"
                      id="cur"
                      checked={expForm.current}
                      onChange={(e) => setExpForm({ ...expForm, current: e.target.checked })}
                      style={{ accentColor: '#4ADE80', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="cur" style={{ fontSize: '14px', color: 'rgba(242,242,240,0.85)', cursor: 'pointer' }}>Currently Active Role</label>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>DESCRIPTION OVERVIEW</label>
                    <textarea
                      rows={3}
                      value={expForm.description}
                      onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={() => setActiveModal(null)} style={{ background: '#161616', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 18px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Save Experience</button>
                  </div>
                </form>
              )}

              {/* SKILL FORM */}
              {activeModal === 'skill' && (
                <form onSubmit={handleSaveSkill}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>SKILL NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="PyTorch / Next.js"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>CATEGORY *</label>
                      <select
                        value={skillForm.category}
                        onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                        style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF', fontFamily: 'var(--font-mono)' }}
                      >
                        <option>Programming</option>
                        <option>Frameworks</option>
                        <option>AI/ML</option>
                        <option>Databases</option>
                        <option>Tools</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>PROFICIENCY ({skillForm.proficiency}%)</label>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={skillForm.proficiency}
                        onChange={(e) => setSkillForm({ ...skillForm, proficiency: parseInt(e.target.value, 10) })}
                        style={{ width: '100%', accentColor: '#FF4C24', marginTop: '8px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={() => setActiveModal(null)} style={{ background: '#161616', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 18px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" style={{ background: '#FF4C24', color: '#FFF', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Register Skill</button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INQUIRY INSPECT DIALOG */}
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
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '650px',
                background: '#0E0E0E',
                border: '1px solid rgba(255,76,36,0.4)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>Inquiry Telemetry Details</h3>
                <button onClick={() => setSelectedInquiry(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(242,242,240,0.6)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#161616', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)' }}>SENDER NAME</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedInquiry.name}</div>
                </div>
                <div style={{ background: '#161616', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)' }}>EMAIL</div>
                  <div style={{ fontSize: '14px', color: '#FF4C24', fontFamily: 'var(--font-mono)' }}>{selectedInquiry.email}</div>
                </div>
              </div>

              <div style={{ background: '#161616', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.5)', marginBottom: '8px' }}>MESSAGE BODY</div>
                <p style={{ fontSize: '14px', color: 'rgba(242,242,240,0.9)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedInquiry.message}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(242,242,240,0.6)', marginBottom: '6px' }}>ADMIN NOTES</label>
                <textarea
                  rows={2}
                  defaultValue={selectedInquiry.notes || ''}
                  onBlur={(e) => handleSaveInquiryNotes(selectedInquiry.id, e.target.value)}
                  placeholder="Type internal note and click outside to save..."
                  style={{ width: '100%', background: '#161616', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: Portfolio Inquiry`}
                  style={{ background: '#FF4C24', color: '#FFF', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}
                >
                  ✉ Send Direct Email Reply
                </a>
                <button onClick={() => setSelectedInquiry(null)} style={{ background: '#161616', color: '#FFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 18px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
