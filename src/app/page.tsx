'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
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
import * as THREE from 'three';

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
    challenge: 'Resolving highly variable biomarker naming across different clinics — solved by computing cosine similarities against a canonical medical dictionary using high-dimensional vector embeddings.',
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
    body: "Studying at Dr. B.R. Ambedkar National Institute of Technology Jalandhar. Core Member of E-Cell and Q'Mania Quantum Club. Relevant coursework: DSA, OOP, DBMS, Computer Networks, DAA, COA, Digital Circuits.",
  },
  {
    date: 'Jan 2026 — Feb 2026',
    title: 'India Space Academy',
    subtitle: 'Remote Sensing & GIS Intern',
    body: 'Built an end-to-end geospatial AI pipeline for automated building footprint extraction from Sentinel-2 satellite imagery in the Delhi NCR region using a custom PyTorch U-Net and Google Earth Engine Random Forest classifier.',
  },
];

const principles = [
  {
    num: '001',
    text: 'SHIP THINGS THAT MATTER.',
    person: 'Steve Jobs',
    role: '// Apple · NeXT',
    img: '/portraits/visionary.png',
  },
  {
    num: '002',
    text: 'HAVE A POINT OF VIEW.',
    person: 'Steve Jobs',
    role: '// Apple · NeXT',
    img: '/portraits/visionary.png',
  },
  {
    num: '003',
    text: 'TAKE NO SHORTCUTS.',
    person: 'Kobe Bryant',
    role: '// 1978 – 2020',
    img: '/portraits/athlete.png',
  },
  {
    num: '004',
    text: 'BE ORIGINAL.',
    person: 'Pablo Picasso',
    role: '// 1881 – 1973',
    img: '/portraits/artist.png',
  },
  {
    num: '005',
    text: "IF YOU CAN'T BE ORIGINAL, BE BETTER THAN ORIGINAL.",
    person: 'C.S. Lewis',
    role: '// 1898 – 1963',
    img: '/portraits/scholar.png',
  },
  {
    num: '006',
    text: "DON'T SHIP JUNK.",
    person: 'Jeff Bezos',
    role: '// Amazon · Blue Origin',
    img: '/portraits/ceo.png',
  },
  {
    num: '007',
    text: "MOVE AT STARTUP SPEED EVEN IF YOU AREN'T ONE.",
    person: 'Sam Altman',
    role: '// OpenAI · Y Combinator',
    img: '/portraits/ceo.png',
  },
  {
    num: '008',
    text: 'EVERY PIXEL IS A DECISION. MAKE IT COUNT.',
    person: 'Jony Ive',
    role: '// Apple Design',
    img: '/portraits/visionary.png',
  },
  {
    num: '009',
    text: 'THE BEST DOCUMENTATION IS WORKING CODE.',
    person: 'Richard Feynman',
    role: '// 1918 – 1988',
    img: '/portraits/physicist.png',
  },
  {
    num: '010',
    text: 'SOLVE THE HARDEST PROBLEM FIRST.',
    person: 'Richard Feynman',
    role: '// 1918 – 1988',
    img: '/portraits/physicist.png',
  },
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
    a: "Email at sarthakm.cs.24@nitj.ac.in — I respond fast. You can also connect on LinkedIn or explore my GitHub.",
  },
];

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerChildren = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ═══════════════════════════════════════════════════════════
   UTILITY COMPONENTS
═══════════════════════════════════════════════════════════ */

// ── Scroll Progress ────────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 35 });
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

