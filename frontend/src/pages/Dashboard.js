import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ setPage }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const tasksByStatus = stats?.tasksByStatus || {};
  const total = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: '📁', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'To Do', value: tasksByStatus.todo || 0, icon: '📋', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
    { label: 'In Progress', value: tasksByStatus.in_progress || 0, icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Completed', value: tasksByStatus.done || 0, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</div>
          <div className="page-subtitle">Here's what's happening with your projects</div>
        </div>
        <button className="btn btn-primary" onClick={() => setPage('projects')}>
          + New Project
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ '--stat-color': s.color, '--stat-bg': s.bg }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Task Progress */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>
            Task Overview
          </h3>
          {total === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">📋</div>
              <div className="empty-title">No tasks yet</div>
            </div>
          ) : (
            <div>
              {[
                { key: 'todo', label: 'To Do', color: '#64748b' },
                { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
                { key: 'review', label: 'In Review', color: '#8b5cf6' },
                { key: 'done', label: 'Done', color: '#10b981' },
              ].map(s => {
                const count = tasksByStatus[s.key] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={s.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: 'var(--text2)' }}>{s.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: s.color }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: s.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, fontSize: 16, color: 'var(--danger)' }}>
            ⚠️ Overdue Tasks
          </h3>
          {!stats?.overdueTasks?.length ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon">🎉</div>
              <div className="empty-title">All caught up!</div>
              <div className="empty-desc">No overdue tasks</div>
            </div>
          ) : (
            <div className="overdue-list">
              {stats.overdueTasks.slice(0, 5).map(task => (
                <div className="overdue-item" key={task.id}>
                  <div>
                    <div className="overdue-title">{task.title}</div>
                    <div className="overdue-project">{task.project_name}</div>
                  </div>
                  <div className="overdue-date">
                    {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>
          Recent Tasks
        </h3>
        {!stats?.recentTasks?.length ? (
          <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No tasks yet</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map(task => (
                  <tr key={task.id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{task.title}</td>
                    <td>{task.project_name}</td>
                    <td><span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span></td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td>{task.assigned_to_name || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
