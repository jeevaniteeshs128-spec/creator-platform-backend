import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import api from '../services/api';

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

const Dashboard = () => {
  const { user } = useAuth();
  const [secureMessage, setSecureMessage] = useState('Loading protected data...');

  useEffect(() => {
    let isMounted = true;

    const loadProtectedData = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        if (isMounted) {
          setSecureMessage(data.message || 'Protected data loaded.');
        }
      } catch (error) {
        if (isMounted) {
          setSecureMessage(error?.response?.data?.message || 'Unable to load protected data.');
        }
      }
    };

    loadProtectedData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <span className="mini-note">Dashboard</span>
        <h1>Welcome, {user?.name || 'Creator'}!</h1>
        <p className="panel-copy">
          You are authenticated. This dashboard shows your creator workspace overview.
          Your email: <strong>{user?.email || 'Not available'}</strong>
        </p>
      </div>

      <div className="detail-grid">
        <article className="detail-card">
          <h3>Account Status</h3>
          <p>✓ You are logged in and authenticated to the platform.</p>
        </article>
        <article className="detail-card">
          <h3>Protected API status</h3>
          <p>{secureMessage}</p>
        </article>
        <article className="detail-card">
          <h3>Publishing status</h3>
          <p>Three pieces are scheduled, one is in review, and two ideas are still in draft.</p>
        </article>
        <article className="detail-card">
          <h3>Audience pulse</h3>
          <p>Engagement is trending upward on short-form updates and behind-the-scenes posts.</p>
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
};

export default Dashboard;
