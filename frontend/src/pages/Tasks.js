import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    api.getAllTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await api.updateTask(id, { status });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.deleteTask(id);
    load();
  };

  const today = new Date().toISOString().split('T')[0];

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'mine') return t.assigned_to === user?.id;
    if (filter === 'overdue') return t.due_date && t.due_date.split('T')[0] < today && t.status !== 'done';
    return t.status === filter;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'mine', label: 'Assigned to Me' },
          { key: 'todo', label: 'To Do' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'review', label: 'In Review' },
          { key: 'done', label: 'Done' },
          { key: 'overdue', label: '⚠️ Overdue' },
        ].map(f => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-title">No tasks found</div>
          <div className="empty-desc">Tasks will appear here once they are created in projects</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(task => {
                  const isOverdue = task.due_date && task.due_date.split('T')[0] < today && task.status !== 'done';
                  return (
                    <tr key={task.id}>
                      <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                        <div>{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                            {task.description.substring(0, 60)}...
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4 }}>
                          {task.project_name}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '4px 28px 4px 8px', fontSize: 12, width: 'auto' }}
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                      <td>{task.assigned_to_name || <span style={{ color: 'var(--text3)' }}>Unassigned</span>}</td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          color: isOverdue ? 'var(--danger)' : 'var(--text3)'
                        }}>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                          {isOverdue && ' ⚠️'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(task.id)}
                          style={{ fontSize: 12 }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
