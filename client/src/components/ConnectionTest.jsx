import { useState } from 'react';

const ConnectionTest = () => {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Click the button to verify the proxy and CORS setup.');

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Checking connection through /api/health...');

    try {
      const response = await fetch('/api/health');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      setStatus('success');
      setMessage(data.message || 'Connection succeeded.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Unable to reach the backend.');
    }
  };

  return (
    <section className="section-card connection-card">
      <div className="section-heading">
        <span className="mini-note">Connectivity test</span>
        <h2>Frontend and backend connection check</h2>
        <p>
          This component calls the backend through the Vite proxy using a relative <strong>/api</strong>{' '}
          request.
        </p>
      </div>

      <div className={`connection-status connection-status-${status}`} aria-live="polite">
        {message}
      </div>

      <div className="form-actions">
        <button className="form-button" type="button" onClick={testConnection}>
          Test connection
        </button>
      </div>
    </section>
  );
};

export default ConnectionTest;
