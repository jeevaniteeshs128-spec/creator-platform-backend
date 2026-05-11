import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/home');
    }
  };

  const navItems = [
    { to: '/home', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];

  return (
    <header className="site-header">
      <NavLink className="brand-mark" to="/home" aria-label="Go to Creator Studio home page">
        <strong>Creator Studio</strong>
        <span>Frontend foundation for a modern creator platform</span>
      </NavLink>

      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => {
          // Hide login/register if authenticated
          if (isAuthenticated && (item.to === '/login' || item.to === '/register')) {
            return null;
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          );
        })}

        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#b45309',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
