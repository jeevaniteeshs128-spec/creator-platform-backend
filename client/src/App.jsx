import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="projects/:projectId/edit"
            element={
              <ProtectedRoute>
                <EditProject />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
