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
  stagger,
  animate,
} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Import Database Server Actions
import { getProjects } from '../actions/project';
import { submitInquiry } from '../actions/inquiry';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const skills = [
  'Next.js', 'React', 'TypeScript', 'Python',
  'FastAPI', 'PyTorch', 'TensorFlow', 'Prisma',
  'Google Earth Engine', 'SQLite', 'C++', 'Electron',
];

const projects = [
  {
    num: '[01]',
    title: 'ChiefOS',
    detail:
      'Built a premium AI Operating System with a multi-engine intelligence architecture (Intent, Scheduling, Risk, Memory Engines). Powered by Gemini 2.5 Flash for executive-level daily briefings.',
    tags: ['Next.js', 'Gemini AI', 'Prisma', 'SQLite', 'TypeScript'],
    url: 'https://github.com/sarthaxmehta/ChiefOS',
  },
  {
    num: '[02]',
    title: 'UrbanNet',
    detail:
      'End-to-end geospatial AI pipeline extracting building footprints from Sentinel-2 imagery. Random Forest at 93.7% accuracy + custom U-Net for pixel-level delineation.',
    tags: ['PyTorch', 'U-Net', 'Google Earth Engine', 'QGIS', 'NumPy'],
    url: 'https://github.com/sarthaxmehta/UrbanNet',
  },
  {
    num: '[03]',
    title: 'Vital Archive',
    detail:
      'Automated ingestion pipeline extracting structured data from lab PDFs via Gemini 2.5. Semantic normalizer for biomarker names + analytics dashboard with longitudinal trend analysis.',
    tags: ['FastAPI', 'Next.js', 'Gemini AI', 'Sentence Transformers', 'Recharts'],
    url: 'https://github.com/sarthaxmehta/Vital-Archive',
  },
  {
    num: '[04]',
    title: 'Zenvvy',
    detail:
      'Full-stack POS, KDS, table management and inventory system packaged as a native desktop app via Electron. Runs 100% offline with local SQLite. Built for NIT Jalandhar.',
    tags: ['Next.js', 'Electron', 'Prisma', 'SQLite', 'React'],
    url: 'https://github.com/sarthaxmehta/Zenvvy',
  },
];

const howWork = [
  {
    num: '01',
    title: 'One Problem',
    desc: "I DON'T SOLVE PROBLEMS. I OVERWHELM THEM. I FOCUS ON THE BIGGEST WOLF PLAGUING YOUR PROJECT AND THROW ALL OF MY RESOURCES, EXPERTISE AND CREATIVE POWERS AT TAKING IT DOWN.",
  },
  {
    num: '02',
    title: 'Two Weeks',
    desc: "LIKE DEV TEAMS, I WORK IN FOCUSED TWO-WEEK SPRINTS. ONCE I'VE HONED IN ON A PROBLEM, I SPEND TWO WEEKS SOLVING IT. THEN, I MOVE ON TO THE NEXT.",
  },
  {
    num: '03',
    title: 'Three People',
    desc: 'EVERY PROJECT INVOLVES THREE KEY STAKEHOLDERS: YOU, THE PROBLEM, AND ME. I STAY EMBEDDED IN YOUR VISION, ACT AS A TECHNICAL PARTNER, AND MOVE AT STARTUP SPEED.',
  },
];

const sprintPhases = [
  {
    label: 'Phase 01: The Discovery',
    number: '01. The Discovery',
    desc: 'WE DIG DEEP INTO THE PROBLEM SPACE. I UNDERSTAND YOUR TECH STACK, YOUR USERS, AND YOUR VISION. NO CODE WRITTEN UNTIL THE PROBLEM IS FULLY UNDERSTOOD.',
    color: '#c8a850',
  },
  {
    label: 'Phase 02: The Silence',
    number: '02. The Silence',
    desc: 'HEADS DOWN. NOSE TO THE GRINDSTONE. THE ARCHITECTURE IS DESIGNED, THE CODE IS WRITTEN, AND THE SYSTEM TAKES SHAPE. RAPID ITERATION, ZERO NOISE.',
    color: '#e8c84a',
  },
  {
    label: 'Phase 03: The Exhibition',
    number: '03. The Exhibition',
    desc: 'I PRESENT THE WORK. YOU LIVE WITH IT. TEST IT. BREAK IT. EVERY GREAT SYSTEM WORTH ITS WEIGHT MAKES PIVOTS — AND I ALWAYS ANSWER THE DOOR.',
    color: '#50c878',
  },
  {
    label: 'Phase 04: The Alterations',
    number: '04. The Alterations',
    desc: 'BASED ON YOUR FEEDBACK, WE REFINE AND POLISH. THE FINAL PRODUCT IS SHIPPED WITH CONFIDENCE — DOCUMENTED, OPTIMIZED, AND READY FOR SCALE.',
    color: '#5a8fc8',
  },
];

const rules = [
  { num: '001.', text: 'Ship things that matter.' },
  { num: '002.', text: 'Have a point of view.' },
  { num: '003.', text: 'Take no shortcuts.' },
  { num: '004.', text: 'Be original.' },
  { num: '005.', text: "If you can't be original, be better than original." },
  { num: '006.', text: "Don't ship junk." },
  { num: '007.', text: "Move at startup speed even if you aren't one." },
  { num: '008.', text: 'Every pixel is a decision. Make it count.' },
  { num: '009.', text: 'The best documentation is working code.' },
  { num: '010.', text: 'Solve the hardest problem first.' },
];

