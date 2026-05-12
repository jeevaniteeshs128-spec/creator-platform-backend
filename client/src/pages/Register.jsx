import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
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
      if (!name || !email || !password) {
        const message = 'Please fill in all fields';
        setError(message);
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        const message = 'Password must be at least 6 characters';
        setError(message);
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      // Call register from AuthContext
      const result = await register(name, email, password);

      if (result.success) {
        // Redirect to dashboard on successful registration
        navigate('/dashboard');
      } else {
        const message = result.error || 'Registration failed';
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      const message = err.message || 'An error occurred during registration';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card auth-grid">
      <div>
        <div className="page-heading">
          <span className="mini-note">Register page</span>
          <h1>Set up a new creator account</h1>
          <p className="page-intro">
            Create an account to get started with your creator workspace.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div className="field-group">
            <label htmlFor="register-name">Display name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="Avery Writes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting || loading}
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="avery@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || loading}
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password (min 6 characters)"
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
              {isSubmitting || loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Already have an account? <a href="/login">Sign in here</a>
        </p>
      </div>

      <aside className="helper-card">
        <h2>About registration</h2>
        <ul className="helper-list">
          <li>Create a new account with name, email, and password</li>
          <li>Password must be at least 6 characters</li>
          <li>Your login session will be saved automatically</li>
          <li>Access protected content after registration</li>
        </ul>
      </aside>
    </section>
  );
};

export default Register;
