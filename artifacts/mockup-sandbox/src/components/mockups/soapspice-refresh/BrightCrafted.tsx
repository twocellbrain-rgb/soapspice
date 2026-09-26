import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  FlaskConical,
  Leaf,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import './_group.css';
import './BrightCrafted.css';

const logo = '/__mockup/images/soapspice-logo-cropped.png';

function RouteLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

export function BrightCrafted() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="soap-home">
      <div className="soap-ribbon" aria-label="Create, calculate, craft">
        <span>CREATE</span><i /><span>CALCULATE</span><i /><span>CRAFT</span>
        <span className="ribbon-note">A little more joy in every batch</span>
      </div>

      <header className="soap-header">
        <RouteLink href="/" className="soap-brand" onClick={closeMenu}>
          <img src={logo} alt="SoapSpice — your soapmaking companion" />
        </RouteLink>
        <button
          type="button"
          className="soap-menu-toggle"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? 'soap-nav is-open' : 'soap-nav'} aria-label="Main navigation">
          <RouteLink href="/calculators/cold-process-soap" onClick={closeMenu}>Calculator</RouteLink>
          <RouteLink href="/ingredients" onClick={closeMenu}>Ingredient field guide</RouteLink>
          <RouteLink
            href="/calculators/cold-process-soap"
            className="soap-nav-cta"
            onClick={closeMenu}
          >
            Start a formula <ArrowRight size={16} />
          </RouteLink>
        </nav>
      </header>

      <main>
        <section className="soap-hero">
          <div className="soap-hero-copy">
            <div className="soap-eyebrow"><Sparkles size={15} /> A friendlier way to formulate</div>
            <h1>Make soap with<br /><em>more yes.</em><br /><span className="soap-final-headline">Less guesswork.</span></h1>
            <p className="soap-hero-intro">
              Oils, butters, and good ideas deserve a recipe you can understand.
              Bring your curiosity; we’ll take care of the careful math.
            </p>
            <div className="soap-hero-actions">
              <RouteLink href="/calculators/cold-process-soap" className="soap-button soap-button-dark">
                Open the cold-process calculator <ArrowRight size={17} />
              </RouteLink>
              <RouteLink href="/ingredients" className="soap-text-link">
                Browse ingredients <ArrowDownRight size={16} />
              </RouteLink>
            </div>
            <div className="soap-proof">
              <span className="proof-icon"><ShieldCheck size={17} /></span>
              <span><strong>Clear numbers, cited sources.</strong><br />SAP values shown plainly, ready for your review.</span>
            </div>
          </div>

          <div className="soap-hero-art">
            <div className="soap-art-orbit orbit-one" />
            <div className="soap-art-orbit orbit-two" />
            <div className="soap-photo-frame">
              <img
                className="soap-hero-photo"
                src="/__mockup/images/soapspice-crafted-hero.jpg"
                alt="Colorful handmade soap bars with citrus and botanicals"
              />
              <div className="photo-sticker">Made<br />by hand<span><Sparkles size={14} /></span></div>
            </div>
            <div className="soap-batch-note">
              <span className="note-topline"><FlaskConical size={14} /> YOUR FIRST BATCH</span>
              <strong>Curiosity<br />looks good on you.</strong>
              <span className="note-swatch"><i /><i /><i /><i /></span>
            </div>
            <div className="soap-side-label">SMALL BATCH / BIG JOY</div>
          </div>
        </section>

        <section className="soap-manifesto">
          <div className="manifesto-head">
            <span className="soap-eyebrow"><span className="manifesto-dot" /> The good stuff, in order</span>
            <h2>From what’s in your bowl<br />to what’s on your bar.</h2>
          </div>
          <div className="manifesto-steps">
            <article className="manifesto-step">
              <span className="step-no">01 / INGREDIENTS</span>
              <div className="step-icon step-leaf"><Leaf size={22} /></div>
              <h3>Choose with context.</h3>
              <p>Explore what an oil brings to a bar, not just what it’s called.</p>
              <RouteLink href="/ingredients" className="step-link">Explore the field guide <ArrowRight size={15} /></RouteLink>
            </article>
            <article className="manifesto-step">
              <span className="step-no">02 / THE MATH</span>
              <div className="step-icon step-flask"><FlaskConical size={22} /></div>
              <h3>See every number.</h3>
              <p>NaOH and water calculations trace back to ingredient SAP values.</p>
              <RouteLink href="/calculators/cold-process-soap" className="step-link">See how it adds up <ArrowRight size={15} /></RouteLink>
            </article>
            <article className="manifesto-step">
              <span className="step-no">03 / YOUR BATCH</span>
              <div className="step-icon step-spark"><Sparkles size={22} /></div>
              <h3>Make it yours.</h3>
              <p>Save your formula in your browser, print it, then get making.</p>
              <RouteLink href="/calculators/cold-process-soap" className="step-link">Build your first bar <ArrowRight size={15} /></RouteLink>
            </article>
          </div>
        </section>

        <section className="soap-feature">
          <div className="feature-photo-wrap">
            <img
              src="/__mockup/images/soapspice-crafted-detail.jpg"
              alt="Close-up of a hand-cut marbled soap bar in coral, cream, and teal"
              className="soap-detail-photo"
            />
            <div className="feature-caption"><span>01</span> A bar with a story in every swirl</div>
          </div>
          <div className="feature-copy">
            <span className="soap-eyebrow">A calmer first batch is a better first batch</span>
            <h2>Good soap starts<br />with good questions.</h2>
            <p>What does olive oil bring? Why does this number matter? SoapSpice helps you follow the thread from ingredient to finished bar—without taking the fun out of figuring it out.</p>
            <div className="feature-links">
              <RouteLink href="/ingredients" className="feature-link">
                <span className="feature-link-icon"><BookOpen size={19} /></span>
                <span><strong>Ingredient field guide</strong><small>Read the why behind your oils and butters.</small></span>
                <ArrowRight size={17} />
              </RouteLink>
              <RouteLink href="/calculators/cold-process-soap" className="feature-link">
                <span className="feature-link-icon warm"><FlaskConical size={19} /></span>
                <span><strong>Build your first bar</strong><small>A straightforward cold-process NaOH formula.</small></span>
                <ArrowRight size={17} />
              </RouteLink>
            </div>
          </div>
        </section>

        <section className="soap-caveat">
          <div className="caveat-mark"><ShieldCheck size={24} /></div>
          <div>
            <span className="soap-eyebrow">Careful by design</span>
            <h2>Useful data. Sources in sight.</h2>
            <p>Ingredient SAP values are source-linked references, not a substitute for checking your supplier’s data. Review every formula and use appropriate cold-process safety practices before making.</p>
          </div>
          <RouteLink href="/ingredients" className="caveat-link">Review ingredients <ChevronDown size={15} /></RouteLink>
        </section>
      </main>

      <footer className="soap-footer">
        <RouteLink href="/" className="footer-brand"><img src={logo} alt="SoapSpice" /></RouteLink>
        <p>Ingredient choices, made clearer.</p>
        <span>NaOH cold-process bars only <i /> Source-linked values need review</span>
      </footer>
    </div>
  );
}