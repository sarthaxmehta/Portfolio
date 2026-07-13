'use client';

import { useState, useTransition } from 'react';
import { submitInquiry } from '../actions/inquiry';

const SERVICE_OPTIONS = [
  { id: 'ai', label: 'AI Engineering', desc: 'Geospatial pipelines, PyTorch/U-Net models, LLMs & Gemini.' },
  { id: 'web', label: 'Full-Stack Web App', desc: 'React 19, Next.js 16, offline Electron desktops.' },
  { id: 'data', label: 'Semantic & PDF Data Extractor', desc: 'FastAPI, vector normalizations, unstructured PDF parsing.' },
  { id: 'other', label: 'General Technical Consulting', desc: 'Database migrations, optimization, system architecture.' },
];

const BUDGET_OPTIONS = [
  { label: '₹50K - ₹1.5L', desc: 'Small sprint/automation' },
  { label: '₹1.5L - ₹3L', desc: 'Mid-sized full application' },
  { label: '₹3L - ₹6L', desc: 'Enterprise embedding / AI R&D' },
  { label: '₹6L+', desc: 'Large scope complex systems' },
];

const TIMELINE_OPTIONS = [
  { label: 'Two-Week Sprint', desc: 'Rapid velocity MVP' },
  { label: 'One-Month Build', desc: 'Full lifecycle execution' },
  { label: 'Three-Month Embed', desc: 'Retainer based integration' },
  { label: 'Flexible / R&D', desc: 'Ongoing optimization' },
];

