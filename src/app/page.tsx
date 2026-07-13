'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// ---------- DATA ----------

const skills = [
  'Next.js', 'React', 'TypeScript', 'Python',
  'FastAPI', 'PyTorch', 'TensorFlow', 'Prisma',
  'Google Earth Engine', 'SQLite', 'C++', 'Electron',
];

const projects = [
  {
    num: '[01]',
    title: 'ChiefOS',
    desc: 'AI Operating System acting as an Executive Chief of Staff',
    tags: ['Next.js', 'Gemini AI', 'Prisma', 'SQLite', 'TypeScript'],
    url: 'https://github.com/sarthaxmehta/ChiefOS',
    detail: 'Built a premium AI OS with a multi-engine intelligence architecture (Intent, Scheduling, Risk, and Memory Engines). Powered by Gemini 2.5 Flash for executive-level daily briefings and strategy recommendations.',
  },
  {
    num: '[02]',
    title: 'UrbanNet',
    desc: 'Geospatial AI pipeline for satellite imagery analysis',
    tags: ['PyTorch', 'U-Net', 'Google Earth Engine', 'QGIS', 'NumPy'],
    url: 'https://github.com/sarthaxmehta/UrbanNet',
    detail: 'End-to-end geospatial AI pipeline extracting building footprints from Sentinel-2 imagery. Random Forest classifier at 93.7% accuracy + custom U-Net deep learning model for pixel-level delineation.',
  },
  {
    num: '[03]',
    title: 'Vital Archive',
    desc: 'Medical informatics & AI-powered analytics platform',
    tags: ['FastAPI', 'Next.js', 'Gemini AI', 'Sentence Transformers', 'Recharts'],
    url: 'https://github.com/sarthaxmehta/Vital-Archive',
    detail: 'Automated ingestion pipeline extracting structured data from lab PDFs via Gemini 2.5. Built a semantic normalizer for biomarker names + a full analytics dashboard with longitudinal trend analysis.',
  },
  {
    num: '[04]',
    title: 'Zenvvy',
    desc: 'Restaurant management system, desktop-native',
    tags: ['Next.js', 'Electron', 'Prisma', 'SQLite', 'React'],
    url: 'https://github.com/sarthaxmehta/Zenvvy',
    detail: 'Full-stack POS, KDS, table management, and inventory system packaged as a native desktop app via Electron. Runs 100% offline with local SQLite. Built for NIT Jalandhar as an educational showcase.',
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
    desc: 'LIKE DEV TEAMS, I WORK IN FOCUSED TWO-WEEK SPRINTS. ONCE I\'VE HONED IN ON A PROBLEM, I SPEND TWO WEEKS SOLVING IT. THEN, I MOVE ON TO THE NEXT.',
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
    desc: 'I PRESENT THE WORK. YOU LIVE WITH IT. TEST IT. BREAK IT. EVERY ENTERPRISE WORTH ITS WEIGHT IN GOLD MAKES PIVOTS — AND I ALWAYS ANSWER THE DOOR.',
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
  { num: '007.', text: 'Move at startup speed even if you aren\'t one.' },
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
    a: 'Next.js, React, TypeScript, Python, FastAPI, PyTorch, Prisma, and the Google AI ecosystem. I\'m also deeply experienced in geospatial tooling — Google Earth Engine, QGIS, and satellite imagery processing.',
  },
  {
    q: 'Are you available for internships or full-time roles?',
    a: 'Yes. I\'m currently a 2nd-year student at NIT Jalandhar (B.Tech, 2024–2028) and actively seeking internships in software engineering, AI/ML, and product development.',
  },
  {
    q: 'What\'s the fastest way to reach you?',
    a: 'Drop me a message at sarthakm.cs.24@nitj.ac.in — I respond fast. You can also connect on LinkedIn or check out my GitHub to see the work first.',
  },
  {
    q: 'Do you work on AI/ML projects specifically?',
    a: 'Absolutely. AI is at the core of most of my recent work — from LLM-powered OS systems to deep learning segmentation models and semantic NLP pipelines. If there\'s an AI angle, I\'m interested.',
  },
];

