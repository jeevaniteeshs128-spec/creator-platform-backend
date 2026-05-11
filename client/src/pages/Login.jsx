import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please fill in all fields');
        setIsSubmitting(false);
        return;
      }

      // Call login from AuthContext
      const result = await login(email, password);

      if (result.success) {
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card auth-grid">
      <div>
        <div className="page-heading">
          <span className="mini-note">Login page</span>
          <h1>Welcome back to your creator workspace</h1>
          <p className="page-intro">
            Sign in to access your dashboard and manage your content.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div className="field-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="hello@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || loading}
            />
          </div>

          <div className="field-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || loading}
            />
          </div>

          <div className="form-actions">
            <button 
              className="form-button" 
              type="submit"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? 'Signing in...' : 'Continue'}
            </button>
          </div>
        </form>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Don't have an account? <a href="/register">Sign up here</a>
        </p>
      </div>

      <aside className="helper-card">
        <h2>Test credentials</h2>
        <ul className="helper-list">
          <li>First, register a new account</li>
          <li>Then use those credentials to login</li>
          <li>Your session will persist across page refreshes</li>
          <li>Check the Dashboard to see authenticated content</li>
        </ul>
      </aside>
    </section>
  );
};

export default Login;
