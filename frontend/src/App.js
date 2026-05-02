import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import AuthPage from './pages/AuthPage';
import './styles/global.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="loading" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />;
      case 'projects': return <Projects />;
      case 'tasks': return <Tasks />;
      case 'users': return user.role === 'admin' ? <Users /> : <Dashboard setPage={setPage} />;
      default: return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
