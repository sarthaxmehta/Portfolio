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
   ANIMATION VARIANTS
───────────────────────────────────────────── */

const fadeUp = {
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

  const springX = useSpring(cursorX, { stiffness: 300, damping: 30 });
  const springY = useSpring(cursorY, { stiffness: 300, damping: 30 });

  const dotX = useSpring(cursorX, { stiffness: 900, damping: 35 });
  const dotY = useSpring(cursorY, { stiffness: 900, damping: 35 });

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
          el.closest('a, button, [data-cursor-pointer]') !== null
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
      {/* outer ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          width: isPointer ? 48 : 36,
          height: isPointer ? 48 : 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.45)',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
        }}
        animate={{
          scale: isPointer ? 1.3 : 1,
          opacity: isPointer ? 0.6 : 0.4,
        }}
        transition={{ duration: 0.2 }}
      />
      {/* inner dot */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'white',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
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
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ width: '100%', height: '100%' }}
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

  useEffect(() => {
    setMounted(true);
    // Hide default cursor
    document.body.style.cursor = 'none';
    return () => { document.body.style.cursor = ''; };
  }, []);

  return (
    <>
      {/* CUSTOM CURSOR */}
      {mounted && <CustomCursor />}

      {/* NAV */}
      <motion.nav
        className="nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      >
        <div className="nav-brand">
          <span className="nav-brand-name">sarthak—</span>
          <span className="nav-brand-year">©2025</span>
        </div>
        <div className="nav-links">
          <a href="mailto:sarthakm.cs.24@nitj.ac.in" className="nav-link">
            <span className="nav-link-dot" />
            sarthakm.cs.24@nitj.ac.in
          </a>
          <a
            href="https://github.com/sarthaxmehta"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="nav-link-dot" />
            GITHUB
          </a>
          <a
            href="https://www.linkedin.com/in/sarthak-mehta-698457310/"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="nav-link-dot" />
            LINKEDIN
          </a>
        </div>
        <motion.a
          href="mailto:sarthakm.cs.24@nitj.ac.in"
          className="nav-cta"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          HIRE ME
        </motion.a>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="hero">
        <HeroImage />
        <div className="hero-text">
          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          >
            Build things that matter.<br />Ship them fast.
          </motion.h1>
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

        {/* ── ABOUT ── */}
        <motion.section
          className="about"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6 }}
        >
          <Reveal>
            <span className="about-tag">ABOUT</span>
          </Reveal>

          <div className="about-text" style={{ overflow: 'hidden' }}>
            <SplitText
              text="Sarthak Mehta is a hyper-focused, full-stack engineer and AI builder who moves at startup speed from NIT Jalandhar."
              staggerDelay={0.032}
              delay={0.1}
            />
            <br />
            <SplitText
              text="He engineers geospatial intelligence pipelines, premium AI-powered systems, and products that feel as good as they perform."
              staggerDelay={0.03}
              delay={0.5}
            />
          </div>

          <Reveal delay={0.9}>
            <motion.a
              href="https://github.com/sarthaxmehta"
              target="_blank"
              rel="noopener noreferrer"
              className="outline-btn"
              whileHover={{ x: 6 }}
              transition={{ duration: 0.2 }}
            >
              SEE THE WORK <span className="outline-btn-icon">↗</span>
            </motion.a>
          </Reveal>
        </motion.section>

        {/* ── SERVICES ── */}
        <section className="services">
          <Reveal>
            <div className="section-header" style={{ padding: '0 60px', marginBottom: '0' }}>
              <span className="section-counter">[ 02 / 07 ]</span>
              <span className="section-label">WHAT I BUILD</span>
            </div>
          </Reveal>
          <div className="services-inner">
            <div className="services-left">
              <div>
                <Reveal>
                  <h2 className="services-headline">
                    I write, design and build for startups and enterprises.
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="services-body">
                    Full-stack systems that make your users feel something. AI pipelines that extract value
                    from raw data. Geospatial intelligence that turns satellite imagery into insight.
                    Desktop apps that work offline without compromise.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={0.2}>
                <motion.a
                  href="mailto:sarthakm.cs.24@nitj.ac.in"
                  className="outline-btn"
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  LET&rsquo;S TALK <span className="outline-btn-icon">↗</span>
                </motion.a>
              </Reveal>
            </div>
            <div className="services-right">
              <motion.ul
                className="services-list"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-10%' }}
                variants={staggerChildren}
              >
                {['Full-Stack Web', 'AI / ML Systems', 'Geospatial AI', 'Desktop Apps', 'Data Pipelines', 'UI/UX Design'].map(
                  (s, i) => (
                    <motion.li
                      key={s}
                      className={`services-list-item${i > 3 ? ' dim' : ''}`}
                      variants={fadeUp}
                      whileHover={i <= 3 ? { x: 12, color: '#ffffff' } : {}}
                      transition={{ duration: 0.25 }}
                    >
                      {s}
                    </motion.li>
                  )
                )}
              </motion.ul>
            </div>
          </div>
        </section>

        {/* ── HOW I WORK ── */}
        <section className="how-work">
          <Reveal>
            <div className="section-header" style={{ padding: '0 60px', marginBottom: '0' }}>
              <span className="section-counter">[ 03 / 07 ]</span>
              <span className="section-label">HOW I WORK</span>
            </div>
          </Reveal>
          <div className="how-work-items">
            {howWork.map((item, i) => (
              <Reveal key={item.num} delay={i * 0.12}>
                <motion.div
                  className="how-work-item"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.015)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="how-work-number">{item.num}</div>
                  <SplitText
                    text={item.title}
                    className="how-work-title"
                    staggerDelay={0.05}
                  />
                  <div className="how-work-divider" />
                  <p className="how-work-desc">{item.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── SELECTED WORK ── */}
        <section className="projects-section">
          <Reveal>
            <div className="section-header" style={{ padding: '0 60px', marginBottom: '0' }}>
              <span className="section-counter">[ 04 / 07 ]</span>
              <span className="section-label">SELECTED WORK</span>
            </div>
          </Reveal>

          {/* Ghost title background with parallax */}
          <div
            style={{
              position: 'relative',
              background: 'var(--black)',
              padding: '0',
              overflow: 'hidden',
              minHeight: '480px',
            }}
          >
            <div className="stars-bg" style={{ position: 'absolute', inset: 0, minHeight: '480px', zIndex: 0 }} />
            <Reveal>
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '80px 0 40px',
                  textAlign: 'center',
                }}
              >
                <div className="before-after-title">
                  <span>SELECTED</span>
                  <span>// WORK©</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="project-cards-area">
            <motion.div
              className="project-cards-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-5%' }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {projects.map((p) => (
                <motion.div
                  key={p.num}
                  className="project-card"
                  variants={fadeUp}
                  whileHover={{
                    y: -8,
                    borderColor: 'rgba(255,255,255,0.18)',
                    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                  }}
                >
                  <div className="project-card-number">{p.num}</div>
                  <h3 className="project-card-title">{p.title}</h3>
                  <p className="project-card-desc">{p.detail}</p>
                  <div className="project-card-tags">
                    {p.tags.map((t) => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>
                  <motion.a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card-link"
                    aria-label={`View ${p.title} on GitHub`}
                    whileHover={{ rotate: 15, scale: 1.15 }}
                    transition={{ duration: 0.2 }}
                  >
                    ↗
                  </motion.a>
                </motion.div>
              ))}
            </motion.div>
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
        <section className="contact-section">
          <div className="contact-inner">
            <Reveal>
              <div className="section-header" style={{ padding: '0', marginBottom: '48px' }}>
                <span className="section-counter">[ CONTACT ]</span>
                <span className="section-label">FAQ</span>
              </div>
            </Reveal>

            <SplitText
              text="Feeling ambitious? Let's build something."
              className="contact-headline"
              staggerDelay={0.04}
            />

            <br />
            <FaqSection />
          </div>
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
              <div className="footer-wordmark">honey</div>
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