export default function IntakeForm() {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inquiryId, setInquiryId] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [selectedService, setSelectedService] = useState('ai');
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0].label);
  const [selectedTimeline, setSelectedTimeline] = useState(TIMELINE_OPTIONS[0].label);
  const [message, setMessage] = useState('');

  const nextStep = () => {
    if (step === 1 && (!name.trim() || !email.trim())) {
      setError('Please provide your name and email to proceed.');
      return;
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write a brief description of your project vision.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const serviceLabel = SERVICE_OPTIONS.find(s => s.id === selectedService)?.label || selectedService;
      const res = await submitInquiry({
        name,
        email,
        company,
        budget: selectedBudget,
        timeline: selectedTimeline,
        message: `[Service: ${serviceLabel}] ${message}`,
      });

      if (res.success && res.inquiryId) {
        setSuccess(true);
        setInquiryId(res.inquiryId);
      } else {
        setError(res.error || 'Failed to submit the form.');
      }
    });
  };

  if (success) {
    return (
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h3 className="success-title">INQUIRY RECEIVED</h3>
        <p className="success-desc">
          Thank you, {name}. Your technical project intake has been logged. I will reach out within 24 hours.
        </p>
        <div className="success-meta">
          <span>TICKET_ID: {inquiryId}</span>
          <span>STATUS: QUEUED // PENDING_REVIEW</span>
        </div>
        <button
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setName('');
            setEmail('');
            setCompany('');
            setMessage('');
          }}
          className="honey-btn"
          style={{ marginTop: '2rem' }}
        >
          SUBMIT ANOTHER TICKET
        </button>
        <style jsx>{`
          .success-container {
            border: 1px solid var(--accent);
            background-color: var(--surface);
            padding: 3rem;
            border-radius: var(--radius-lg);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: fadeIn 0.5s ease-out;
          }
          .success-icon {
            font-size: 2.5rem;
            color: var(--background);
            background-color: var(--accent);
            width: 70px;
            height: 70px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            font-weight: 700;
          }
          .success-title {
            font-size: 1.75rem;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
            color: var(--foreground);
          }
          .success-desc {
            color: var(--text-muted);
            font-size: 0.95rem;
            max-width: 500px;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .success-meta {
            font-family: 'Space Mono', monospace;
            font-size: 0.75rem;
            color: var(--accent);
            background-color: rgba(255, 76, 36, 0.05);
            border: 1px solid rgba(255, 76, 36, 0.15);
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius);
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            text-align: left;
            width: 100%;
            max-width: 400px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="intake-card">
      {/* Progress indicators */}
      <div className="progress-bar-container">
        <div className="progress-steps-label">
          <span className="mono-label">Step {step} of 4</span>
          <span className="mono-label">Progress: {step * 25}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${step * 25}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        {error && <div className="error-banner">{error}</div>}

        {/* STEP 1: Identification */}
        {step === 1 && (
          <div className="step-content animate-slide-in">
            <h3 className="step-heading">Tell me about yourself</h3>
            <p className="step-subheading">I need basic parameters to initiate communication.</p>
            
            <div className="input-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarthak Mehta"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarthakm.cs.24@nitj.ac.in"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="company">Company / Organization (Optional)</label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. India Space Academy"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Service Focus */}
        {step === 2 && (
          <div className="step-content animate-slide-in">
            <h3 className="step-heading">Choose a service vertical</h3>
            <p className="step-subheading">Select the primary engineering focus for your sprint.</p>

            <div className="options-grid">
              {SERVICE_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedService(opt.id)}
                  className={`option-card ${selectedService === opt.id ? 'active' : ''}`}
                >
                  <div className="option-indicator"></div>
                  <div className="option-info">
                    <span className="option-label">{opt.label}</span>
                    <span className="option-desc">{opt.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Timeline & Budget */}
        {step === 3 && (
          <div className="step-content animate-slide-in">
            <h3 className="step-heading">Define the constraints</h3>
            <p className="step-subheading">Budget scope and project timeline targets.</p>

            <h4 className="sub-section-title">Investment Target</h4>
            <div className="options-grid horizontal">
              {BUDGET_OPTIONS.map((opt) => (
                <div
                  key={opt.label}
                  onClick={() => setSelectedBudget(opt.label)}
                  className={`option-card ${selectedBudget === opt.label ? 'active' : ''}`}
                >
                  <span className="option-label">{opt.label}</span>
                  <span className="option-desc">{opt.desc}</span>
                </div>
              ))}
            </div>

            <h4 className="sub-section-title" style={{ marginTop: '2rem' }}>Timeline Target</h4>
            <div className="options-grid horizontal">
              {TIMELINE_OPTIONS.map((opt) => (
                <div
                  key={opt.label}
                  onClick={() => setSelectedTimeline(opt.label)}
                  className={`option-card ${selectedTimeline === opt.label ? 'active' : ''}`}
                >
                  <span className="option-label">{opt.label}</span>
                  <span className="option-desc">{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Product Vision */}
        {step === 4 && (
          <div className="step-content animate-slide-in">
            <h3 className="step-heading">Describe your vision</h3>
            <p className="step-subheading">Provide high-level architecture thoughts or functional requirements.</p>

            <div className="input-group">
              <label htmlFor="message">Project Description *</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Detail the problem you want solved, your tech stack preferences, and what a successful launch looks like..."
                required
              />
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="form-actions">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="honey-btn-outline" disabled={isPending}>
              BACK
            </button>
          )}

          {step < 4 ? (
            <button type="button" onClick={nextStep} className="honey-btn" style={{ marginLeft: 'auto' }}>
              NEXT STEP
            </button>
          ) : (
            <button type="submit" className="honey-btn" style={{ marginLeft: 'auto' }} disabled={isPending}>
              {isPending ? 'LOGGING_TICKET...' : 'SUBMIT REQ'}
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        .intake-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        .progress-bar-container {
          margin-bottom: 2.5rem;
        }

        .progress-steps-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .progress-track {
          height: 3px;
          background-color: var(--border-muted);
          width: 100%;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: var(--accent);
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .step-heading {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .step-subheading {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .sub-section-title {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .input-group label {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--foreground);
        }

        .input-group input,
        .input-group textarea {
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          color: var(--foreground);
          transition: border-color var(--transition);
          width: 100%;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: var(--accent);
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .options-grid.horizontal {
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }

        .option-card {
          border: 1px solid var(--border);
          background-color: var(--background);
          padding: 1.25rem;
          border-radius: var(--radius);
          cursor: pointer;
          transition: all var(--transition);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .options-grid.horizontal .option-card {
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          text-align: left;
        }

        .option-card:hover {
          border-color: var(--accent);
        }

        .option-card.active {
          border-color: var(--accent);
          background-color: rgba(255, 76, 36, 0.05);
        }

        .option-indicator {
          width: 12px;
          height: 12px;
          border: 1px solid var(--border);
          border-radius: 50%;
          flex-shrink: 0;
          position: relative;
        }

        .option-card.active .option-indicator {
          border-color: var(--accent);
          background-color: var(--accent);
        }

        .option-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .option-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .option-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .form-actions {
          display: flex;
          align-items: center;
          margin-top: 3rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }

        .error-banner {
          background-color: rgba(244, 72, 73, 0.1);
          border: 1px solid #f44849;
          color: #f44849;
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .animate-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
