import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import getErrorMessage from '../utils/errorMessage';

const CreateProject = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      const message = 'Please provide a title and description.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      await api.post('/projects', {
        title: title.trim(),
        description: description.trim(),
        status,
      });

      navigate('/dashboard');
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Unable to create project.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card auth-grid">
      <div>
        <div className="page-heading">
          <span className="mini-note">Create content</span>
          <h1>Publish a new project</h1>
          <p className="page-intro">
            Create a user-owned project that will appear in your dashboard with paginated loading.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field-group">
            <label htmlFor="project-title">Title</label>
            <input
              id="project-title"
              type="text"
              placeholder="Launch content calendar"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field-group">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              placeholder="Plan the next content sprint, deadlines, and publishing steps."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field-group">
            <label htmlFor="project-status">Status</label>
            <select
              id="project-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={loading}
            >
              <option value="draft">Draft</option>
              <option value="in progress">In Progress</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="form-actions">
            <button className="form-button" type="submit" disabled={loading}>
              {loading ? 'Saving project...' : 'Create project'}
            </button>
            <Link className="button button-secondary" to="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </form>
      </div>

      <aside className="helper-card">
        <h2>How it works</h2>
        <ul className="helper-list">
          <li>The project is linked to your logged-in account.</li>
          <li>The dashboard loads your projects using page and limit.</li>
          <li>All requests are sent through the centralized Axios client.</li>
        </ul>
      </aside>
    </section>
  );
};

export default CreateProject;
