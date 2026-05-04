import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../utils/api';
import toast from 'react-hot-toast';

const statusColors = { active: '#22c55e', on_hold: '#f59e0b', completed: '#7c6ef7', archived: 'var(--text3)' };
const statusLabels = { active: 'Active', on_hold: 'On Hold', completed: 'Completed', archived: 'Archived' };

const COLORS = ['#7c6ef7','#22c55e','#f59e0b','#3b82f6','#ec4899','#ef4444','#14b8a6','#f97316'];

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects)).finally(() => setLoading(false));
  }, []);

  const progress = (p) => {
    const total = p.tasks?.length || 0;
    if (!total) return 0;
    const done = p.tasks?.filter(t => t.status === 'done').length || 0;
    return Math.round((done / total) * 100);
  };

  return (
    <Layout>
      <div style={{ padding: '40px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>Projects</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius)', padding: '10px 20px', fontWeight: 600, fontSize: 14,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>+ New Project</button>
        </div>

        {loading ? <p style={{ color: 'var(--text2)' }}>Loading projects...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {projects.map(p => {
              const pct = progress(p);
              return (
                <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: 24,
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'pointer'
                  }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color || '#7c6ef7' }} />
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</h3>
                      </div>
                      <span style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 500,
                        background: statusColors[p.status] + '20', color: statusColors[p.status]
                      }}>{statusLabels[p.status]}</span>
                    </div>
                    {p.description && <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16, lineHeight: 1.5, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text2)' }}>
                        <span>Progress</span><span>{pct}%</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: p.color || 'var(--accent)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: -4 }}>
                        {p.members?.slice(0, 4).map((m, i) => (
                          <div key={m.id} style={{ width: 26, height: 26, borderRadius: '50%', background: COLORS[m.name?.charCodeAt(0) % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', border: '2px solid var(--bg2)', marginLeft: i > 0 ? -6 : 0 }}>
                            {m.name?.[0]?.toUpperCase()}
                          </div>
                        ))}
                        {p.members?.length > 4 && <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text2)', border: '2px solid var(--bg2)', marginLeft: -6 }}>+{p.members.length - 4}</div>}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{p.tasks?.length || 0} tasks</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text2)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
                <p style={{ marginBottom: 16, fontSize: 15 }}>No projects yet. Create your first one!</p>
                <button onClick={() => setShowModal(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>Create Project</button>
              </div>
            )}
          </div>
        )}
      </div>
      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={(p) => { setProjects(ps => [p, ...ps]); setShowModal(false); navigate(`/projects/${p.id}`); }} />}
    </Layout>
  );
};

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '', color: '#7c6ef7', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      toast.success('Project created!');
      onCreated(data.project);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 480 }}>
        <h2 style={{ fontSize: 20, marginBottom: 24 }}>New Project</h2>
        <form onSubmit={submit}>
          <Field label="Project Name" required>
            <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Marketing Campaign Q2" required />
          </Field>
          <Field label="Description">
            <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="What's this project about?" />
          </Field>
          <Field label="Due Date">
            <input style={inputStyle} type="date" value={form.dueDate} onChange={set('dueDate')} />
          </Field>
          <Field label="Color">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid var(--text)' : '3px solid transparent', transition: 'border-color 0.15s' }} />
              ))}
            </div>
          </Field>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 'var(--radius)', padding: 12, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: 12, fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, children, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{label}{required && ' *'}</label>
    {children}
  </div>
);

const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' };
