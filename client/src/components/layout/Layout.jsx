import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

const Layout = () => (
  <div className="app-shell">
    <Header />
    <main className="content-wrap">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
