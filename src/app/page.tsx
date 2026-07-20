'use client';

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import Link from 'next/link';

import { getProjects } from '../actions/project';
import { submitInquiry } from '../actions/inquiry';

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */

const skills = [
  'Next.js', 'React', 'TypeScript', 'Python', 'FastAPI',
  'PyTorch', 'TensorFlow', 'Prisma', 'Google Earth Engine',
  'SQLite', 'C++', 'Electron', 'Hugging Face', 'QGIS',
];

const staticProjects = [
  {
    id: 'chiefos',
    num: '01',
    title: 'ChiefOS',
    desc: 'A premium AI Operating System acting as an executive Chief of Staff. Multi-engine intelligence architecture powered by Groq Llama 3.3 and Gemini 2.5 Flash.',
    tags: ['Next.js', 'TypeScript', 'Gemini AI', 'Prisma', 'SQLite'],
    url: 'https://github.com/sarthaxmehta/ChiefOS',
    architecture: 'Next.js 16 (App Router) + SQLite via Prisma ORM + Groq Llama 3.3 70B + Gemini 2.5 Flash / Gemma 4 26B',
    contributions: [
      'Designed multi-engine AI orchestrator — Intent, Scheduling, Risk, and Memory Engines working in concert',
      'Built deterministic timezone offset algorithm resolving LLM UTC outputs to local user time without hallucination',
      'Created high-capacity model fallback pipeline switching workloads seamlessly under rate limits',
      'Implemented "Daily Briefing" using Gemini 2.5 generating proactive, executive-level strategy recommendations',
    ],
    challenge: 'Bridging unpredictable LLM completions with strict database transactions — solved by building Zod-based parser engines that validate all AI inputs synchronously before any execution occurs.',
  },
  {
    id: 'urbannet',
    num: '02',
    title: 'UrbanNet',
    desc: 'End-to-end geospatial AI pipeline for automated building footprint extraction from Sentinel-2 satellite imagery. Random Forest at 93.7% accuracy + custom U-Net for pixel-level delineation.',
    tags: ['PyTorch', 'U-Net', 'Google Earth Engine', 'QGIS', 'NumPy'],
    url: 'https://github.com/sarthaxmehta/UrbanNet',
    architecture: 'PyTorch (Custom U-Net ConvNet) + Google Earth Engine JavaScript API + QGIS + NumPy + Rasterio',
    contributions: [
      'Engineered cloud-based multispectral feature workflows computing NDVI, NDWI, NDBI, and GLCM texture',
      'Trained Random Forest classifier achieving 93.7% overall accuracy with Kappa coefficient 0.91+',
      'Built PyTorch U-Net segmentation pipeline for high-precision pixel-level boundary delineation',
      'Integrated GIS spatial analysis converting AI raster predictions into usable vector shapefiles via QGIS',
    ],
    challenge: 'Transitioning massive geospatial raster data from cloud GEE to local PyTorch tensor arrays without geospatial metadata loss — solved via custom raster block mapping with Rasterio.',
  },
  {
    id: 'vitalarchive',
    num: '03',
    title: 'Vital Archive',
    desc: 'Medical informatics platform that extracts structured data from complex lab PDFs via Gemini 2.5, normalizes biomarker names semantically, and visualizes longitudinal health trends.',
    tags: ['FastAPI', 'Next.js', 'Gemini AI', 'Sentence Transformers', 'Recharts'],
    url: 'https://github.com/sarthaxmehta/Vital-Archive',
    architecture: 'Python FastAPI + Next.js + SQLite via SQLAlchemy + Sentence Transformers (PyTorch) + Gemini 2.5 Flash Lite',
    contributions: [
      'Created automated PDF ingestion pipeline extracting text matrices via pdfplumber and structuring via Gemini 2.5',
      'Developed semantic normalization pipeline using local Sentence Transformer vector embeddings',
      'Built interactive React dashboard with organ system metrics and longitudinal biomarker trend charts',
      'Integrated AI-generated plain-language summaries and context-aware chat for medical history queries',
    ],
    challenge: 'Resolving highly variable biomarker naming across different clinics ("Hgb", "H.G.B.", "Hemoglobin, Total") — solved by computing cosine similarities against a canonical medical dictionary using high-dimensional vector embeddings.',
  },
  {
    id: 'zenvvy',
    num: '04',
    title: 'Zenvvy',
    desc: 'Full-stack restaurant management system — POS, KDS, table management and inventory — packaged as a native desktop app via Electron. Runs 100% offline with local SQLite.',
    tags: ['Next.js', 'Electron', 'Prisma', 'SQLite', 'React 19'],
    url: 'https://github.com/sarthaxmehta/Zenvvy',
    architecture: 'Next.js App Router + React 19 + Electron Builder + Prisma ORM + SQLite (fully local)',
    contributions: [
      'Built POS system, kitchen display (KDS), and inventory tracker operating 100% offline',
      'Integrated simulated passwordless authentication using React Context session persistence',
      'Created complex build configurations packaging Next.js and Prisma inside macOS & Windows installers',
      'Implemented real-time table management with visual occupancy and direct kitchen-to-floor order routing',
    ],
    challenge: 'Ensuring Next.js Server Actions and Prisma SQLite client paths resolve correctly in a packaged offline desktop container on both macOS and Windows — resolved via custom native module bundling and relative path overrides.',
  },
];

