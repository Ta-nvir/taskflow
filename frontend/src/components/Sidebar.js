import React from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ page, setPage }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { icon: '📊', label: 'Dashboard', key: 'dashboard' },
    { icon: '📁', label: 'Projects', key: 'projects' },
    { icon: '✅', label: 'My Tasks', key: 'tasks' },
  ];

  const adminItems = [
    { icon: '👥', label: 'Users', key: 'users' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>TaskFlow</h1>
        <span>Project Management</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Menu</div>
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-link ${page === item.key ? 'active' : ''}`}
            onClick={() => setPage(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="nav-section-title" style={{ marginTop: 8 }}>Admin</div>
            {adminItems.map(item => (
              <button
                key={item.key}
                className={`nav-link ${page === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className={`user-role ${user?.role}`}>{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
