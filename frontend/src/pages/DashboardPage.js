import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { format, isPast, parseISO } from 'date-fns';

const priorityColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', urgent: '#dc2626' };
const statusColors = { todo: 'var(--text3)', in_progress: '#3b82f6', in_review: '#f59e0b', done: '#22c55e' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' };

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 16
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</div>
    </div>
  </div>
);

const TaskRow = ({ task }) => {
  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done';
  return (
    <Link to={`/projects/${task.project?.id}`} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0', borderBottom: '1px solid var(--border)',
      textDecoration: 'none'
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[task.priority], flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
          {task.project?.name}
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: statusColors[task.status] + '20', color: statusColors[task.status] }}>{statusLabels[task.status]}</div>
        {task.dueDate && (
          <div style={{ fontSize: 11, color: isOverdue ? 'var(--red)' : 'var(--text3)', marginTop: 3 }}>
            {isOverdue ? '⚠ ' : ''}{format(parseISO(task.dueDate), 'MMM d')}
          </div>
        )}
      </div>
    </Link>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout>
      <div style={{ padding: '40px 48px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>Here's what's on your plate today</p>
        </div>

        {/* Stats */}
        {loading ? (
          <p style={{ color: 'var(--text2)' }}>Loading...</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
              <StatCard label="Total Projects" value={data?.stats?.totalProjects || 0} color="var(--accent)" icon="◈" />
              <StatCard label="My Pending Tasks" value={data?.stats?.myPendingTasks || 0} color="#3b82f6" icon="✓" />
              <StatCard label="Completed Tasks" value={data?.stats?.completedTasks || 0} color="#22c55e" icon="★" />
              <StatCard label="Overdue Tasks" value={data?.stats?.overdueTasks || 0} color="#ef4444" icon="⚠" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* My Tasks */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                <h2 style={{ fontSize: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  My Tasks
                  <Link to="/my-tasks" style={{ fontSize: 12, color: 'var(--accent2)', fontWeight: 400 }}>View all →</Link>
                </h2>
                {data?.myTasks?.length === 0 ? (
                  <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No pending tasks 🎉</p>
                ) : (
                  data?.myTasks?.slice(0, 6).map(t => <TaskRow key={t.id} task={t} />)
                )}
              </div>

              {/* Overdue */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                <h2 style={{ fontSize: 16, marginBottom: 20, color: data?.overdueTasks?.length > 0 ? 'var(--red)' : 'var(--text)' }}>
                  Overdue Tasks
                  {data?.overdueTasks?.length > 0 && <span style={{ fontSize: 12, background: 'var(--red-bg)', color: 'var(--red)', padding: '2px 8px', borderRadius: 20, marginLeft: 8 }}>{data.overdueTasks.length}</span>}
                </h2>
                {data?.overdueTasks?.length === 0 ? (
                  <p style={{ color: 'var(--text2)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No overdue tasks ✅</p>
                ) : (
                  data?.overdueTasks?.slice(0, 6).map(t => <TaskRow key={t.id} task={t} />)
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