const timelineItems = [
  {
    date: '2024 — Present',
    title: 'NIT Jalandhar',
    subtitle: 'B.Tech Computer Science · GPA 8.65 / 10',
    body: 'Studying at Dr. B.R. Ambedkar National Institute of Technology Jalandhar. Core Member of E-Cell and Q\'Mania Quantum Club. Relevant coursework: DSA, OOP, DBMS, Computer Networks, DAA, COA, Digital Circuits.',
  },
  {
    date: 'Jan 2026 — Feb 2026',
    title: 'India Space Academy',
    subtitle: 'Remote Sensing & GIS Intern',
    body: 'Built an end-to-end geospatial AI pipeline for automated building footprint extraction from Sentinel-2 satellite imagery in the Delhi NCR region using a custom PyTorch U-Net and Google Earth Engine Random Forest classifier.',
  },
];

const principles = [
  { num: '001', text: 'Ship things that matter.' },
  { num: '002', text: 'Have a point of view.' },
  { num: '003', text: 'Take no shortcuts.' },
  { num: '004', text: 'Be original.' },
  { num: '005', text: "If you can't be original, be better than original." },
  { num: '006', text: "Don't ship junk." },
  { num: '007', text: "Move at startup speed even if you aren't one." },
  { num: '008', text: 'Every pixel is a decision. Make it count.' },
  { num: '009', text: 'The best documentation is working code.' },
  { num: '010', text: 'Solve the hardest problem first.' },
];

const faqs = [
  {
    q: 'What kind of projects do you build?',
    a: 'Full-stack web applications, AI/ML pipelines, geospatial intelligence systems, and native desktop apps. I gravitate toward projects that involve genuinely hard engineering problems and result in a clean, high-quality product.',
  },
  {
    q: 'What technologies do you specialize in?',
    a: "Next.js, React, TypeScript, Python, FastAPI, PyTorch, Prisma, and the Google AI ecosystem. I'm also deeply experienced in geospatial tooling — Google Earth Engine, QGIS, and satellite imagery processing.",
  },
  {
    q: 'Are you open to internships?',
    a: "Yes. I'm a 2nd-year student at NIT Jalandhar (B.Tech CS, 2024–2028) and actively exploring internship opportunities in software engineering and AI/ML.",
  },
  {
    q: "What's the fastest way to reach you?",
    a: "Email at sarthakm.cs.24@nitj.ac.in — I respond fast. You can also connect on LinkedIn or explore my GitHub to see what I'm building.",
  },
];

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerChildren = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ═══════════════════════════════════════════════════════════
   UTILITY COMPONENTS
═══════════════════════════════════════════════════════════ */

// ── Scroll Progress Bar ────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 35 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

