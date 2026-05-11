import { NavLink } from 'react-router-dom';

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      <div>
        <strong>Creator Studio</strong>
        <p className="card-copy">A routing-first layout for planning posts, launches, and editorial workflows.</p>
      </div>

      <nav className="footer-nav" aria-label="Footer navigation">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
      </nav>
    </div>
  </footer>
);

export default Footer;
