'use client';

import { useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string;
  imageUrl: string;
  projectUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
}

interface ProjectShowcaseProps {
  initialProjects: Project[];
}

const CATEGORIES = ['All', 'AI / ML', 'Web Apps', 'Tools & Systems'];

export default function ProjectShowcase({ initialProjects }: ProjectShowcaseProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const getCategoryForProject = (project: Project) => {
    const tagsLower = project.tags.toLowerCase();
    if (tagsLower.includes('pytorch') || tagsLower.includes('transformers') || tagsLower.includes('gemini') || tagsLower.includes('ai')) {
      return 'AI / ML';
    }
    if (tagsLower.includes('next.js') || tagsLower.includes('react') || tagsLower.includes('tailwind')) {
      return 'Web Apps';
    }
    return 'Tools & Systems';
  };

  const filteredProjects = initialProjects.filter((project) => {
    if (activeFilter === 'All') return true;
    return getCategoryForProject(project) === activeFilter;
  });

  // Generates a deterministic gradient style based on project title
  const getGradientForProject = (title: string) => {
    const gradients = [
      'linear-gradient(135deg, #1f120e 0%, #ff4c24 100%)', // ChiefOS / Orange
      'linear-gradient(135deg, #0e1f13 0%, #24ff55 100%)', // UrbanNet / Green
      'linear-gradient(135deg, #130e1f 0%, #7024ff 100%)', // Vital Archive / Purple
      'linear-gradient(135deg, #0e1e1f 0%, #24dbff 100%)', // Zenvvy / Cyan
      'linear-gradient(135deg, #1e1f0e 0%, #ffd424 100%)', // AgriMarket / Yellow
    ];
    let sum = 0;
    for (let i = 0; i < title.length; i++) sum += title.charCodeAt(i);
    return gradients[sum % gradients.length];
  };

  return (
    <div className="showcase-container">
      {/* Category Tabs */}
      <div className="filter-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`filter-tab ${activeFilter === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dynamic Counter */}
      <div className="showcase-counter">
        <span className="mono-label">Result count // {filteredProjects.length} projects loaded</span>
      </div>

      {/* Grid Layout */}
      <div className="project-grid">
        {filteredProjects.map((project) => {
          const projectGradient = getGradientForProject(project.title);
          const projectTags = project.tags.split(',').map(t => t.trim());

          return (
            <div key={project.id} className="project-card">
              {/* Tech Header canvas representation */}
              <div className="project-visual" style={{ background: projectGradient }}>
                <div className="visual-grid-overlay"></div>
                <div className="visual-meta">
                  <span className="visual-tag-mono">SYS_BUILD_VER_1.0</span>
                  <span className="visual-status-dot"></span>
                </div>
                <div className="visual-logo-container">
                  <h3>{project.title.substring(0, 2).toUpperCase()}</h3>
                </div>
              </div>

              {/* Card Details */}
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  {project.featured && (
                    <span className="featured-badge">FEATURED</span>
                  )}
                </div>

                <p className="project-desc">{project.description}</p>

                {/* Tech Badges */}
                <div className="project-tags">
                  {projectTags.map((tag) => (
                    <span key={tag} className="tag-badge">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="project-links">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link-btn"
                    >
                      GITHUB CODE
                    </a>
                  )}
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link-btn primary"
                    >
                      LIVE DEPLOY
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .showcase-container {
          width: 100%;
        }

        .filter-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .filter-tab {
          font-family: 'Space Mono', monospace;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.5rem 1.25rem;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all var(--transition);
        }

        .filter-tab:hover {
          border-color: var(--accent);
          color: var(--foreground);
        }

        .filter-tab.active {
          border-color: var(--accent);
          background-color: var(--accent);
          color: var(--background);
          font-weight: 700;
        }

        .showcase-counter {
          margin-bottom: 3rem;
        }

        .project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .project-grid {
            grid-template-columns: 1fr;
          }
        }

        .project-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .project-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 10px 30px rgba(255, 76, 36, 0.05);
        }

        .project-visual {
          height: 180px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .visual-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .visual-meta {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          color: rgba(244, 241, 238, 0.7);
        }

        .visual-status-dot {
          width: 6px;
          height: 6px;
          background-color: var(--foreground);
          border-radius: 50%;
          display: inline-block;
        }

        .visual-logo-container {
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1;
        }

        .visual-logo-container h3 {
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          color: var(--foreground);
        }

        .project-content {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .project-title {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .featured-badge {
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem;
          color: var(--accent);
          border: 1px solid var(--accent);
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .project-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          line-height: 1.5;
          flex-grow: 1;
        }

        .project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .tag-badge {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          background-color: var(--border-muted);
          color: var(--text-muted);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border);
        }

        .project-links {
          display: flex;
          gap: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 1.25rem;
        }

        .project-link-btn {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: 0.05em;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .project-link-btn::after {
          content: '↗';
        }

        .project-link-btn:hover {
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
