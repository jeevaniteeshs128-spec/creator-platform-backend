import { Link } from 'react-router-dom';
import ConnectionTest from '../components/ConnectionTest';

const features = [
  {
    title: 'Editorial planning',
    description: 'Map topics, deadlines, and campaign ideas before anything goes live.',
  },
  {
    title: 'Content snapshots',
    description: 'Keep a quick view of what is scheduled, published, or waiting on review.',
  },
  {
    title: 'Creator workflow',
    description: 'Move from draft to launch with simple navigation across the foundation pages.',
  },
];

const Home = () => (
  <>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Creator platform foundation</span>
        <h1>Plan content like a studio, not a spreadsheet.</h1>
        <p>
          This frontend foundation gives you client-side routing, reusable layout components, and
          placeholder pages that can grow into a full creator workflow later.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/register">
            Start your workspace
          </Link>
          <Link className="button button-secondary" to="/dashboard">
            View dashboard
          </Link>
        </div>
      </div>

      <aside className="hero-aside">
        <div className="aside-card">
          <span className="mini-note">Today&apos;s focus</span>
          <h2>One place for drafts, launches, and audience notes.</h2>
          <div className="metric-grid" style={{ marginTop: '18px' }}>
            <div className="metric">
              <strong>12</strong>
              <span>draft ideas ready</span>
            </div>
            <div className="metric">
              <strong>3</strong>
              <span>launches this week</span>
            </div>
            <div className="metric">
              <strong>8.4k</strong>
              <span>estimated views</span>
            </div>
            <div className="metric">
              <strong>94%</strong>
              <span>on-time publishing</span>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <ConnectionTest />

    <section className="section-card">
      <div className="section-heading">
        <span className="mini-note">What is included</span>
        <h2>Reusable pieces that support the assignment requirements</h2>
        <p>
          The structure below is intentionally simple: layout components, route pages, and a clean
          project split under <strong>client/src</strong>.
        </p>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  </>
);

export default Home;