function CustomCursor() {
  const cx = useMotionValue(-200);
  const cy = useMotionValue(-200);
  const ringX = useSpring(cx, { stiffness: 420, damping: 26 });
  const ringY = useSpring(cy, { stiffness: 420, damping: 26 });
  const dotX  = useSpring(cx, { stiffness: 900, damping: 32 });
  const dotY  = useSpring(cy, { stiffness: 900, damping: 32 });
  const [hover, setHover] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.matchMedia('(max-width: 768px)').matches || 
        ('ontouchstart' in window) || 
        navigator.maxTouchPoints > 0
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: MouseEvent) => {
      cx.set(e.clientX); cy.set(e.clientY);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setHover(!!el?.closest('a,button,[data-hover],input,textarea,select,[data-cursor]'));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [cx, cy, isMobile]);

  if (isMobile) return null;

  return (
    <>
      <motion.div style={{
        position: 'fixed', top: 0, left: 0,
        x: ringX, y: ringY, translateX: '-50%', translateY: '-50%',
        borderRadius: '50%', border: '1.5px solid rgba(255,76,36,0.6)',
        pointerEvents: 'none', zIndex: 9999,
      }}
        animate={{ width: hover ? 46 : 22, height: hover ? 46 : 22, borderColor: hover ? 'rgba(255,76,36,0.9)' : 'rgba(255,76,36,0.5)' }}
        transition={{ duration: 0.18 }}
      />
      <motion.div style={{
        position: 'fixed', top: 0, left: 0,
        x: dotX, y: dotY, translateX: '-50%', translateY: '-50%',
        width: 4, height: 4, borderRadius: '50%', background: '#FF4C24',
        pointerEvents: 'none', zIndex: 9999,
      }} />
    </>
  );
}

