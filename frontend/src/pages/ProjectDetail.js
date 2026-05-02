import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#64748b' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'review', label: 'In Review', color: '#8b5cf6' },
  { key: 'done', label: 'Done', color: '#10b981' },
];

const TaskModal = ({ projectId, task, onClose, onSave, members }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.split('T')[0] : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) return setError('Task title is required.');
    setLoading(true);
    try {
      const body = { title, description, priority, status, assigned_to: assignedTo || null, due_date: dueDate || null };
      if (task) {
        await api.updateTask(task.id, body);
      } else {
        await api.createTask(projectId, body);
      }
      onSave();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{task ? 'Edit Task' : 'New Task'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task details" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select className="form-select" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
          </button>
        </div>
      </div>
    </div>
  );
};

const MemberModal = ({ projectId, onClose, onSave }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) return setError('Email is required.');
    setLoading(true);
    try {
      await api.addMember(projectId, { email, role });
      onSave();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Team Member</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectDetail = ({ project, onBack }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');

  const load = async () => {
    try {
      const [tasksData, projData] = await Promise.all([
        api.getProjectTasks(project.id),
        api.getProject(project.id)
      ]);
      setTasks(tasksData);
      setMembers(projData.members || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.deleteTask(id);
    load();
  };

  const handleRemoveMember = async (uid) => {
    if (!window.confirm('Remove this member?')) return;
    await api.removeMember(project.id, uid);
    load();
  };

  const isOwner = project.owner_id === user?.id || user?.role === 'admin';
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
        <div>
          <div className="page-title">{project.name}</div>
          {project.description && <div className="page-subtitle">{project.description}</div>}
        </div>
        <span className={`badge badge-${project.status}`} style={{ marginLeft: 8 }}>{project.status}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['kanban', 'members'].map(tab => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab === 'kanban' ? '📋 Board' : '👥 Members'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
          + Add Task
        </button>
        {isOwner && (
          <button className="btn btn-outline btn-sm" onClick={() => setShowMemberModal(true)}>
            + Add Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : activeTab === 'kanban' ? (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div className="kanban-column" key={col.key}>
                <div className="kanban-col-header">
                  <div className="kanban-col-title" style={{ color: col.color }}>{col.label}</div>
                  <span className="kanban-col-count">{colTasks.length}</span>
                </div>
                {colTasks.map(task => {
                  const isOverdue = task.due_date && task.due_date.split('T')[0] < today && task.status !== 'done';
                  return (
                    <div className="task-card" key={task.id}>
                      <div className="task-card-title">{task.title}</div>
                      {task.description && (
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, lineHeight: 1.4 }}>
                          {task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}
                        </div>
                      )}
                      <div className="task-card-meta">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {task.due_date && (
                          <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
                            📅 {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      {task.assigned_to_name && (
                        <div className="task-assignee" style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
                          👤 {task.assigned_to_name}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => { setEditTask(task); setShowTaskModal(true); }}
                        >Edit</button>
                        {(isOwner || task.created_by === user?.id) && (
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => handleDeleteTask(task.id)}
                          >Delete</button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '24px 0' }}>
                    No tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Team Members ({members.length})</h3>
          </div>
          {members.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No members yet</div></div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th>{isOwner && <th>Action</th>}</tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        {m.name}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{m.email}</td>
                    <td><span className={`badge badge-${m.role}`}>{m.role}</span></td>
                    {isOwner && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.id)}>Remove</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          projectId={project.id}
          task={editTask}
          members={members}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSave={load}
        />
      )}
      {showMemberModal && (
        <MemberModal
          projectId={project.id}
          onClose={() => setShowMemberModal(false)}
          onSave={load}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
