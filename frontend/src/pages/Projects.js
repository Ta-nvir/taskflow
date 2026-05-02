import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import ProjectDetail from './ProjectDetail';

const ProjectModal = ({ onClose, onSave, project }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState(project?.status || 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Project name is required.');
    setLoading(true);
    try {
      if (project) {
        await api.updateProject(project.id, { name, description, status });
      } else {
        await api.createProject({ name, description });
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
          <div className="modal-title">{project ? 'Edit Project' : 'New Project'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">Project Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website Redesign" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this project about?" />
        </div>
        {project && (
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (project ? 'Update' : 'Create Project')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const load = () => {
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    await api.deleteProject(id);
    load();
  };

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => { setSelectedProject(null); load(); }} />;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <div className="empty-title">No projects yet</div>
          <div className="empty-desc" style={{ marginBottom: 20 }}>Create your first project to get started</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => {
            const progress = p.task_count > 0 ? Math.round((p.done_count / p.task_count) * 100) : 0;
            return (
              <div className="project-card" key={p.id} onClick={() => setSelectedProject(p)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                  {(user?.role === 'admin' || p.owner_id === user?.id) && (
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditProject(p); setShowModal(true); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(p.id, e)}>🗑️</button>
                    </div>
                  )}
                </div>
                <div className="project-card-name">{p.name}</div>
                <div className="project-card-desc">{p.description || 'No description'}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="project-card-meta">
                  <span>👤 {p.owner_name}</span>
                  <span>✅ {p.done_count}/{p.task_count} tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onSave={load}
        />
      )}
    </div>
  );
};

export default Projects;
