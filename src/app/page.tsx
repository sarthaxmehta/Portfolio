import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={`glass ${styles.header}`}>
        <h1>Portfolio</h1>
        <nav>
          <a href="/projects">Projects</a>
          <a href="/manager">Manager Log in</a>
        </nav>
      </header>
      
      <section className="animate-fade-in">
        <h2>Welcome to my digital space</h2>
        <p>This is the public-facing portfolio. The personal manager is hidden behind authentication.</p>
      </section>
    </div>
  );
}
