import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import getErrorMessage from '../utils/errorMessage';

const EditProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get(`/projects/${projectId}`);
        const project = data.project;

        setTitle(project.title || '');
        setDescription(project.description || '');
        setStatus(project.status || 'draft');
        setProjectLoaded(true);
      } catch (requestError) {
        const message = getErrorMessage(requestError, 'Unable to load this project.');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      const message = 'Please provide a title and description.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setSaving(true);
      await api.put(`/projects/${projectId}`, {
        title: title.trim(),
        description: description.trim(),
        status,
      });

      setSuccess('Project updated successfully.');
      toast.success('Project updated successfully.');
      navigate('/dashboard');
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Unable to update project.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="auth-card auth-grid">
      <div>
        <div className="page-heading">
          <span className="mini-note">Edit content</span>
          <h1>Update your project</h1>
          <p className="page-intro">
            Only the owner can load and update this project.
          </p>
        </div>

        {loading && <div className="status-banner">Loading project details...</div>}

        {!loading && error && <div className="form-error">{error}</div>}
        {!loading && success && <div className="status-banner status-banner-success">{success}</div>}

        {!loading && projectLoaded && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="project-title">Title</label>
              <input
                id="project-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field-group">
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="field-group">
              <label htmlFor="project-status">Status</label>
              <select
                id="project-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={saving}
              >
                <option value="draft">Draft</option>
                <option value="in progress">In Progress</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="form-button" type="submit" disabled={saving}>
                {saving ? 'Saving changes...' : 'Save changes'}
              </button>
              <Link className="button button-secondary" to="/dashboard">
                Back to dashboard
              </Link>
            </div>
          </form>
        )}

        {!loading && !projectLoaded && error && (
          <div className="form-actions form-actions-spaced">
            <Link className="button button-secondary" to="/dashboard">
              Back to dashboard
            </Link>
          </div>
        )}
      </div>

      <aside className="helper-card">
        <h2>Ownership check</h2>
        <ul className="helper-list">
          <li>The edit form fetches the project by ID before rendering.</li>
          <li>The API rejects requests from users who do not own the project.</li>
          <li>Errors are displayed instead of showing an empty or broken form.</li>
        </ul>
      </aside>
    </section>
  );
};

export default EditProject;
