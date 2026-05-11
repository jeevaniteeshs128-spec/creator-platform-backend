const Register = () => (
  <section className="auth-card auth-grid">
    <div>
      <div className="page-heading">
        <span className="mini-note">Register page</span>
        <h1>Set up a new creator account</h1>
        <p className="page-intro">
          This is a static onboarding screen that keeps the project focused on structure,
          navigation, and page organization.
        </p>
      </div>

      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <div className="field-group">
          <label htmlFor="register-name">Display name</label>
          <input id="register-name" name="name" type="text" placeholder="Avery Writes" />
        </div>
        <div className="field-group">
          <label htmlFor="register-email">Email</label>
          <input id="register-email" name="email" type="email" placeholder="avery@studio.com" />
        </div>
        <div className="field-group">
          <label htmlFor="register-password">Password</label>
          <input id="register-password" name="password" type="password" placeholder="Create a password" />
        </div>
        <div className="form-actions">
          <button className="form-button" type="submit">
            Create account
          </button>
        </div>
      </form>
    </div>

    <aside className="helper-card">
      <h2>Suggested next features</h2>
      <ul className="helper-list">
        <li>Profile setup flow</li>
        <li>Draft and publishing workspace</li>
        <li>Analytics overview cards</li>
      </ul>
    </aside>
  </section>
);

export default Register;