// ── Custom Cursor ──────────────────────────────────────────
function CustomCursor() {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  const ringX = useSpring(cursorX, { stiffness: 420, damping: 26 });
  const ringY = useSpring(cursorY, { stiffness: 420, damping: 26 });
  const dotX  = useSpring(cursorX, { stiffness: 900, damping: 32 });
  const dotY  = useSpring(cursorY, { stiffness: 900, damping: 32 });

  const [hover, setHover] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setHover(!!el?.closest('a, button, [data-hover], input, textarea, select'));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0,
          x: ringX, y: ringY,
          translateX: '-50%', translateY: '-50%',
          borderRadius: '50%',
          border: '1.5px solid rgba(255, 76, 36, 0.65)',
          pointerEvents: 'none', zIndex: 9999,
        }}
        animate={{
          width:  hover ? 46 : 22,
          height: hover ? 46 : 22,
          borderColor: hover
            ? 'rgba(255, 76, 36, 0.85)'
            : 'rgba(255, 76, 36, 0.55)',
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0,
          x: dotX, y: dotY,
          translateX: '-50%', translateY: '-50%',
          width: 4, height: 4, borderRadius: '50%',
          background: '#FF4C24',
          pointerEvents: 'none', zIndex: 9999,
        }}
      />
    </>
  );
}