// ---------- COMPONENTS ----------

function SprintSection() {
  const [active, setActive] = useState(0);
  const phase = sprintPhases[active];
  return (
    <section className="sprint-section">
      <div className="section-header" style={{ padding: '20px 60px 0', marginBottom: '0' }}>
        <span className="section-counter">[ 06 / 07 ]</span>
        <span className="section-label">HOW I SPRINT</span>
      </div>
      <div className="sprint-inner">
        <div className="sprint-left">
          {sprintPhases.map((p, i) => (
            <div
              key={i}
              className={`sprint-phase-item${active === i ? ' active' : ''}`}
              onClick={() => setActive(i)}
            >
              <div
                className="sprint-phase-dot"
                style={{ background: active === i ? p.color : undefined }}
              />
              <span className="sprint-phase-label">{p.label}</span>
            </div>
          ))}
        </div>
        <div className="sprint-right">
          <div className="sprint-phase-number">{phase.number}</div>
          <div className="sprint-phase-desc-box">
            <p className="sprint-phase-desc">{phase.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq-list">
      {faqs.map((item, i) => (
        <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
          <div className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.q}</span>
            <span className="faq-toggle">+</span>
          </div>
          <div className="faq-answer">{item.a}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- MAIN PAGE ----------

export default function Home() {
  const aboutTextRef = useRef<HTMLParagraphElement>(null);

  // Scroll-reveal for about text dim/bright effect (simplified via intersection)
  useEffect(() => {
    const el = aboutTextRef.current;
    if (!el) return;
    const spans = el.querySelectorAll('.dim-text');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            spans.forEach((s, i) => {
              setTimeout(() => {
                (s as HTMLElement).style.color = 'rgba(255,255,255,0.95)';
              }, i * 80);
            });
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-brand">
          <span className="nav-brand-name">sarthak—</span>
          <span className="nav-brand-year">©2025</span>
        </div>
        <div className="nav-links">
          <a href="mailto:sarthakm.cs.24@nitj.ac.in" className="nav-link">
            <span className="nav-link-dot" />
            sarthakm.cs.24@nitj.ac.in
          </a>
          <a href="https://github.com/sarthaxmehta" className="nav-link" target="_blank" rel="noopener noreferrer">
            <span className="nav-link-dot" />
            GITHUB
          </a>
          <a href="https://www.linkedin.com/in/sarthak-mehta-698457310/" className="nav-link" target="_blank" rel="noopener noreferrer">
            <span className="nav-link-dot" />
            LINKEDIN
          </a>
        </div>
        <a href="mailto:sarthakm.cs.24@nitj.ac.in" className="nav-cta">HIRE ME</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-image-container">
          <Image
            src="/hero-visual.png"
            alt="Abstract hero visual"
            width={500}
            height={500}
            style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }}
            priority
          />
        </div>
        <div className="hero-text">
          <h1 className="hero-headline">
            Build things that matter.<br />Ship them fast.
          </h1>
        </div>
      </section>

      {/* PARTNERS IN CRIME */}
      <div className="partners">
        <p className="partners-label">TECHNOLOGIES &amp; TOOLS</p>
        <div className="partners-logos">
          {skills.map((s) => (
            <span key={s} className="partner-logo">{s}</span>
          ))}
        </div>
      </div>

      {/* DARK CONTAINER STARTS */}
      <div className="dark-container">

        {/* ABOUT */}
        <section className="about">
          <span className="about-tag">ABOUT</span>
          <p className="about-text" ref={aboutTextRef}>
            Sarthak Mehta is a{' '}
            <span className="dim-text">hyper-focused, full-stack engineer and AI builder who moves at startup speed</span>
            {' '}from NIT Jalandhar.{' '}
            <span className="dim-text">He engineers geospatial intelligence pipelines, premium AI-powered systems, and products that feel as good as they perform.</span>
          </p>
          <a
            href="https://github.com/sarthaxmehta"
            target="_blank"
            rel="noopener noreferrer"
            className="outline-btn"
          >
            SEE THE WORK <span className="outline-btn-icon">↗</span>
          </a>
        </section>

        {/* SERVICES */}
        <section className="services">
          <div className="section-header" style={{ padding: '0 60px', marginBottom: '0' }}>
            <span className="section-counter">[ 02 / 07 ]</span>
            <span className="section-label">WHAT I BUILD</span>
          </div>
          <div className="services-inner">
            <div className="services-left">
              <div>
                <h2 className="services-headline">
                  I write, design and build for startups and enterprises.
                </h2>
                <p className="services-body">
                  Full-stack systems that make your users feel something. AI pipelines that extract value from
                  raw data. Geospatial intelligence that turns satellite imagery into insight. Desktop apps that
                  work offline without compromise. And a whole lot of other things I can&rsquo;t put on a resume.
                </p>
              </div>
              <a href="mailto:sarthakm.cs.24@nitj.ac.in" className="outline-btn">
                LET&rsquo;S TALK <span className="outline-btn-icon">↗</span>
              </a>
            </div>
            <div className="services-right">
              <ul className="services-list">
                {[
                  'Full-Stack Web',
                  'AI / ML Systems',
                  'Geospatial AI',
                  'Desktop Apps',
                  'Data Pipelines',
                  'UI/UX Design',
                ].map((s, i) => (
                  <li key={s} className={`services-list-item${i > 3 ? ' dim' : ''}`}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* HOW I WORK */}
        <section className="how-work">
          <div className="section-header" style={{ padding: '0 60px', marginBottom: '0' }}>
            <span className="section-counter">[ 03 / 07 ]</span>
            <span className="section-label">HOW I WORK</span>
          </div>
          <div className="how-work-bg" />
          <div className="how-work-items">
            {howWork.map((item) => (
              <div key={item.num} className="how-work-item">
                <div className="how-work-number">{item.num}</div>
                <div className="how-work-title">{item.title}</div>
                <div className="how-work-divider" />
                <p className="how-work-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS — BEFORE / AFTER */}
        <section className="projects-section">
          <div className="section-header" style={{ padding: '0 60px', marginBottom: '0' }}>
            <span className="section-counter">[ 04 / 07 ]</span>
            <span className="section-label">SELECTED WORK</span>
          </div>
          <div className="before-after-header" style={{ position: 'relative', background: 'var(--black)', padding: '0', overflow: 'visible' }}>
            <div className="stars-bg" style={{ position: 'absolute', inset: 0, minHeight: '500px', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '80px 0 40px', textAlign: 'center' }}>
              <div className="before-after-title">
                <span>SELECTED</span>
                <span>// WORK©</span>
              </div>
            </div>
          </div>
          <div className="project-cards-area">
            <div className="project-cards-grid">
              {projects.map((p) => (
                <div key={p.num} className="project-card">
                  <div className="project-card-number">{p.num}</div>
                  <h3 className="project-card-title">{p.title}</h3>
                  <p className="project-card-desc">{p.detail}</p>
                  <div className="project-card-tags">
                    {p.tags.map((t) => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card-link"
                    aria-label={`View ${p.title} on GitHub`}
                  >
                    ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EDUCATION */}
        <section className="edu-section">
          <div className="section-header" style={{ padding: '0', marginBottom: '48px' }}>
            <span className="section-counter">[ 05 / 07 ]</span>
            <span className="section-label">EDUCATION &amp; CERTS</span>
          </div>
          <div className="edu-grid">
            <div className="edu-card">
              <div className="edu-card-label">B.Tech Computer Science</div>
              <div className="edu-card-title">NIT Jalandhar</div>
              <div className="edu-card-sub">
                Dr. B.R. Ambedkar NIT · 2024–2028<br />
                GPA: 8.63 / 10<br />
                Core Member, E-Cell · Core Member, Q&apos;Mania Quantum Club
              </div>
            </div>
            <div className="edu-card">
              <div className="edu-card-label">Experience</div>
              <div className="edu-card-title">Remote Sensing & GIS Intern</div>
              <div className="edu-card-sub">
                India Space Academy · Jan–Feb 2026<br />
                Built a geospatial AI pipeline for building footprint extraction from Sentinel-2 imagery using PyTorch U-Net + GEE Random Forest.
              </div>
            </div>
            <div className="edu-card">
              <div className="edu-card-label">Certification</div>
              <div className="edu-card-title">Machine Learning Specialization</div>
              <div className="edu-card-sub">
                Stanford Online &amp; DeepLearning.AI<br />
                Andrew Ng · Coursera
              </div>
            </div>
            <div className="edu-card">
              <div className="edu-card-label">Certification</div>
              <div className="edu-card-title">Meta Front-End Developer</div>
              <div className="edu-card-sub">
                Professional Certificate<br />
                Meta · Coursera
              </div>
            </div>
          </div>
        </section>

        {/* SPRINT SECTION */}
        <SprintSection />

        {/* RULES TICKER + LIST */}
        <section className="rules-section">
          <div className="section-header" style={{ padding: '20px 60px 0', marginBottom: '0' }}>
            <span className="section-counter">[ 07 / 07 ]</span>
            <span className="section-label">PRINCIPLES</span>
          </div>
          <div className="rules-ticker">
            <div className="rules-ticker-inner">
              {[...Array(4)].map((_, i) => (
                <span key={`a-${i}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span className="rules-ticker-text">PRINCIPLES</span>
                  <span className="rules-ticker-dot">✦</span>
                  <span className="rules-ticker-text">HOW I OPERATE</span>
                  <span className="rules-ticker-dot">✦</span>
                </span>
              ))}
            </div>
          </div>
          <div className="rules-body">
            <p className="rules-intro">
              At every great project, there&rsquo;s a set of operating principles that keep things from
              getting too out of hand. These are mine — forged from shipping real products, writing
              real code, and learning from engineers I deeply respect.
            </p>
            <div className="rules-divider" />
            <ul className="rules-list">
              {rules.map((r) => (
                <li key={r.num} className="rules-list-item">
                  <span className="rules-list-num">{r.num}</span>
                  {r.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CONTACT / FAQ */}
        <section className="contact-section">
          <div className="contact-inner">
            <div className="section-header" style={{ padding: '0', marginBottom: '48px' }}>
              <span className="section-counter">[ CONTACT ]</span>
              <span className="section-label">FAQ</span>
            </div>
            <h2 className="contact-headline">
              Feeling ambitious?<br />Let&rsquo;s build something.
            </h2>
            <FaqSection />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-brand-name">Sarthak Mehta</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                Full-Stack Engineer &amp; AI Builder<br />
                NIT Jalandhar · Class of 2028
              </div>
            </div>
            <div className="footer-cta-area">
              <div className="footer-cta-label">WANT TO WORK TOGETHER?</div>
              <a href="mailto:sarthakm.cs.24@nitj.ac.in" className="footer-cta-link">
                sarthakm.cs.24@nitj.ac.in
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2025 Sarthak Mehta. All rights reserved.</span>
            <div className="footer-links">
              <a
                href="https://github.com/sarthaxmehta"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/sarthak-mehta-698457310/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                LinkedIn
              </a>
              <a href="mailto:sarthakm.cs.24@nitj.ac.in" className="footer-link">Email</a>
            </div>
          </div>
        </footer>

      </div>
      {/* DARK CONTAINER ENDS */}
    </>
  );
}
