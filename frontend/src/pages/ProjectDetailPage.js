import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, isPast, parseISO } from 'date-fns';

const COLS = [
  { key: 'todo', label: 'To Do', color: 'var(--text3)' },
  { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { key: 'in_review', label: 'In Review', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#22c55e' }
];
const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', urgent: '#dc2626' };
const COLORS = ['#7c6ef7','#22c55e','#f59e0b','#3b82f6','#ec4899','#ef4444','#14b8a6','#f97316'];

const inputStyle = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' };
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', marginBottom: 5, fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [tab, setTab] = useState('board');

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data.project)).catch(() => navigate('/projects')).finally(() => setLoading(false));
  }, [id]);

  const myRole = project?.projectMembers?.find(m => m.userId === user?.id)?.role || (project?.ownerId === user?.id ? 'admin' : 'member');
  const isAdmin = myRole === 'admin' || project?.ownerId === user?.id;

  const tasksByStatus = COLS.reduce((acc, col) => {
    acc[col.key] = project?.tasks?.filter(t => t.status === col.key) || [];
    return acc;
  }, {});

  const onTaskCreated = (task) => setProject(p => ({ ...p, tasks: [task, ...(p.tasks || [])] }));
  const onTaskUpdated = (updated) => setProject(p => ({ ...p, tasks: p.tasks.map(t => t.id === updated.id ? updated : t) }));

  if (loading) return <Layout><div style={{ padding: 48, color: 'var(--text2)' }}>Loading...</div></Layout>;
  if (!project) return null;

  return (
    <Layout>
      <div style={{ padding: '32px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: project.color || 'var(--accent)' }} />
            <div>
              <h1 style={{ fontSize: 26, marginBottom: 4 }}>{project.name}</h1>
              {project.description && <p style={{ color: 'var(--text2)', fontSize: 14 }}>{project.description}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {isAdmin && <button onClick={() => setShowMemberModal(true)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}>Manage Members</button>}
            <button onClick={() => setShowTaskModal(true)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Task</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {['board', 'members'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none', color: tab === t ? 'var(--accent2)' : 'var(--text2)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: tab === t ? 600 : 400,
              marginBottom: -1, textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>

        {tab === 'board' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
            {COLS.map(col => (
              <div key={col.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{col.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>{tasksByStatus[col.key].length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tasksByStatus[col.key].map(t => (
                    <TaskCard key={t.id} task={t} members={project.members} isAdmin={isAdmin} onUpdated={onTaskUpdated} projectId={id} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'members' && (
          <div style={{ maxWidth: 600 }}>
            {project.members?.map(m => {
              const membership = project.projectMembers?.find(pm => pm.userId === m.id);
              const memberRole = membership?.role || (project.ownerId === m.id ? 'owner' : 'member');
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS[m.name?.charCodeAt(0) % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{m.name?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.email}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: memberRole === 'admin' ? 'var(--accent-bg)' : 'var(--bg3)', color: memberRole === 'admin' ? 'var(--accent2)' : 'var(--text2)', fontWeight: 500 }}>{memberRole}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showTaskModal && <CreateTaskModal projectId={id} members={project.members} onClose={() => setShowTaskModal(false)} onCreated={(t) => { onTaskCreated(t); setShowTaskModal(false); }} />}
      {showMemberModal && <ManageMembersModal projectId={id} onClose={() => setShowMemberModal(false)} onUpdated={() => { api.get(`/projects/${id}`).then(r => setProject(r.data.project)); }} />}
    </Layout>
  );
};

const TaskCard = ({ task, members, isAdmin, onUpdated, projectId }) => {
  const [expanded, setExpanded] = useState(false);
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';

  const changeStatus = async (status) => {
    try {
      const { data } = await api.patch(`/tasks/project/${projectId}/${task.id}`, { status });
      onUpdated(data.task);
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, flex: 1 }}>{task.title}</p>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[task.priority], flexShrink: 0, marginTop: 4 }} />
      </div>
      {task.assignee && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: COLORS[task.assignee.name?.charCodeAt(0) % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{task.assignee.name?.[0]?.toUpperCase()}</div>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>{task.assignee.name}</span>
        </div>
      )}
      {task.dueDate && <p style={{ fontSize: 11, color: isOverdue ? 'var(--red)' : 'var(--text3)', marginTop: 6 }}>{isOverdue ? '⚠ Overdue · ' : ''}{format(parseISO(task.dueDate), 'MMM d')}</p>}
      {expanded && (
        <div onClick={e => e.stopPropagation()} style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {task.description && <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>{task.description}</p>}
          <select value={task.status} onChange={e => changeStatus(e.target.value)} style={{ fontSize: 12, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text)', cursor: 'pointer' }}>
            {COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      )}
    </div>
  );
};

const CreateTaskModal = ({ projectId, members, onClose, onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assigneeId: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/tasks', { ...form, projectId, assigneeId: form.assigneeId || undefined });
      toast.success('Task created!');
      onCreated(data.task);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460 }}>
        <h2 style={{ fontSize: 18, marginBottom: 20 }}>Add Task</h2>
        <form onSubmit={submit}>
          <Field label="Title *"><input style={inputStyle} value={form.title} onChange={set('title')} placeholder="Task title" required /></Field>
          <Field label="Description"><textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} value={form.description} onChange={set('description')} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Priority">
              <select style={inputStyle} value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </Field>
            <Field label="Status">
              <select style={inputStyle} value={form.status} onChange={set('status')}>
                {COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Due Date"><input style={inputStyle} type="date" value={form.dueDate} onChange={set('dueDate')} /></Field>
            <Field label="Assign To">
              <select style={inputStyle} value={form.assigneeId} onChange={set('assigneeId')}>
                <option value="">Unassigned</option>
                {members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: 11, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>{loading ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageMembersModal = ({ projectId, onClose, onUpdated }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const addMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email, role });
      toast.success('Member added!');
      setEmail('');
      onUpdated();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400 }}>
        <h2 style={{ fontSize: 18, marginBottom: 20 }}>Add Member</h2>
        <form onSubmit={addMember}>
          <Field label="Email"><input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="team@company.com" required /></Field>
          <Field label="Role">
            <select style={inputStyle} value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: 11, cursor: 'pointer' }}>Close</button>
            <button type="submit" disabled={loading} style={{ flex: 2, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: 11, fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