// ── Scroll Reveal ──────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 36 },
        visible: {
          opacity: 1, y: 0,
          transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Hero Name Line (clip-reveal) ───────────────────────────
function HeroNameLine({
  text,
  delay,
}: {
  text: string;
  delay: number;
}) {
  return (
    <span className="hero-name-line">
      <motion.span
        className="hero-name-inner"
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {text}
      </motion.span>
    </span>
  );
}

// ── Infinite Marquee ───────────────────────────────────────
function Marquee({
  children,
  speed = 40,
  reverse = false,
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (ref.current) setWidth(ref.current.scrollWidth / 2);
  }, []);

  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <motion.div
        ref={ref}
        style={{ display: 'inline-flex' }}
        animate={{ x: reverse ? [0, width] : [0, -width] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: width / speed }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// ── Animated Stat Counter ──────────────────────────────────
function StatCounter({
  target,
  decimals = 0,
  suffix = '',
  prefix = '',
}: {
  target: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    const duration = 1800;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, decimals]);

  return (
    <span ref={ref}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}

// ── Project Modal ──────────────────────────────────────────
function ProjectModal({
  project,
  onClose,
}: {
  project: typeof staticProjects[0] | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (project) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="modal-panel"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="modal-header">
              <div>
                <div className="modal-num">Project {project.num}</div>
                <div className="modal-title">{project.title}</div>
              </div>
              <button className="modal-close" onClick={onClose} data-hover="true">
                ×
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Architecture */}
              <div>
                <div className="modal-section-label">Stack & Architecture</div>
                <p className="modal-text">{project.architecture}</p>
              </div>

              {/* Key Contributions */}
              <div>
                <div className="modal-section-label">What I Built</div>
                <ul className="modal-list">
                  {project.contributions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Challenge */}
              <div>
                <div className="modal-section-label">Biggest Engineering Challenge</div>
                <p className="modal-text">{project.challenge}</p>
              </div>

              {/* Tags */}
              <div>
                <div className="modal-section-label">Technologies</div>
                <div className="modal-tags-wrap">
                  {project.tags.map((t) => (
                    <span key={t} className="modal-tag">{t}</span>
                  ))}
                </div>
              </div>

              {/* Footer actions */}
              <div className="modal-footer">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '11px 26px' }}
                  data-hover="true"
                >
                  View on GitHub ↗
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── FAQ Accordion ──────────────────────────────────────────
function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {faqs.map((item, i) => (
        <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
          <div
            className="faq-question"
            onClick={() => setOpen(open === i ? null : i)}
            data-hover="true"
            style={{ cursor: 'default' }}
          >
            <span>{item.q}</span>
            <motion.span
              className="faq-toggle"
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.28 }}
            >
              +
            </motion.span>
          </div>
          <AnimatePresence>
            {open === i && (
              <motion.div
                className="faq-answer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                {item.a}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [projectData, setProjectData] = useState(staticProjects);
  const [activeProject, setActiveProject] = useState<typeof staticProjects[0] | null>(null);

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
    id?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.cursor = 'none';

    // Fetch dynamic projects
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        if (res.success && res.projects && res.projects.length > 0) {
          const mapped = res.projects.map((p: any, i: number) => ({
            id: p.id || p.title.toLowerCase().replace(/\s/g, '-'),
            num: String(i + 1).padStart(2, '0'),
            title: p.title,
            desc: p.description,
            tags: typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags,
            url: p.githubUrl || p.projectUrl || 'https://github.com/sarthaxmehta',
            architecture: '',
            contributions: [],
            challenge: '',
          }));
          // Merge with detailed static data
          const merged = mapped.map((mp: any) => {
            const staticMatch = staticProjects.find(
              sp => sp.title.toLowerCase() === mp.title.toLowerCase()
            );
            return staticMatch ? { ...mp, ...staticMatch } : mp;
          });
          setProjectData(merged);
        }
      } catch {
        // Silently use static data
      }
    };
    fetchProjects();

    return () => { document.body.style.cursor = ''; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitInquiry(formData);
      if (res.success) {
        setSubmitStatus({ success: true, id: res.inquiryId });
      } else {
        alert(res.error || 'Something went wrong. Try again.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── GLOBAL OVERLAYS ── */}
      <ScrollProgressBar />
      {mounted && <CustomCursor />}

      {/* ── NAVIGATION ── */}
      <motion.nav
        className="nav"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <Link href="/" className="nav-brand">sarthak mehta</Link>
        <div className="nav-links">
          <a href="#about"    className="nav-link">About</a>
          <a href="#work"     className="nav-link">Work</a>
          <a href="#timeline" className="nav-link">Experience</a>
          <a href="#contact"  className="nav-link">Connect</a>
        </div>
        <a href="#contact" className="nav-cta" data-hover="true">Say hello ↗</a>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════
          HERO
      ═════════════════════════════════════════════════════ */}
      <section className="hero">
        {/* Atmospheric background */}
        <div className="hero-atmosphere" />
        <div className="hero-grain" />

        <div className="hero-content">
          {/* Eyebrow */}
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="hero-eyebrow-dot" />
            NIT Jalandhar · B.Tech CS · 2024–2028
          </motion.div>

          {/* Name — two-line clip reveal */}
          <h1 className="hero-name">
            <HeroNameLine text="Sarthak" delay={0.5} />
            <HeroNameLine text="Mehta"   delay={0.65} />
          </h1>

          {/* Separator */}
          <motion.div
            className="hero-separator"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
            style={{ transformOrigin: 'left' }}
          />

          {/* Role */}
          <motion.p
            className="hero-role"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
          >
            Full-Stack Engineer & AI/ML Enthusiast
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.15 }}
          >
            <a href="#work" className="btn-primary" data-hover="true">
              View my work ↓
            </a>
            <a
              href="https://github.com/sarthaxmehta"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              data-hover="true"
            >
              GitHub ↗
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <span>scroll</span>
          <div className="scroll-line" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SKILLS MARQUEE
      ═════════════════════════════════════════════════════ */}
      <motion.div
        className="marquee-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Marquee speed={50}>
          {skills.map((s) => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
              <span className="marquee-item">{s}</span>
              <span className="marquee-sep">◆</span>
            </span>
          ))}
        </Marquee>
      </motion.div>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT WRAPPER
      ═════════════════════════════════════════════════════ */}
      <div className="main-wrap">

        {/* ════════════════════════════════════════════════
            ABOUT
        ════════════════════════════════════════════════ */}
        <section className="section" id="about">
          <Reveal>
            <div className="section-label">About me</div>
          </Reveal>

          <div className="about-grid">
            {/* Left: text */}
            <Reveal delay={0.05}>
              <h2 className="section-title" style={{ marginBottom: '28px' }}>
                Building systems that<br />actually work.
              </h2>
              <p className="about-text">
                I'm a <strong>second-year Computer Science student</strong> at NIT Jalandhar,
                building things at the intersection of full-stack engineering and artificial
                intelligence. I've shipped AI-powered operating systems, geospatial deep learning
                pipelines, medical informatics platforms, and native desktop apps — each one
                solving a real, hard problem.
              </p>
              <p className="about-text">
                I move fast, care deeply about code quality, and believe great software is
                as much about the craft as it is about the outcome.
              </p>
              <div className="about-cta-row">
                <a
                  href="https://github.com/sarthaxmehta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  data-hover="true"
                >
                  GitHub ↗
                </a>
                <a
                  href="https://www.linkedin.com/in/sarthak-mehta-698457310/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  data-hover="true"
                >
                  LinkedIn ↗
                </a>
              </div>
            </Reveal>

            {/* Right: stats */}
            <Reveal delay={0.15}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">
                    <StatCounter target={8.65} decimals={2} />
                    <span className="stat-accent" style={{ fontSize: '0.45em' }}>/10</span>
                  </div>
                  <div className="stat-label">GPA at<br />NIT Jalandhar</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    <StatCounter target={4} /><span className="stat-accent">+</span>
                  </div>
                  <div className="stat-label">Projects<br />shipped</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    <StatCounter target={1} />
                  </div>
                  <div className="stat-label">Internship<br />completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    <StatCounter target={2} />
                  </div>
                  <div className="stat-label">AI models<br />trained &amp; deployed</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="section-divider-line" />

        {/* ════════════════════════════════════════════════
            SKILLS
        ════════════════════════════════════════════════ */}
        <div className="skills-wrap">
          <Reveal>
            <div className="section-label">Tech stack</div>
          </Reveal>
          <motion.div
            className="skills-chips"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-5%' }}
            variants={staggerChildren}
          >
            {skills.map((s) => (
              <motion.span
                key={s}
                className="skill-chip"
                variants={fadeUp}
              >
                {s}
              </motion.span>
            ))}
          </motion.div>
        </div>

        <div className="section-divider-line" />

        {/* ════════════════════════════════════════════════
            PROJECTS
        ════════════════════════════════════════════════ */}
        <section className="section" id="work">
          <Reveal>
            <div className="section-label">Selected work</div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-title" style={{ marginBottom: '52px' }}>
              Things I've built.
            </h2>
          </Reveal>

          <motion.div
            className="projects-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-5%' }}
            variants={staggerChildren}
          >
            {projectData.map((p) => (
              <motion.div
                key={p.id}
                className="project-card"
                variants={fadeUp}
                onClick={() => setActiveProject(p)}
                data-hover="true"
              >
                <div className="project-card-top">
                  <span className="project-num">{p.num}</span>
                  <span className="project-arrow">↗</span>
                </div>
                <h3 className="project-title">{p.title}</h3>
                <p className="project-desc">{p.desc}</p>
                <div className="project-tags">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="project-tag">{t}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <div className="section-divider-line" />

        {/* ════════════════════════════════════════════════
            TIMELINE — EDUCATION & EXPERIENCE
        ════════════════════════════════════════════════ */}
        <section className="section" id="timeline">
          <Reveal>
            <div className="section-label">Education &amp; experience</div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '80px', alignItems: 'start' }}>
            <Reveal delay={0.05}>
              <h2 className="section-title">
                Where I've<br />been.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="timeline-wrap">
                <div className="timeline-spine" />
                {timelineItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="timeline-item"
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
                  >
                    <div className="timeline-dot" />
                    <div className="timeline-date">{item.date}</div>
                    <div className="timeline-title">{item.title}</div>
                    <div className="timeline-subtitle">{item.subtitle}</div>
                    <div className="timeline-body">{item.body}</div>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <div className="section-divider-line" />

        {/* ════════════════════════════════════════════════
            PRINCIPLES
        ════════════════════════════════════════════════ */}
        <section style={{ paddingBottom: '0' }}>
          {/* Giant ticker */}
          <div className="principles-marquee-wrap">
            <Marquee speed={90}>
              <span className="principles-ticker-text">PRINCIPLES</span>
              <span className="principles-ticker-sep">✦</span>
              <span className="principles-ticker-text">HOW I OPERATE</span>
              <span className="principles-ticker-sep">✦</span>
              <span className="principles-ticker-text">PRINCIPLES</span>
              <span className="principles-ticker-sep">✦</span>
              <span className="principles-ticker-text">HOW I OPERATE</span>
              <span className="principles-ticker-sep">✦</span>
            </Marquee>
          </div>

          <div className="section" style={{ paddingTop: '80px' }}>
            <Reveal>
              <div className="section-label">How I work</div>
            </Reveal>
            <motion.ul
              className="principles-list"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-5%' }}
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {principles.map((p) => (
                <motion.li
                  key={p.num}
                  className="principle-item"
                  variants={fadeUp}
                >
                  <span className="principle-num">{p.num}</span>
                  <span className="principle-text">{p.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        <div className="section-divider-line" />

        {/* ════════════════════════════════════════════════
            CONTACT
        ════════════════════════════════════════════════ */}
        <section className="section" id="contact">
          <Reveal>
            <div className="section-label">Get in touch</div>
          </Reveal>

          <div className="contact-grid">
            {/* Left side */}
            <div>
              <Reveal delay={0.05}>
                <h2 className="contact-headline">
                  Let's<br />connect.
                </h2>
                <p className="contact-sub">
                  Whether you want to collaborate on a project, talk about AI, or just say hi
                  — I'd love to hear from you.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="social-links">
                  {[
                    {
                      label: 'GitHub',
                      href: 'https://github.com/sarthaxmehta',
                      icon: 'GH',
                    },
                    {
                      label: 'LinkedIn',
                      href: 'https://www.linkedin.com/in/sarthak-mehta-698457310/',
                      icon: 'in',
                    },
                    {
                      label: 'sarthakm.cs.24@nitj.ac.in',
                      href: 'mailto:sarthakm.cs.24@nitj.ac.in',
                      icon: '@',
                    },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith('mailto') ? undefined : '_blank'}
                      rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                      className="social-link"
                      data-hover="true"
                    >
                      <span className="social-icon"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        {s.icon}
                      </span>
                      {s.label}
                    </a>
                  ))}
                </div>

                {/* FAQ below social links */}
                <div style={{ marginTop: '48px' }}>
                  <div className="section-label" style={{ marginBottom: '24px' }}>FAQ</div>
                  <FaqSection />
                </div>
              </Reveal>
            </div>

            {/* Right side: form */}
            <Reveal delay={0.1}>
              <div className="contact-form">
                {submitStatus ? (
                  /* Success state */
                  <div className="success-state">
                    <div className="success-icon">✓</div>
                    <div className="success-title">Message received.</div>
                    <p className="success-body">
                      Thanks, {formData.name}. I'll get back to you at{' '}
                      <strong style={{ color: 'var(--text-1)' }}>{formData.email}</strong>{' '}
                      as soon as I can.
                    </p>
                    <button
                      className="btn-secondary"
                      style={{ marginTop: '8px' }}
                      data-hover="true"
                      onClick={() => {
                        setSubmitStatus(null);
                        setFormData({
                          name: '', email: '', company: '',
                          budget: 'Just saying hello 👋',
                          timeline: 'Developer / Engineer',
                          message: '',
                        });
                      }}
                    >
                      Send another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="form-input"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="form-input"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Organization / School</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="form-input"
                        placeholder="Where are you from? (optional)"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Reason for reaching out</label>
                        <select
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="form-select"
                        >
                          <option value="Just saying hello 👋">Just saying hello 👋</option>
                          <option value="Technical collaboration 🤝">Technical collaboration 🤝</option>
                          <option value="NIT Jalandhar discussion 🎓">NIT Jalandhar discussion 🎓</option>
                          <option value="General Q&A or chat 💻">General Q&amp;A or chat 💻</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Your affiliation</label>
                        <select
                          value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          className="form-select"
                        >
                          <option value="Developer / Engineer">Developer / Engineer</option>
                          <option value="Researcher / Student">Researcher / Student</option>
                          <option value="Recruiter / Tech Manager">Recruiter / Tech Manager</option>
                          <option value="Tech Enthusiast">Tech Enthusiast</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="form-textarea"
                        placeholder="What's on your mind?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="form-submit"
                      data-hover="true"
                    >
                      {isSubmitting ? 'Sending…' : 'Send message →'}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════ */}
        <footer className="footer">
          <Reveal>
            <div className="footer-wordmark">Sarthak Mehta</div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="footer-bottom">
              <span className="footer-copy">© 2026 Sarthak Mehta. All rights reserved.</span>
              <div className="footer-link-group">
                {[
                  { label: 'GitHub',   href: 'https://github.com/sarthaxmehta' },
                  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sarthak-mehta-698457310/' },
                  { label: 'Email',    href: 'mailto:sarthakm.cs.24@nitj.ac.in' },
                  { label: 'Admin',    href: '/manager' },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="footer-link"
                    data-hover="true"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </footer>

      </div>{/* /.main-wrap */}

      {/* ── PROJECT MODAL ── */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </>
  );
}