const faqs = [
  {
    q: 'What kind of projects do you take on?',
    a: 'Full-stack web applications, AI/ML pipelines, geospatial intelligence systems, desktop apps, and anything that involves solving a genuinely hard engineering problem with a clean, premium product.',
  },
  {
    q: 'What technologies do you specialize in?',
    a: "Next.js, React, TypeScript, Python, FastAPI, PyTorch, Prisma, and the Google AI ecosystem. I'm also deeply experienced in geospatial tooling — Google Earth Engine, QGIS, and satellite imagery processing.",
  },
  {
    q: 'Are you available for internships or full-time roles?',
    a: "Yes. I'm currently a 2nd-year student at NIT Jalandhar (B.Tech, 2024–2028) and actively seeking internships in software engineering, AI/ML, and product development.",
  },
  {
    q: "What's the fastest way to reach you?",
    a: "Drop me a message at sarthakm.cs.24@nitj.ac.in — I respond fast. You can also connect on LinkedIn or check out my GitHub to see the work first.",
  },
  {
    q: 'Do you work on AI/ML projects specifically?',
    a: "Absolutely. AI is at the core of most of my recent work — from LLM-powered OS systems to deep learning segmentation models and semantic NLP pipelines. If there's an AI angle, I'm interested.",
  },
];

/* ─────────────────────────────────────────────
   PROJECT DETAILED SCHEMAS & SIMULATOR LOGS
───────────────────────────────────────────── */

const projectTechOverlays: Record<string, {
  architecture: string;
  contributions: string[];
  challenges: string;
  logs: string[];
}> = {
  'ChiefOS': {
    architecture: 'Next.js 16 (App Router) + SQLite + Prisma ORM + Groq Llama 3.3 + Gemini 2.5 Flash / Gemma 4.',
    contributions: [
      'Designed multi-engine AI scheduler orchestrator (Intent, Scheduling, Risk, Memory Engines).',
      'Built deterministic timezone offsets algorithm resolving LLM UTC outputs to local user time.',
      'Created high-capacity fallback pipeline switching query workloads seamlessly under rate limits.'
    ],
    challenges: 'Bridging the gap between unpredictable model completions and strict database transactions. Resolved by building Zod-based parser engines that validate LLM inputs synchronously before execution.',
    logs: [
      'INITIALIZING CHIEF_OS ORCHESTRATION LAYER...',
      'CONNECTING SQLite LOCAL STORAGE: dev.db... OK',
      'INTENT_ENGINE: LOADING SCHEMA RULES... OK',
      'SCHEDULER: MAPPING FOCUS BUFFERS... OK',
      'SYSTEM STATUS: ONLINE // CHIEF_ENGINE ENGAGED'
    ]
  },
  'UrbanNet': {
    architecture: 'PyTorch (Custom U-Net ConvNet) + Google Earth Engine API + QGIS + NumPy + Rasterio.',
    contributions: [
      'Engineered cloud-based multispectral composite feature engineering workflows (NDVI, NDWI, NDBI, GLCM).',
      'Trained Random Forest ensemble baseline achieving 93.7% accuracy (Kappa 0.91+).',
      'Built PyTorch semantic segmentation pipeline delineating high-resolution structural boundaries.'
    ],
    challenges: 'Data pipe transition from cloud GEE raster blocks down to local PyTorch tensor arrays without geo-spatial metadata loss. Solved by custom raster block mapping using python Rasterio.',
    logs: [
      'COPERNICUS/S2_SR COMPOSITING Delhi_NCR... OK',
      'COMPUTING GLCM SPATIAL TEXTURES... DONE',
      'RUNNING RANDOM FOREST ENSEMBLE... ACCURACY: 93.7%',
      'PYTORCH_UNET: PROCESSING 897 IMAGERY PATCHES...',
      'VECTORIZING IN QGIS: SHAPEFILE GENERATED.'
    ]
  },
  'Vital Archive': {
    architecture: 'Python (FastAPI) + Next.js + SQLite + SQLAlchemy + Sentence Transformers + Gemini AI.',
    contributions: [
      'Created automated medical lab PDF parser extracting matrices via pdfplumber and Gemini extraction.',
      'Developed semantic normalization pipeline running local Sentence Transformers vector embeddings.',
      'Built interactive React charts tracing historical biomarker trends over time.'
    ],
    challenges: 'Resolving variation in biomarker naming (e.g. "Hgb", "Hemoglobin", "HGB total") across different clinics. Solved by mapping test names into high-dimensional vector spaces and computing cosine similarities against canonical lists.',
    logs: [
      'STARTING FASTAPI REST SERVER... PORT 8000 OK',
      'PDFPLUMBER: PARSING UPLOADED DOCUMENT MATRIX...',
      'EXTRACTING STRUCTURED SCHEMAS VIA GEMINI LITE... DONE',
      'SEMANTIC SEARCH: normalizer models loaded... OK',
      'NORMALIZING DISPARATE TEST NAMES against canonical dict...'
    ]
  },
  'Zenvvy': {
    architecture: 'Next.js App Router + React 19 + Electron Container + Prisma ORM + SQLite.',
    contributions: [
      'Built POS, kitchen display system (KDS), and inventory tracker running 100% offline.',
      'Integrated simulated, passwordless authentication using React session persistence.',
      'Created bundle configurations for packaging database runtimes inside macOS & Windows installers.'
    ],
    challenges: 'Ensuring Next.js Server Actions and Prisma SQLite client paths resolve correctly in a packaged offline desktop container on both macOS and Windows. Resolved via custom native node module bundling and relative path overrides.',
    logs: [
      'BOOTING ELECTRON SHELL... WINDOW CREATED',
      'SPAWNING OFFLINE NEXTJS CORE PROTOCOL...',
      'RESOLVING LOCAL SQLite PATH IN PRODUCTION... OK',
      'SIMULATION_CONTEXT: LOADING STUDENT SESSION... SUCCESS',
      'KITCHEN DISPLAY ACTIVE // TABLE CHANNELS VERIFIED'
    ]
  },
  'AgriMarket Profit Optimizer': {
    architecture: 'Python + FastAPI + Next.js + Geopy API + Pandas.',
    contributions: [
      'Created logic engine processing 325 agricultural commodities with distance mapping.',
      'Integrated Geopy to dynamically compute transport costs and determine net profit margins.'
    ],
    challenges: 'Real-time computation of geographical distance and logistics deductions across large agricultural datasets. Optimized using caching layers.',
    logs: [
      'PARSING COMMODITY DATASET... 325 ITEMS LOGGED',
      'GEOPY: CONNECTING NOMINATIM GEOLOCATOR...',
      'CALCULATING TRANSPORTATION LOGISTICS COSTS...',
      'MAP REDUCE NET PROFIT OPTIMIZATION... COMPLETE'
    ]
  }
};

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */

