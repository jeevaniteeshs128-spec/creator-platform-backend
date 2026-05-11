const Login = () => (
  <section className="auth-card auth-grid">
    <div>
      <div className="page-heading">
        <span className="mini-note">Login page</span>
        <h1>Welcome back to your creator workspace</h1>
        <p className="page-intro">
          This page is a placeholder only. It shows the routing and layout structure without any
          authentication logic or API integration.
        </p>
      </div>

      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <div className="field-group">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" name="email" type="email" placeholder="hello@studio.com" />
        </div>
        <div className="field-group">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" name="password" type="password" placeholder="••••••••" />
        </div>
        <div className="form-actions">
          <button className="form-button" type="submit">
            Continue
          </button>
        </div>
      </form>
    </div>

    <aside className="helper-card">
      <h2>What this page demonstrates</h2>
      <ul className="helper-list">
        <li>Route-based navigation without a full refresh</li>
        <li>A reusable form layout with simple placeholder controls</li>
        <li>No authentication or backend calls, per the assignment rules</li>
      </ul>
    </aside>
  </section>
);

export default Login;