// ── Scroll Reveal ──────────────────────────────────────────
function Reveal({
  children, delay = 0, className,
}: {
  children: ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });
  return (
    <motion.div ref={ref} className={className}
      initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 36 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Hero Name Line (clip reveal) ───────────────────────────
function HeroNameLine({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="hero-name-line">
      <motion.span className="hero-name-inner"
        initial={{ y: '105%' }} animate={{ y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {text}
      </motion.span>
    </span>
  );
}

// ── Infinite Marquee ───────────────────────────────────────
function Marquee({ children, speed = 40, reverse = false }: { children: ReactNode; speed?: number; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => { if (ref.current) setWidth(ref.current.scrollWidth / 2); }, []);
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <motion.div ref={ref} style={{ display: 'inline-flex' }}
        animate={{ x: reverse ? [0, width] : [0, -width] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: width / speed }}
      >
        {children}{children}
      </motion.div>
    </div>
  );
}

// ── Animated Stat Counter ──────────────────────────────────
function StatCounter({ target, decimals = 0, suffix = '', prefix = '' }: {
  target: number; decimals?: number; suffix?: string; prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  useEffect(() => {
    if (!inView) return;
    let t0: number;
    const dur = 1800;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setCount(parseFloat((e * target).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, decimals]);
  return <span ref={ref}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

// ── Magnetic Button ────────────────────────────────────────
function MagneticBtn({
  children, href, className, style, target, rel,
}: {
  children: ReactNode; href: string; className?: string;
  style?: React.CSSProperties; target?: string; rel?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 18 });
  const sy = useSpring(y, { stiffness: 280, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.28);
    y.set((e.clientY - r.top - r.height / 2) * 0.28);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ ...style, x: sx, y: sy, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      target={target}
      rel={rel}
      data-hover="true"
    >
      {children}
    </motion.a>
  );
}

// ── 3D Tilt Card ───────────────────────────────────────────
function TiltCard({
  children, className, onClick,
}: {
  children: ReactNode; className?: string; onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 22 });
  const sry = useSpring(ry, { stiffness: 180, damping: 22 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    rx.set((ny - 0.5) * -9);
    ry.set((nx - 0.5) * 9);
  };
  const reset = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      onMouseMove={onMove} onMouseLeave={reset}
      className={`${className} tilt-card`}
      onClick={onClick}
      data-hover="true"
    >
      {children}
    </motion.div>
  );
}

// ── Project Modal ──────────────────────────────────────────
function ProjectModal({
  project, onClose,
}: {
  project: typeof staticProjects[0] | null; onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (project) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div className="modal-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div className="modal-panel"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="modal-header">
              <div>
                <div className="modal-num">Project {project.num}</div>
                <div className="modal-title">{project.title}</div>
              </div>
              <button className="modal-close" onClick={onClose} data-hover="true">×</button>
            </div>
            <div className="modal-body">
              <div>
                <div className="modal-section-label">Stack & Architecture</div>
                <p className="modal-text">{project.architecture}</p>
              </div>
              <div>
                <div className="modal-section-label">What I Built</div>
                <ul className="modal-list">
                  {project.contributions.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              <div>
                <div className="modal-section-label">Biggest Engineering Challenge</div>
                <p className="modal-text">{project.challenge}</p>
              </div>
              <div>
                <div className="modal-section-label">Technologies</div>
                <div className="modal-tags-wrap">
                  {project.tags.map((t) => <span key={t} className="modal-tag">{t}</span>)}
                </div>
              </div>
              <div className="modal-footer">
                <a href={project.url} target="_blank" rel="noopener noreferrer"
                  className="btn-primary" style={{ fontSize: '13px', padding: '11px 26px' }}
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

// ── Principles Section (withhoney style) ──────────────────
function PrinciplesSection() {
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const px = useMotionValue(-400);
  const py = useMotionValue(-400);
  const spx = useSpring(px, { stiffness: 220, damping: 20 });
  const spy = useSpring(py, { stiffness: 220, damping: 20 });

  const onSectionMove = useCallback((e: React.MouseEvent) => {
    px.set(e.clientX + 24);
    py.set(e.clientY - 80);
  }, [px, py]);

  return (
    <section className="principles-dark" onMouseMove={onSectionMove}>
      {/* Section heading */}
      <div className="section" style={{ paddingBottom: '48px' }}>
        <Reveal>
          <div className="section-label">How I work</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title">My principles.</h2>
        </Reveal>
      </div>

      {/* The list */}
      <div className="principles-full-list">
        {principles.map((p, i) => (
          <div
            key={p.num}
            className="principle-row"
            onMouseEnter={() => setHovIdx(i)}
            onMouseLeave={() => setHovIdx(null)}
          >
            <span className="principle-row-num">{p.num}.</span>
            <span className="principle-row-text">{p.text}</span>
          </div>
        ))}
      </div>

      {/* Floating portrait tooltip */}
      <AnimatePresence>
        {hovIdx !== null && (
          <motion.div
            className="floating-portrait"
            style={{ left: 0, top: 0, x: spx, y: spy }}
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={principles[hovIdx].img}
              alt={principles[hovIdx].person}
            />
            <div className="floating-portrait-info">
              <div className="floating-portrait-name">{principles[hovIdx].person}</div>
              <div className="floating-portrait-role">{principles[hovIdx].role}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── FAQ Accordion ──────────────────────────────────────────
function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq-list">
      {faqs.map((item, i) => (
        <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
          <div className="faq-question"
            onClick={() => setOpen(open === i ? null : i)}
            data-hover="true" style={{ cursor: 'default' }}
          >
            <span>{item.q}</span>
            <motion.span className="faq-toggle" animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.28 }}>
              +
            </motion.span>
          </div>
          <AnimatePresence>
            {open === i && (
              <motion.div className="faq-answer"
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

// ── Timeline with draw animation ──────────────────────────
function TimelineSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end center'] });
  const lineScaleY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1]),
    { stiffness: 60, damping: 20 }
  );

  return (
    <section className="section" id="timeline" ref={sectionRef}>
      <Reveal>
        <div className="section-label">Education &amp; experience</div>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '80px', alignItems: 'start' }}>
        <Reveal delay={0.05}>
          <h2 className="section-title">Where I've<br />been.</h2>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="timeline-wrap" style={{ position: 'relative' }}>
            {/* Background ghost spine */}
            <div className="timeline-spine" />
            {/* Animated spine overlay */}
            <motion.div
              className="timeline-spine-animated"
              style={{
                height: `calc(100% - 24px)`,
                scaleY: lineScaleY,
              }}
            />
            {timelineItems.map((item, i) => (
              <motion.div key={i} className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.14 }}
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
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [projectData, setProjectData] = useState(staticProjects);
  const [activeProject, setActiveProject] = useState<typeof staticProjects[0] | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [vantaContactEffect, setVantaContactEffect] = useState<any>(null);

  // Parallax
  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 600], [0, -90]);

  const [formData, setFormData] = useState({
    name: '', email: '', company: '',
    budget: 'Just saying hello 👋',
    timeline: 'Developer / Engineer',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; id?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.cursor = 'none';
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        if (res.success && res.projects && res.projects.length > 0) {
          const mapped = res.projects.map((p: any, i: number) => ({
            id: p.id || p.title.toLowerCase().replace(/\s/g, '-'),
            num: String(i + 1).padStart(2, '0'),
            title: p.title, desc: p.description,
            tags: typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags,
            url: p.githubUrl || p.projectUrl || 'https://github.com/sarthaxmehta',
            architecture: '', contributions: [], challenge: '',
          }));
          const merged = mapped.map((mp: any) => {
            const sm = staticProjects.find(sp => sp.title.toLowerCase() === mp.title.toLowerCase());
            return sm ? { ...mp, ...sm } : mp;
          });
          setProjectData(merged);
        }
      } catch { /* silently use static */ }
    };
    fetchProjects();

    // Vanta.js net effect initialization
    let effect: any = null;
    let contactEffect: any = null;
    if (typeof window !== 'undefined') {
      (window as any).THREE = THREE;
      if (heroRef.current) {
        import('vanta/dist/vanta.net.min').then((NET) => {
          if (heroRef.current && !effect) {
            effect = NET.default({
              el: heroRef.current,
              THREE: THREE,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              color: 0xff4c24, // --accent
              backgroundColor: 0x040404, // matches --bg
              points: 10.00,
              maxDistance: 22.00,
              spacing: 16.00
            });
            setVantaEffect(effect);
          }
        });
      }
      if (contactRef.current) {
        import('vanta/dist/vanta.waves.min').then((WAVES) => {
          if (contactRef.current && !contactEffect) {
            contactEffect = WAVES.default({
              el: contactRef.current,
              THREE: THREE,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              color: 0x070707, // very dark subtle grey wave
              shininess: 35.00,
              waveHeight: 12.00,
              waveSpeed: 0.60,
              zoom: 0.90
            });
            setVantaContactEffect(contactEffect);
          }
        });
      }
    }

    return () => {
      document.body.style.cursor = '';
      if (effect) {
        effect.destroy();
      }
      if (contactEffect) {
        contactEffect.destroy();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) { alert('Please fill all required fields.'); return; }
    setIsSubmitting(true);
    try {
      const res = await submitInquiry(formData);
      if (res.success) setSubmitStatus({ success: true, id: res.inquiryId });
      else alert(res.error || 'Something went wrong. Try again.');
    } catch { alert('An error occurred.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <>
      <ScrollProgressBar />
      {mounted && <CustomCursor />}

      {/* ── NAV ── */}
      <motion.nav className="nav"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <Link href="/" className="nav-brand">sarthak mehta</Link>
        <div className="nav-links">
          {['About', 'Work', 'Experience', 'Connect'].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
        </div>
        <a href="#contact" className="nav-cta" data-hover="true">Say hello ↗</a>
      </motion.nav>

      {/* ══════════════════════════════════════════════════════
          HERO
      ═════════════════════════════════════════════════════ */}
      <section className="hero" ref={heroRef}>
        <motion.div className="hero-atmosphere" style={{ y: glowY }} />
        <div className="hero-grain" />

        <div className="hero-content">
          <motion.div className="hero-eyebrow"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="hero-eyebrow-dot" />
            NIT Jalandhar · B.Tech CS · 2024–2028
          </motion.div>

          <h1 className="hero-name">
            <HeroNameLine text="Sarthak" delay={0.5} />
            <HeroNameLine text="Mehta"   delay={0.65} />
          </h1>

          <motion.div className="hero-separator"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
            style={{ transformOrigin: 'left' }}
          />

          <motion.p className="hero-role"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
          >
            Full-Stack Engineer & AI/ML Enthusiast
          </motion.p>

          <motion.div className="hero-actions"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.15 }}
          >
            <MagneticBtn href="#work" className="btn-primary">
              View my work ↓
            </MagneticBtn>
            <MagneticBtn href="https://github.com/sarthaxmehta" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              GitHub ↗
            </MagneticBtn>
          </motion.div>
        </div>

        <motion.div className="scroll-indicator"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <span>scroll</span>
          <div className="scroll-line" />
        </motion.div>
        <div className="hero-bottom-blend" />
      </section>

      {/* ══════════════════════════════════════════════════════
          SKILLS MARQUEE
      ═════════════════════════════════════════════════════ */}
      <motion.div className="marquee-section"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Marquee speed={50}>
          {skills.map((s) => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className="marquee-item">{s}</span>
              <span className="marquee-sep">◆</span>
            </span>
          ))}
        </Marquee>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT
      ═════════════════════════════════════════════════════ */}
      <div className="main-wrap">

        {/* ── ABOUT ── */}
        <section className="section" id="about">
          <Reveal><div className="section-label">About me</div></Reveal>
          <div className="about-grid">
            <Reveal delay={0.05}>
              <h2 className="section-title" style={{ marginBottom: '28px' }}>
                Building systems that<br />actually work.
              </h2>
              <p className="about-text">
                I'm a <strong>second-year Computer Science student</strong> at NIT Jalandhar,
                building things at the intersection of full-stack engineering and artificial
                intelligence. I've shipped AI-powered operating systems, geospatial deep learning
                pipelines, medical informatics platforms, and native desktop apps — each solving a
                real, hard problem.
              </p>
              <p className="about-text">
                I move fast, care deeply about code quality, and believe great software is as much
                about the craft as it is about the outcome.
              </p>
              <div className="about-cta-row">
                <MagneticBtn href="https://github.com/sarthaxmehta" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  GitHub ↗
                </MagneticBtn>
                <MagneticBtn href="https://www.linkedin.com/in/sarthak-mehta-698457310/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  LinkedIn ↗
                </MagneticBtn>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <motion.div className="stats-grid"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {[
                  { num: <><StatCounter target={8.65} decimals={2} /><span className="stat-accent" style={{ fontSize: '0.45em' }}>/10</span></>, label: 'GPA at\nNIT Jalandhar' },
                  { num: <><StatCounter target={4} /><span className="stat-accent">+</span></>, label: 'Projects\nshipped' },
                  { num: <StatCounter target={1} />, label: 'Internship\ncompleted' },
                  { num: <StatCounter target={2} />, label: 'AI models\ntrained & deployed' },
                ].map((s, i) => (
                  <motion.div key={i} className="stat-card"
                    variants={{ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
                  >
                    <div className="stat-number">{s.num}</div>
                    <div className="stat-label" style={{ whiteSpace: 'pre-line' }}>{s.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </Reveal>
          </div>
        </section>

        <div className="section-divider-line" />

        {/* ── SKILLS ── */}
        <div className="skills-wrap">
          <Reveal><div className="section-label">Tech stack</div></Reveal>
          <motion.div className="skills-chips"
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-5%' }}
            variants={staggerChildren}
          >
            {skills.map((s) => (
              <motion.span key={s} className="skill-chip" variants={fadeUp}>{s}</motion.span>
            ))}
          </motion.div>
        </div>

        <div className="section-divider-line" />

        {/* ── PROJECTS ── */}
        <section className="section" id="work">
          <Reveal><div className="section-label">Selected work</div></Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-title" style={{ marginBottom: '52px' }}>Things I've built.</h2>
          </Reveal>

          <motion.div className="projects-grid"
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-5%' }}
            variants={staggerChildren}
          >
            {projectData.map((p) => (
              <motion.div key={p.id} variants={fadeUp}>
                <TiltCard
                  className="project-card"
                  onClick={() => setActiveProject(p)}
                >
                  <div className="project-card-top">
                    <span className="project-num">{p.num}</span>
                    <span className="project-arrow">↗</span>
                  </div>
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.desc}</p>
                  <div className="project-tags">
                    {p.tags.slice(0, 4).map((t) => <span key={t} className="project-tag">{t}</span>)}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <div className="section-divider-line" />

        {/* ── TIMELINE ── */}
        <TimelineSection />

        <div className="section-divider-line" />

        {/* ── PRINCIPLES (withhoney style) ── */}
        <PrinciplesSection />

        <div className="section-divider-line" />

        <section className="section" id="contact" ref={contactRef}>
          <div className="contact-top-blend" />
          <div className="contact-bottom-blend" />
          <div className="contact-container-interactive">
            <Reveal><div className="section-label">Get in touch</div></Reveal>

          <div className="contact-grid">
            <div>
              <Reveal delay={0.05}>
                <h2 className="contact-headline">Let's<br />connect.</h2>
                <p className="contact-sub">
                  Whether you want to collaborate on a project, talk about AI, or just say
                  hi — I'd love to hear from you.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="social-links">
                  {[
                    { label: 'GitHub', href: 'https://github.com/sarthaxmehta', icon: 'GH' },
                    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sarthak-mehta-698457310/', icon: 'in' },
                    { label: 'sarthakm.cs.24@nitj.ac.in', href: 'mailto:sarthakm.cs.24@nitj.ac.in', icon: '@' },
                  ].map((s) => (
                    <a key={s.label} href={s.href}
                      target={s.href.startsWith('mailto') ? undefined : '_blank'}
                      rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                      className="social-link" data-hover="true"
                    >
                      <span className="social-icon" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{s.icon}</span>
                      {s.label}
                    </a>
                  ))}
                </div>

                <div style={{ marginTop: '48px' }}>
                  <div className="section-label" style={{ marginBottom: '24px' }}>FAQ</div>
                  <FaqSection />
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="contact-form">
                {submitStatus ? (
                  <div className="success-state">
                    <div className="success-icon">✓</div>
                    <div className="success-title">Message received.</div>
                    <p className="success-body">
                      Thanks, {formData.name}. I'll get back to you at{' '}
                      <strong style={{ color: 'var(--text-1)' }}>{formData.email}</strong> soon.
                    </p>
                    <button className="btn-secondary" style={{ marginTop: '8px' }} data-hover="true"
                      onClick={() => { setSubmitStatus(null); setFormData({ name: '', email: '', company: '', budget: 'Just saying hello 👋', timeline: 'Developer / Engineer', message: '' }); }}
                    >
                      Send another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input type="text" required value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="form-input" placeholder="Your name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input type="email" required value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="form-input" placeholder="your@email.com" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Organization / School</label>
                      <input type="text" value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="form-input" placeholder="Where are you from? (optional)" />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Reason for reaching out</label>
                        <select value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="form-select"
                        >
                          <option>Just saying hello 👋</option>
                          <option>Technical collaboration 🤝</option>
                          <option>NIT Jalandhar discussion 🎓</option>
                          <option>General Q&A or chat 💻</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Your affiliation</label>
                        <select value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          className="form-select"
                        >
                          <option>Developer / Engineer</option>
                          <option>Researcher / Student</option>
                          <option>Recruiter / Tech Manager</option>
                          <option>Tech Enthusiast</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea required rows={5} value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="form-textarea" placeholder="What's on your mind?" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="form-submit" data-hover="true">
                      {isSubmitting ? 'Sending…' : 'Send message →'}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

        {/* ── FOOTER ── */}
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
                  <a key={l.label} href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="footer-link" data-hover="true"
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
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
    </>
  );
}
