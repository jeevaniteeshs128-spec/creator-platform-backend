import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

const Header = () => (
  <header className="site-header">
    <NavLink className="brand-mark" to="/home" aria-label="Go to Creator Studio home page">
      <strong>Creator Studio</strong>
      <span>Frontend foundation for a modern creator platform</span>
    </NavLink>

    <nav className="site-nav" aria-label="Primary navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </header>
);

export default Header;
