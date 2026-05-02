import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role) => {
    await api.updateUserRole(id, role);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This will remove all their data.')) return;
    await api.deleteUser(id);
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: 'var(--text)', fontWeight: 600 }}>{u.name}</div>
                          {u.id === user?.id && (
                            <div style={{ fontSize: 11, color: 'var(--primary)' }}>You</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{u.email}</td>
                    <td>
                      {u.id === user?.id ? (
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      ) : (
                        <select
                          className="form-select"
                          style={{ padding: '4px 28px 4px 8px', fontSize: 12, width: 'auto' }}
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      {u.id !== user?.id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