const fadeUp: any = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerChildrenFast = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ─────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────── */

function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springX = useSpring(cursorX, { stiffness: 350, damping: 25 });
  const springY = useSpring(cursorY, { stiffness: 350, damping: 25 });

  const dotX = useSpring(cursorX, { stiffness: 900, damping: 30 });
  const dotY = useSpring(cursorY, { stiffness: 900, damping: 30 });

  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    const checkPointer = () => {
      const el = document.elementFromPoint(cursorX.get(), cursorY.get());
      setIsPointer(
        !!el && (
          getComputedStyle(el).cursor === 'pointer' ||
          el.closest('a, button, [data-cursor-pointer], .console-cabinet-card, select, input, textarea') !== null
        )
      );
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mousemove', checkPointer);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousemove', checkPointer);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* outer glowing target ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          width: isPointer ? 44 : 28,
          height: isPointer ? 44 : 28,
          borderRadius: '50%',
          border: '1.5px solid rgba(255, 76, 36, 0.65)',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: isPointer ? '0 0 15px rgba(255, 76, 36, 0.4)' : 'none',
        }}
        animate={{
          scale: isPointer ? 1.25 : 1,
          borderColor: isPointer ? 'rgba(36, 219, 255, 0.8)' : 'rgba(255, 76, 36, 0.65)',
          boxShadow: isPointer ? '0 0 15px rgba(36, 219, 255, 0.4)' : 'none',
        }}
        transition={{ duration: 0.2 }}
      />
      {/* inner glow dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: '#ff4c24',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 0 8px #ff4c24',
        }}
        animate={{
          backgroundColor: isPointer ? '#24dbff' : '#ff4c24',
          boxShadow: isPointer ? '0 0 8px #24dbff' : '0 0 8px #ff4c24',
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   SCROLL REVEAL WRAPPER
───────────────────────────────────────────── */

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
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   WORD-BY-WORD TEXT REVEAL
───────────────────────────────────────────── */

function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  staggerDelay = 0.035,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });
  const words = text.split(' ');

  return (
    <span ref={ref} className={className} style={{ display: 'block' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '105%', opacity: 0 }}
            animate={
              inView
                ? { y: 0, opacity: 1 }
                : { y: '105%', opacity: 0 }
            }
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * staggerDelay,
            }}
          >
            {word}
            {i < words.length - 1 ? '\u00a0' : ''}
          </motion.span>
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────── */

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
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: width / speed,
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SPRINT SECTION
───────────────────────────────────────────── */

