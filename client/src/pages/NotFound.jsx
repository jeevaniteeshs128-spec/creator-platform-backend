import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="not-found-card">
    <span className="mini-note">404</span>
    <h1>That page does not exist</h1>
    <p>
      Use the navigation above to return to the main creator pages, or go back to the front page
      to continue exploring the foundation.
    </p>
    <div className="not-found-actions">
      <Link className="button button-primary" to="/home">
        Back to home
      </Link>
      <Link className="button button-secondary" to="/dashboard">
        Open dashboard
      </Link>
    </div>
  </section>
);

export default NotFound;
