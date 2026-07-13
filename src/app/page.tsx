import styles from './page.module.css';
import ProjectShowcase from '../components/ProjectShowcase';
import IntakeForm from '../components/IntakeForm';
import { getProjects } from '../actions/project';

export default async function Home() {
  // Fetch projects from database (will trigger seed if database is empty)
  const res = await getProjects();
  const projects = res.success && res.projects ? res.projects : [];

  return (
    <div className={styles.container}>
      {/* Decorative Grid Overlay */}
      <div className="grid-bg"></div>

      {/* Sticky Header / Navigation */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            SARTHAK<span>.</span>MEHTA
          </div>
          <nav className={styles.nav}>
            <a href="#work" className={styles.navLink}>Work</a>
            <a href="#about" className={styles.navLink}>Manifesto</a>
            <a href="#process" className={styles.navLink}>Process</a>
            <a href="#contact" className={styles.navLink}>Initiate Intake</a>
          </nav>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot}></span>
            <span>AVAILABLE FOR SPRINT 03/26</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`${styles.section} ${styles.hero}`}>
        <div className={`${styles.heroContent} animate-fade-in-up`}>
          <span className="mono-label">FULL STACK AI & GEOSPATIAL ENGINEER</span>
          <h1 className={styles.heroTitle}>
            Building high-impact <span>intelligence architectures</span> and full-stack systems.
          </h1>
          <p className={styles.heroDesc}>
            I am Sarthak Mehta, an engineering student at NIT Jalandhar. I construct production-ready workflows bridging the gap between deep learning pipelines (PyTorch, Remote Sensing) and robust, local-first applications (Next.js, Electron, SQLite).
          </p>
          <div className={styles.heroActions}>
            <a href="#work" className="honey-btn">Selected Works</a>
            <a href="#contact" className="honey-btn-outline">Initiate Sprint</a>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider">01 // EXECUTION MANIFESTO</div>

      {/* Manifesto / Principles Section */}
      <section id="about" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className="mono-label">HOW I THINK</span>
          <h2 className={styles.sectionTitle}>Rules of engagement.</h2>
        </div>
        <div className={styles.manifestoGrid}>
          <div className={styles.manifestoCard}>
            <span className={styles.manifestoNum}>01 // SYSTEM OVERWHELM</span>
            <h3 className={styles.manifestoTitle}>Never build placeholders.</h3>
            <p className={styles.manifestoText}>
              I don't build minimal viable toys. Whether it is engineering a custom U-Net segmentation model in PyTorch from scratch or bundling a complete SQLite + Prisma instance offline inside an Electron container, I prioritize full-scale deterministic engines.
            </p>
          </div>
          <div className={styles.manifestoCard}>
            <span className={styles.manifestoNum}>02 // THE TWO-WEEK VELOCITY</span>
            <h3 className={styles.manifestoTitle}>Startup pace, enterprise boundaries.</h3>
            <p className={styles.manifestoText}>
              Inspired by hyper-nimble agencies, I execute in high-frequency sprints. I bridge advanced remote sensing datasets (Sentinel-2, GEE) and client-facing interfaces rapidly, replacing slow corporate inertia with direct technological utility.
            </p>
          </div>
          <div className={styles.manifestoCard}>
            <span className={styles.manifestoNum}>03 // SEMANTIC NORMALIZATION</span>
            <h3 className={styles.manifestoTitle}>UX/UI as sticky as hot tar.</h3>
            <p className={styles.manifestoText}>
              Applications must be lightning-fast, local-first, and highly intuitive. I design normalized data pipelines (using sentence-transformers) to resolve real-world inconsistencies, packaging complex analytics into gorgeous interactive interfaces.
            </p>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider">02 // SELECTED PROJECTS</div>

      {/* Works Section */}
      <section id="work" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className="mono-label">PROVEN IN PRODUCTION</span>
          <h2 className={styles.sectionTitle}>Engineered systems.</h2>
        </div>
        <ProjectShowcase initialProjects={projects} />
      </section>

      {/* Section Divider */}
      <div className="section-divider">03 // WORKING PROCESS</div>

      {/* Process Section */}
      <section id="process" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className="mono-label">DELIVERY MODEL</span>
          <h2 className={styles.sectionTitle}>The 14-day sprint flow.</h2>
        </div>
        <div className={styles.processGrid}>
          <div className={styles.processCard}>
            <span className={styles.processStep}>DAYS 01-03</span>
            <h3 className={styles.processTitle}>01 // Scope & Architecture</h3>
            <p className={styles.processText}>Deconstructing the core challenge, mapping intent trees, database schemas (SQLite/PostgreSQL), and modeling datasets.</p>
          </div>
          <div className={styles.processCard}>
            <span className={styles.processStep}>DAYS 04-09</span>
            <h3 className={styles.processTitle}>02 // Deep Development</h3>
            <p className={styles.processText}>Building core intelligence pipelines (PyTorch, HuggingFace) and binding them directly into robust Next.js/FastAPI endpoints.</p>
          </div>
          <div className={styles.processCard}>
            <span className={styles.processStep}>DAYS 10-12</span>
            <h3 className={styles.processTitle}>03 // Interface & Polish</h3>
            <p className={styles.processText}>Designing responsive, rich CSS interfaces. Integrating high-performance interactive visualizations (Recharts) and micro-interactions.</p>
          </div>
          <div className={styles.processCard}>
            <span className={styles.processStep}>DAYS 13-14</span>
            <h3 className={styles.processTitle}>04 // Launch & Embed</h3>
            <p className={styles.processText}>Deploying to production (Vercel) or compiling desktop executables (Electron Builder) with full test coverages and diagnostic passes.</p>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider">04 // INTAKE QUESTIONNAIRE</div>

      {/* Contact Section */}
      <section id="contact" className={`${styles.section} ${styles.intakeSection}`}>
        <div className={styles.sectionHeader}>
          <span className="mono-label">GET IN TOUCH</span>
          <h2 className={styles.sectionTitle}>Initiate your technical intake.</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.95rem' }}>
            Provide your parameters below to log a review ticket in my database. Let's build something exceptional.
          </p>
        </div>
        <IntakeForm />
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <div className={styles.logo}>
                SARTHAK<span>.</span>MEHTA
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>
                Full-Stack Developer and Geospatial AI Engineer based in Jalandhar, Punjab. Core member of E-Cell and Q'Mania.
              </p>
            </div>
            <div className={styles.footerCol}>
              <span className={styles.footerTitle}>CONNECT</span>
              <div className={styles.footerLinks}>
                <a href="https://github.com/sarthaxmehta" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>GitHub</a>
                <a href="https://www.linkedin.com/in/sarthak-mehta-698457310/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>LinkedIn</a>
                <a href="mailto:sarthakm.cs.24@nitj.ac.in" className={styles.footerLink}>Email</a>
              </div>
            </div>
            <div className={styles.footerCol}>
              <span className={styles.footerTitle}>SYSTEM METRICS</span>
              <div className={styles.footerLinks}>
                <span className={styles.footerLink}>GPA // 8.63 / 10</span>
                <span className={styles.footerLink}>STACK // TS / NEXT16 / PYTORCH</span>
                <span className={styles.footerLink}>RUNTIME // VERCELL_EDGE</span>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} SARTHAK MEHTA. ALL RIGHTS RESERVED.</span>
            <span>SYSTEM_STATUS // ONLINE_OK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