function SprintSection() {
  const [active, setActive] = useState(0);
  const phase = sprintPhases[active];

  return (
    <section style={{ paddingBottom: '100px' }}>
      <Reveal>
        <div
          className="section-header"
          style={{ padding: '20px 60px 0', marginBottom: '0' }}
        >
          <span className="section-counter">[ 06 / 07 ]</span>
          <span className="section-label">HOW I SPRINT</span>
        </div>
      </Reveal>
      <div className="sprint-inner">
        <div className="sprint-left">
          {sprintPhases.map((p, i) => (
            <motion.div
              key={i}
              className={`sprint-phase-item${active === i ? ' active' : ''}`}
              onClick={() => setActive(i)}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="sprint-phase-dot"
                animate={{ background: active === i ? p.color : '#2a2a2a' }}
                transition={{ duration: 0.4 }}
              />
              <span className="sprint-phase-label">{p.label}</span>
            </motion.div>
          ))}
        </div>
        <div className="sprint-right">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sprint-phase-number">{phase.number}</div>
              <div className="sprint-phase-desc-box">
                <p className="sprint-phase-desc">{phase.desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FAQ
───────────────────────────────────────────── */

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {faqs.map((item, i) => (
        <Reveal key={i} delay={i * 0.05}>
          <div className={`faq-item${open === i ? ' open' : ''}`}>
            <div
              className="faq-question"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{item.q}</span>
              <motion.span
                className="faq-toggle"
                animate={{ rotate: open === i ? 45 : 0 }}
                transition={{ duration: 0.3 }}
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
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingTop: '16px' }}>{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO PARALLAX HOOK
───────────────────────────────────────────── */

function HeroImage() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.div
      ref={ref}
      className="hero-image-container"
      style={{ y, opacity }}
    >
      <div className="hero-image-backdrop" />
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <Image
          src="/hero-visual.png"
          alt="3D honeycomb sculpture"
          width={500}
          height={500}
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }}
          priority
        />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [projectData, setProjectData] = useState<any[]>([]);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [timeStr, setTimeStr] = useState('19:40:30');
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  
  // Inquiry form states
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    company: '',
    budget: 'Just saying hello 👋',
    timeline: 'Developer / Engineer',
    message: '',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<{
    success?: boolean;
    inquiryId?: string;
  } | null>(null);

  // System status animations for terminal HUD
  const [hudMessage, setHudMessage] = useState('INTENT_AGENT: STANDBY');

  useEffect(() => {
    setMounted(true);
    // Hide default cursor
    document.body.style.cursor = 'none';

    // Fetch dynamic project list
    const fetchProj = async () => {
      try {
        const res = await getProjects();
        if (res.success && res.projects) {
          const mapped = res.projects.map((p: any, i: number) => ({
            num: `[0${i + 1}]`,
            title: p.title,
            detail: p.description,
            tags: p.tags.split(','),
            url: p.githubUrl || p.projectUrl || 'https://github.com/sarthaxmehta',
          }));
          setProjectData(mapped);
        } else {
          setProjectData(projects);
        }
      } catch (e) {
        setProjectData(projects);
      }
    };
    fetchProj();

    // System clock timer
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    // Mouse movement tracker
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Dynamic HUD terminal logger messages
    const hudMessages = [
      'SYS_AGENTS: POLLING CHIEF_OS PROCESSES... [OK]',
      'GEOSPATIAL: COMPUTING SENTINEL-2 NDVI CHANNELS... [OK]',
      'VITAL_ARCHIVE: RUNNING VECTOR SEMANTIC MAPPER... [OK]',
      'INTENT_AGENT: READY FOR USER INQUIRY...',
      'SYSTEM STATUS: ONLINE // MEHTA_OS ACTIVE'
    ];
    let msgIdx = 0;
    const hudInterval = setInterval(() => {
      setHudMessage(hudMessages[msgIdx]);
      msgIdx = (msgIdx + 1) % hudMessages.length;
    }, 4500);

    return () => {
      document.body.style.cursor = '';
      clearInterval(timer);
      clearInterval(hudInterval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* BACKGROUND GRAPHIC HUD CONSOLE */}
      <div className="console-grid-bg" />
      <div className="ambient-glow-orb" style={{ top: '10%', left: '5%', background: 'var(--glow-orange)' }} />
      <div className="ambient-glow-orb" style={{ top: '50%', right: '5%', background: 'var(--glow-purple)' }} />

      {/* INTERACTIVE MOUSE SPOTLIGHT OVERLAY */}
      {mounted && (
        <div 
          className="mouse-spotlight" 
          style={{ 
            left: mousePos.x, 
            top: mousePos.y 
          }} 
        />
      )}

      {/* CUSTOM CURSOR */}
      {mounted && <CustomCursor />}

      {/* FLOATING CAPSULE NAVIGATION (DYNAMIC ISLAND) */}
      <motion.nav
        className="nav-capsule"
        initial={{ opacity: 0, y: -20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      >
        <Link href="/" className="nav-capsule-brand">
          <span>sarthak</span>
          <span className="nav-capsule-dot" />
          <span className="nav-capsule-year">2026</span>
        </Link>
        <div className="nav-capsule-links">
          <a href="#about" className="nav-capsule-link">About</a>
          <a href="#work" className="nav-capsule-link">Work</a>
          <a href="#contact" className="nav-capsule-link">Connect</a>
          <Link href="/manager" className="nav-capsule-link admin">Console</Link>
        </div>
        <a href="#contact" className="nav-capsule-cta">
          CONNECT
        </a>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="hero" style={{ height: '100vh', minHeight: '750px', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <HeroImage />
        
        {/* HUD Frame Corner Sight Crosshairs */}
        <div className="hud-corner-crosshair top-left" />
        <div className="hud-corner-crosshair top-right" />
        <div className="hud-corner-crosshair bottom-left" />
        <div className="hud-corner-crosshair bottom-right" />

        {/* Floating OS Console HUD Frame in Hero */}
        <div style={{ position: 'absolute', top: '100px', left: '50px', right: '50px', zIndex: 1, pointerEvents: 'none' }} className="inquiry-grid-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            {/* Top Left: System info */}
            <div className="hud-frame" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.4)', background: 'rgba(5, 5, 5, 0.45)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#50c878', display: 'inline-block', boxShadow: '0 0 8px #50c878' }}></span>
              <span>SYS_KERNEL // ONLINE</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>DB_SYNC: SQLite_LOCAL</span>
            </div>

            {/* Top Right: System Clock */}
            <div className="hud-frame" style={{ padding: '8px 16px', fontSize: '10px', fontFamily: 'var(--mono)', color: 'rgba(255, 255, 255, 0.8)', background: 'rgba(5, 5, 5, 0.45)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span>TIME // {timeStr}</span>
            </div>
          </div>
        </div>

        <div className="hero-text" style={{ paddingBottom: '6vh', zIndex: 2 }}>
          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          >
            Build things that <span className="text-gradient-neon" style={{ fontWeight: 800 }}>matter</span>.<br />
            Ship them <span className="text-gradient-neon-cyan" style={{ fontWeight: 800 }}>fast</span>.
          </motion.h1>

          {/* Simulated HUD Typewriter prompt */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px' }}>
            <div className="hud-frame" style={{ padding: '10px 24px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(5, 5, 5, 0.45)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: 'var(--accent)' }}>&gt;</span>
              <span>{hudMessage}</span>
              <span className="terminal-cursor"></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SKILLS MARQUEE ── */}
      <motion.div
        className="partners"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        <p className="partners-label">TECHNOLOGIES &amp; TOOLS</p>
        <div className="partners-logos" style={{ overflow: 'hidden', position: 'relative' }}>
          <Marquee speed={55}>
            {skills.map((s) => (
              <motion.span
                key={s}
                className="partner-logo"
                style={{ paddingRight: '48px' }}
                whileHover={{ opacity: 0.85 }}
              >
                {s}
              </motion.span>
            ))}
          </Marquee>
        </div>
      </motion.div>

      {/* ── DARK ROUNDED CONTAINER ── */}
      <div className="dark-container">

        {/* ── BENTO GRID CONSOLE (ABOUT / SERVICES / PROCESS) ── */}
        <section style={{ padding: '80px 60px 40px' }} id="about">
          <Reveal>
            <div className="section-header" style={{ padding: '0', marginBottom: '40px' }}>
              <span className="section-counter">[ 02 / 07 ]</span>
              <span className="section-label">OPERATOR // ARCHITECTURE</span>
            </div>
          </Reveal>

          <div className="bento-grid">
            {/* Card 1: First Person Introduction (span 2) */}
            <div className="bento-card bento-span-2 liquid-glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
              <div className="specular-glare" />
              <div>
                <span className="about-tag" style={{ background: 'rgba(255, 76, 36, 0.12)', border: '1px solid rgba(255, 76, 36, 0.25)', color: '#ff4c24', marginBottom: '16px' }}>
                  OPERATOR PROFILE // ACTIVE
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '12px', lineHeight: '1.2' }}>
                  I'm Sarthak Mehta.
                </h2>
                <h3 style={{ fontSize: '18px', fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: '8px', fontFamily: 'var(--mono)' }}>
                  Full-Stack Engineer &amp; AI Builder
                </h3>
                <p style={{ marginTop: '20px', fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7' }}>
                  I build end-to-end geospatial intelligence pipelines, premium AI-powered operating systems, and local-first desktop apps. I'm currently studying Computer Science at **Dr. B.R. Ambedkar National Institute of Technology Jalandhar (NITJ)**.
                </p>
                <p style={{ marginTop: '12px', fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7' }}>
                  I operate at startup speed, tackling the hardest technical problems first, and packing complex features into high-fidelity user interfaces.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                <a href="https://github.com/sarthaxmehta" target="_blank" rel="noopener noreferrer" className="glass-capsule capsule-glow-orange" style={{ padding: '10px 20px', fontSize: '12px', textDecoration: 'none' }}>
                  View Github ↗
                </a>
                <a href="#contact" className="glass-capsule capsule-glow-cyan" style={{ padding: '10px 20px', fontSize: '12px', textDecoration: 'none' }}>
                  Get In Touch ↗
                </a>
              </div>
            </div>

            {/* Card 2: Interactive Tech Stack Matrix (span 1) */}
            <div className="bento-card liquid-glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="specular-glare" />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                TECH_STACK // LOADED
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {skills.map((s) => {
                  // Determine glow colors for tags
                  let colorClass = 'capsule-glow-orange';
                  if (['PyTorch', 'TensorFlow', 'Google Earth Engine'].includes(s)) colorClass = 'capsule-glow-green';
                  else if (['FastAPI', 'TypeScript', 'Electron'].includes(s)) colorClass = 'capsule-glow-cyan';
                  else if (['React', 'Next.js'].includes(s)) colorClass = 'capsule-glow-orange';
                  else colorClass = 'capsule-glow-purple';

                  return (
                    <span
                      key={s}
                      className={`glass-capsule ${colorClass}`}
                      style={{ padding: '6px 14px', fontSize: '11px', display: 'inline-flex', cursor: 'default' }}
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Card 3: What I Build (span 1) */}
            <div className="bento-card liquid-glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="specular-glare" />
              <div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                  SERVICES // SYSTEM_SCOPES
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginTop: '16px', letterSpacing: '-0.01em' }}>
                  Dynamic Development
                </h3>
                <p style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                  I write clean code and build responsive, accessible layouts, robust FastAPI backends, semantic indexing engines, local-first Electron wrappers, and geospatial calculations.
                </p>
              </div>
            </div>

            {/* Card 4: Operating Sprint Loop (span 2) */}
            <div className="bento-card bento-span-2 liquid-glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
              <div className="specular-glare" />
              <div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                  WORK_PROCESS // TWO_WEEK_SPRINT_CYCLE
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '20px' }} className="inquiry-grid-form">
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>01 / DISCOVERY</div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', lineHeight: '1.5' }}>
                      Deep dive into technical parameters, databases, user needs, and architectural boundaries.
                    </p>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#e8c84a', fontWeight: 'bold' }}>02 / BUILD</div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', lineHeight: '1.5' }}>
                      Heads-down rapid iteration. Coding deterministic algorithms, structuring DB tables, designing high-fidelity glass UI elements.
                    </p>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#50c878', fontWeight: 'bold' }}>03 / SHIP</div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', lineHeight: '1.5' }}>
                      Publishing optimized builds to production. Verification audits, code handoffs, and operational refinement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SELECTED WORK ── */}
        <section className="projects-section" id="work">
          <Reveal>
            <div className="section-header" style={{ padding: '0 60px', marginBottom: '40px' }}>
              <span className="section-counter">[ 04 / 07 ]</span>
              <span className="section-label">SELECTED WORK</span>
            </div>
          </Reveal>

          {/* Interactive Project Console */}
          <div className="project-cards-area" style={{ padding: '0 60px 80px' }}>
            <div className="project-console-grid">

              {/* Left Column: Project Selector Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {projectData.length === 0 ? (
                  <div className="hud-frame" style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                    CONNECTING PORTFOLIO DATABASE ENGINE...
                  </div>
                ) : (
                  projectData.map((p, idx) => {
                    const isActive = activeProjectIndex === idx;
                    // Deterministic glow theme color class based on title
                    let activeClass = 'active-orange';
                    if (p.title === 'ChiefOS') activeClass = 'active-orange';
                    else if (p.title === 'UrbanNet') activeClass = 'active-green';
                    else if (p.title === 'Vital Archive') activeClass = 'active-purple';
                    else if (p.title === 'Zenvvy') activeClass = 'active-cyan';

                    return (
                      <div
                        key={p.title}
                        className={`console-cabinet-card ${isActive ? activeClass : ''}`}
                        onClick={() => setActiveProjectIndex(idx)}
                      >
                        <div className="specular-glare" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)' }}>
                            {p.num || `[0${idx + 1}]`}
                          </span>
                          {isActive && (
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', color: 'var(--white)' }}>
                              RUNNING_SESSION
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {p.title}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '16px' }}>
                          {p.detail}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {p.tags.map((t: string) => (
                            <span key={t} className="project-tag" style={{ fontSize: '9px', padding: '3px 8px' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Dynamic Terminal System Details */}
              {projectData.length > 0 && (
                <div className="hud-frame" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '520px' }}>
                  {/* Console Header */}
                  <div className="hud-header">
                    <div className="hud-dot-group">
                      <span className="hud-dot red" />
                      <span className="hud-dot yellow" />
                      <span className="hud-dot green" />
                    </div>
                    <span>TERMINAL // {projectData[activeProjectIndex]?.title.toUpperCase()}_SYS</span>
                    <span style={{ color: '#50c878' }}>● ONLINE</span>
                  </div>

                  {/* Terminal Log Console */}
                  <div className="terminal-scroll-panel" style={{ flex: '1', background: '#050505', padding: '24px', overflowY: 'auto' }}>
                    <div className="terminal-prompt" style={{ marginBottom: '8px' }}>load_tech_profile --target={projectData[activeProjectIndex]?.title.toLowerCase()}</div>
                    <div style={{ margin: '8px 0 16px' }}>
                      {(projectTechOverlays[projectData[activeProjectIndex]?.title] || { logs: [] }).logs.map((logLine, idx) => (
                        <div key={idx} className="terminal-output" style={{ fontSize: '11px', opacity: 0.9, fontFamily: 'var(--mono)', marginBottom: '3px' }}>
                          &gt; {logLine}
                        </div>
                      ))}
                    </div>

                    <div className="rules-divider" style={{ margin: '16px 0' }} />

                    {/* Architecture Details */}
                    <div style={{ marginBottom: '18px' }}>
                      <span style={{ color: '#e8c84a', fontWeight: 'bold', fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase' }}>[SYSTEM ARCHITECTURE]</span>
                      <p style={{ marginTop: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>
                        {(projectTechOverlays[projectData[activeProjectIndex]?.title] || { architecture: '' }).architecture}
                      </p>
                    </div>

                    {/* Key Contributions */}
                    <div style={{ marginBottom: '18px' }}>
                      <span style={{ color: '#5a8fc8', fontWeight: 'bold', fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase' }}>[KEY CONTRIBUTIONS]</span>
                      <ul style={{ marginTop: '8px', paddingLeft: '16px', listStyleType: 'square', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
                        {(projectTechOverlays[projectData[activeProjectIndex]?.title] || { contributions: [] }).contributions.map((cLine, idx) => (
                          <li key={idx} style={{ marginBottom: '6px' }}>{cLine}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Engineering Challenge */}
                    <div style={{ marginBottom: '18px' }}>
                      <span style={{ color: '#e05a4e', fontWeight: 'bold', fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase' }}>[ENGINEERING CHALLENGE]</span>
                      <p style={{ marginTop: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
                        {(projectTechOverlays[projectData[activeProjectIndex]?.title] || { challenges: '' }).challenges}
                      </p>
                    </div>

                    {/* Action buttons inside terminal */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                      <a
                        href={projectData[activeProjectIndex]?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-capsule capsule-glow-orange"
                        style={{ padding: '8px 18px', fontSize: '11px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Source Code ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── EDUCATION ── */}
        <section className="edu-section">
          <Reveal>
            <div className="section-header" style={{ padding: '0', marginBottom: '48px' }}>
              <span className="section-counter">[ 05 / 07 ]</span>
              <span className="section-label">EDUCATION &amp; CERTS</span>
            </div>
          </Reveal>
          <motion.div
            className="edu-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-5%' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {[
              {
                label: 'B.Tech Computer Science',
                title: 'NIT Jalandhar',
                sub: 'Dr. B.R. Ambedkar NIT · 2024–2028\nGPA: 8.63 / 10\nCore Member, E-Cell · Core Member, Q\'Mania Quantum Club',
              },
              {
                label: 'Experience',
                title: 'Remote Sensing & GIS Intern',
                sub: 'India Space Academy · Jan–Feb 2026\nBuilt a geospatial AI pipeline for building footprint extraction from Sentinel-2 imagery using PyTorch U-Net + GEE Random Forest.',
              },
              {
                label: 'Certification',
                title: 'Machine Learning Specialization',
                sub: 'Stanford Online & DeepLearning.AI\nAndrew Ng · Coursera',
              },
              {
                label: 'Certification',
                title: 'Meta Front-End Developer',
                sub: 'Professional Certificate\nMeta · Coursera',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="edu-card"
                variants={fadeUp}
                whileHover={{
                  borderColor: 'rgba(255,255,255,0.18)',
                  y: -4,
                  transition: { duration: 0.25 },
                }}
              >
                <div className="edu-card-label">{card.label}</div>
                <div className="edu-card-title">{card.title}</div>
                <div className="edu-card-sub" style={{ whiteSpace: 'pre-line' }}>{card.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── SPRINT ── */}
        <SprintSection />

        {/* ── PRINCIPLES ── */}
        <section className="rules-section">
          <Reveal>
            <div className="section-header" style={{ padding: '20px 60px 0', marginBottom: '0' }}>
              <span className="section-counter">[ 07 / 07 ]</span>
              <span className="section-label">PRINCIPLES</span>
            </div>
          </Reveal>

          <div className="rules-ticker" style={{ padding: '14px 0', overflow: 'hidden' }}>
            <Marquee speed={80}>
              <span className="rules-ticker-text">PRINCIPLES</span>
              <span className="rules-ticker-dot" style={{ padding: '0 32px', fontSize: 'clamp(52px,7vw,90px)', fontWeight: 900, color: '#e05a4e' }}>✦</span>
              <span className="rules-ticker-text">HOW I OPERATE</span>
              <span className="rules-ticker-dot" style={{ padding: '0 32px', fontSize: 'clamp(52px,7vw,90px)', fontWeight: 900, color: '#e05a4e' }}>✦</span>
              <span className="rules-ticker-text">PRINCIPLES</span>
              <span className="rules-ticker-dot" style={{ padding: '0 32px', fontSize: 'clamp(52px,7vw,90px)', fontWeight: 900, color: '#e05a4e' }}>✦</span>
              <span className="rules-ticker-text">HOW I OPERATE</span>
              <span className="rules-ticker-dot" style={{ padding: '0 32px', fontSize: 'clamp(52px,7vw,90px)', fontWeight: 900, color: '#e05a4e' }}>✦</span>
            </Marquee>
          </div>

          <div className="rules-body">
            <Reveal>
              <p className="rules-intro">
                At every great project, there&rsquo;s a set of operating principles that keep things from
                getting too out of hand. These are mine — forged from shipping real products, writing
                real code, and learning from engineers I deeply respect.
              </p>
            </Reveal>
            <div className="rules-divider" />
            <motion.ul
              className="rules-list"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-5%' }}
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {rules.map((r, i) => (
                <motion.li
                  key={r.num}
                  className="rules-list-item"
                  variants={fadeUp}
                  whileHover={{ color: 'rgba(255,255,255,0.9)', x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="rules-list-num">{r.num}</span>
                  {r.text}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* ── CONTACT / FAQ ── */}
        <section className="contact-section" id="contact">
          <div className="contact-inner">
            <Reveal>
              <div className="section-header" style={{ padding: '0', marginBottom: '48px' }}>
                <span className="section-counter">[ CONTACT ]</span>
                <span className="section-label">FAQ &amp; CONNECT</span>
              </div>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', maxWidth: '1200px', margin: '0 auto' }} className="inquiry-dual-layout">

              {/* Left Column: FAQ Accordion */}
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <SplitText
                    text="Let's connect and share ideas."
                    className="contact-headline"
                    staggerDelay={0.04}
                  />
                </div>
                <FaqSection />
              </div>

              {/* Right Column: Premium Liquid Glass Connect Console */}
              <div className="hud-frame liquid-glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="specular-glare" />

                {/* HUD form header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                    SECURE_CONNECT_DB_ENTRY_NODE
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#50c878' }}>
                    DB_SYNC: ACTIVE
                  </span>
                </div>

                {inquiryStatus ? (
                  /* Form Success State: Scrolling Terminal Outputs */
                  <div style={{ background: '#050505', borderRadius: '12px', padding: '20px', fontFamily: 'var(--mono)', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ color: '#e8c84a' }}>sarthak@mehta-os:~$ submit_connection --payload=json</span>
                      <span className="terminal-output">&gt; Resolving sqlite transaction client... OK</span>
                      <span className="terminal-output">&gt; Parsing Zod validation parameters... OK</span>
                      <span className="terminal-output">&gt; Executing DB insertion to table 'Inquiry'... OK</span>
                      <span className="terminal-output">&gt; Connection logged successfully!</span>
                      <div style={{ background: 'rgba(80, 200, 120, 0.08)', border: '1px dashed rgba(80, 200, 120, 0.3)', padding: '10px', margin: '8px 0', borderRadius: '6px', fontSize: '11px' }}>
                        <div style={{ color: '#50c878', fontWeight: 'bold' }}>TRANSACTION SUCCESSFUL</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Connection ID: {inquiryStatus.inquiryId}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)' }}>Timestamp: {new Date().toISOString()}</div>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>&gt; Thank you, {inquiryData.name}. I will review your connection parameters (Reason: {inquiryData.budget}, Affiliation: {inquiryData.timeline}) and respond to you at {inquiryData.email} within 24 hours.</span>
                    </div>
                    <button
                      className="glass-capsule capsule-glow-orange"
                      onClick={() => {
                        setInquiryStatus(null);
                        setInquiryData({
                          name: '',
                          email: '',
                          company: '',
                          budget: 'Just saying hello 👋',
                          timeline: 'Developer / Engineer',
                          message: '',
                        });
                      }}
                      style={{ alignSelf: 'flex-start', padding: '8px 20px', fontSize: '11px', marginTop: '16px' }}
                    >
                      Submit Another Message
                    </button>
                  </div>
                ) : (
                  /* Main Form State */
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!inquiryData.name || !inquiryData.email || !inquiryData.message) {
                      alert('Please complete all required fields (Name, Email, and Message).');
                      return;
                    }
                    setSubmittingInquiry(true);
                    try {
                      const res = await submitInquiry(inquiryData);
                      if (res.success) {
                        setInquiryStatus({
                          success: true,
                          inquiryId: res.inquiryId,
                        });
                      } else {
                        alert(res.error || 'Failed to submit connection.');
                      }
                    } catch (err: any) {
                      alert('An error occurred during submission.');
                    } finally {
                      setSubmittingInquiry(false);
                    }
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="inquiry-grid-form">
                      <div className="glass-input-container">
                        <label className="glass-input-label">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={inquiryData.name}
                          onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                          className="glass-input-field"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div className="glass-input-container">
                        <label className="glass-input-label">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={inquiryData.email}
                          onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                          className="glass-input-field"
                          placeholder="e.g. john@email.com"
                        />
                      </div>
                    </div>

                    <div className="glass-input-container">
                      <label className="glass-input-label">Affiliated Organization / School (Optional)</label>
                      <input
                        type="text"
                        value={inquiryData.company}
                        onChange={(e) => setInquiryData({ ...inquiryData, company: e.target.value })}
                        className="glass-input-field"
                        placeholder="e.g. NIT Jalandhar"
                      />
                    </div>

                    <div className="inquiry-grid-form">
                      <div className="glass-input-container">
                        <label className="glass-input-label">Reason for Connection</label>
                        <div className="glass-select-wrapper">
                          <select
                            value={inquiryData.budget}
                            onChange={(e) => setInquiryData({ ...inquiryData, budget: e.target.value })}
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
                            value={inquiryData.timeline}
                            onChange={(e) => setInquiryData({ ...inquiryData, timeline: e.target.value })}
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
                        rows={4}
                        value={inquiryData.message}
                        onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                        className="glass-input-field"
                        style={{ resize: 'vertical' }}
                        placeholder="What would you like to discuss? Project ideas, collaborations, or tech topics..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingInquiry}
                      className="glass-capsule capsule-glow-orange"
                      style={{ marginTop: '8px', width: '100%' }}
                    >
                      {submittingInquiry ? 'SENDING CONNECTION RECORD...' : 'EXECUTE DB WRITE TRANSACTION ↗'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <style jsx global>{`
            @media (max-width: 900px) {
              .inquiry-dual-layout {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          {/* Top bar — WHERE DO I CONNECT? + HERE button */}
          <Reveal>
            <div className="footer-connect-bar">
              <div className="footer-connect-label">WHERE DO I CONNECT?</div>
              <motion.a
                href="/connect"
                className="footer-here-btn"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                transition={{ duration: 0.2 }}
              >
                HERE ↗↗↗
              </motion.a>
            </div>
          </Reveal>

          {/* Giant "honey" wordmark */}
          <Reveal delay={0.05}>
            <div className="footer-wordmark-wrap">
              <div className="footer-wordmark">Sarthak Mehta</div>
            </div>
          </Reveal>

          {/* Bottom strip */}
          <Reveal delay={0.1}>
            <div className="footer-bottom">
              <span className="footer-copy">© 2025 Sarthak Mehta. All rights reserved.</span>
              <div className="footer-links">
                {[
                  { label: 'GitHub', href: 'https://github.com/sarthaxmehta' },
                  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sarthak-mehta-698457310/' },
                  { label: 'Email', href: 'mailto:sarthakm.cs.24@nitj.ac.in' },
                ].map((l) => (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={l.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    className="footer-link"
                    whileHover={{ color: 'rgba(255,255,255,0.9)' }}
                    transition={{ duration: 0.2 }}
                  >
                    {l.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </Reveal>
        </footer>
      </div>
    </>
  );
}
