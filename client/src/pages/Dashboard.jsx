import { useAuth } from '../hooks/useAuth';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 4,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadProjects = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/projects', {
        params: {
          page: currentPage,
          limit: 4,
        },
      });

      setProjects(data.items || []);
      setPagination(data.pagination || {
        currentPage,
        pageSize: 4,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load your projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects(page);
  }, [loadProjects, page]);

  const handlePrevious = () => {
    if (pagination.hasPreviousPage && !loading) {
      setActionMessage('');
      setPage((currentPage) => currentPage - 1);
    }
  };

  const handleNext = () => {
    if (pagination.hasNextPage && !loading) {
      setActionMessage('');
      setPage((currentPage) => currentPage + 1);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(`Delete "${project.title}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    const previousProjects = projects;
    const previousPagination = pagination;

    setDeletingId(project.id);
    setError('');
    setActionMessage('');
    setProjects((currentProjects) => currentProjects.filter((item) => item.id !== project.id));
    setPagination((currentPagination) => ({
      ...currentPagination,
      totalItems: Math.max(currentPagination.totalItems - 1, 0),
    }));

    try {
      await api.delete(`/projects/${project.id}`);
      setActionMessage('Project deleted successfully.');

      if (previousProjects.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await loadProjects(page);
      }
    } catch (requestError) {
      setProjects(previousProjects);
      setPagination(previousPagination);
      setError(requestError?.response?.data?.message || 'Unable to delete project.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <span className="mini-note">Dashboard</span>
        <h1>Welcome, {user?.name || 'Creator'}!</h1>
        <p className="panel-copy">
          You are authenticated. This dashboard shows your creator workspace projects.
          Your email: <strong>{user?.email || 'Not available'}</strong>
        </p>
        <div className="content-actions">
          <Link className="button button-primary" to="/create">
            Create project
          </Link>
        </div>
      </div>

      {loading && <div className="status-banner">Loading your projects...</div>}

      {actionMessage && !loading && !error && (
        <div className="status-banner status-banner-success">{actionMessage}</div>
      )}

      {error && !loading && <div className="status-banner status-banner-error">{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to start building paginated content.</p>
          <Link className="button button-primary" to="/create">
            Create your first project
          </Link>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="detail-card project-card" key={project.id}>
                <div className="project-card-header">
                  <h3>{project.title}</h3>
                  <span className={`status-pill status-pill-${project.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {project.status}
                  </span>
                </div>
                <p>{project.description}</p>
                <small className="project-meta">
                  Created {new Date(project.createdAt).toLocaleString()}
                </small>
                <div className="project-actions">
                  <Link className="button button-secondary button-compact" to={`/projects/${project.id}/edit`}>
                    Edit
                  </Link>
                  <button
                    className="button button-danger button-compact"
                    type="button"
                    onClick={() => handleDelete(project)}
                    disabled={deletingId === project.id}
                  >
                    {deletingId === project.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination-controls">
            <button
              className="button button-secondary"
              type="button"
              onClick={handlePrevious}
              disabled={!pagination.hasPreviousPage || loading}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages || 1} - {pagination.totalItems} total
            </span>
            <button
              className="button button-secondary"
              type="button"
              onClick={handleNext}
              disabled={!pagination.hasNextPage || loading}
            >
              Next
            </button>
          </div>
        </>
      )}

      <div style={{ marginTop: '22px' }}>
        <div className="panel-heading">
          <h2>Planning notes</h2>
          <p className="panel-copy">A lightweight space for updates that supports the project workflow.</p>
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
