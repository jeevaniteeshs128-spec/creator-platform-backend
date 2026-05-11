const scheduleItems = [
  {
    title: 'Morning newsletter draft',
    description: 'Ready for review at 9:00 AM with a clear headline and intro.',
  },
  {
    title: 'Launch reel script',
    description: 'Outline completed, waiting on visuals and final approval.',
  },
  {
    title: 'Community post',
    description: 'Queued for later today to keep the audience engaged.',
  },
];

const Dashboard = () => (
  <section className="dashboard-panel">
    <div className="panel-heading">
      <span className="mini-note">Dashboard</span>
      <h1>Creator workspace overview</h1>
      <p className="panel-copy">
        This placeholder dashboard shows where future metrics, planning tools, and publishing
        controls can live.
      </p>
    </div>

    <div className="detail-grid">
      <article className="detail-card">
        <h3>Publishing status</h3>
        <p>Three pieces are scheduled, one is in review, and two ideas are still in draft.</p>
      </article>
      <article className="detail-card">
        <h3>Audience pulse</h3>
        <p>Engagement is trending upward on short-form updates and behind-the-scenes posts.</p>
      </article>
      <article className="detail-card">
        <h3>Team notes</h3>
        <p>Use this area later for comments, approvals, and handoff reminders.</p>
      </article>
    </div>

    <div style={{ marginTop: '22px' }}>
      <div className="panel-heading">
        <h2>Upcoming schedule</h2>
        <p className="panel-copy">A simple layout for content tracking and planning.</p>
      </div>
      <div className="schedule-list">
        {scheduleItems.map((item) => (
          <article className="schedule-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Dashboard;
