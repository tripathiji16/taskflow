import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../utils/api';
import { format, isPast, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };
const STATUS_COLORS = { todo: 'var(--text3)', in_progress: '#3b82f6', in_review: '#f59e0b', done: '#22c55e' };
const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', urgent: '#dc2626' };
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };

export const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/tasks/dashboard').then(r => setTasks(r.data.myTasks || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const updateStatus = async (task, status) => {
    try {
      const { data } = await api.patch(`/tasks/project/${task.project?.id}/${task.id}`, { status });
      setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: data.task.status } : t));
    } catch { toast.error('Failed to update'); }
  };

  return (
    <Layout>
      <div style={{ padding: '40px 48px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>My Tasks</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Tasks assigned to you across all projects</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[['all', 'All'], ['todo', 'To Do'], ['in_progress', 'In Progress'], ['in_review', 'In Review'], ['done', 'Done']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              background: filter === v ? 'var(--accent-bg)' : 'var(--bg2)',
              border: `1px solid ${filter === v ? 'var(--accent)' : 'var(--border)'}`,
              color: filter === v ? 'var(--accent2)' : 'var(--text2)',
              borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: filter === v ? 600 : 400
            }}>{l}</button>
          ))}
        </div>

        {loading ? <p style={{ color: 'var(--text2)' }}>Loading...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text2)' }}><div style={{ fontSize: 40, marginBottom: 12 }}>✓</div><p>No tasks in this category</p></div>}
            {filtered.map(task => {
              const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';
              return (
                <div key={task.id} style={{ background: 'var(--bg2)', border: `1px solid ${isOverdue ? 'var(--red)' : 'var(--border)'}`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {task.project && (
                        <Link to={`/projects/${task.project.id}`} style={{ fontSize: 12, color: 'var(--accent2)' }}>
                          ◈ {task.project.name}
                        </Link>
                      )}
                      <span style={{ fontSize: 11, color: PRIORITY_COLORS[task.priority] }}>{PRIORITY_LABELS[task.priority]}</span>
                      {task.dueDate && <span style={{ fontSize: 11, color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>{isOverdue ? '⚠ ' : ''}{format(parseISO(task.dueDate), 'MMM d, yyyy')}</span>}
                    </div>
                  </div>
                  <select value={task.status} onChange={e => updateStatus(task, e.target.value)} onClick={e => e.stopPropagation()} style={{ fontSize: 12, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', color: STATUS_COLORS[task.status], cursor: 'pointer', outline: 'none' }}>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
