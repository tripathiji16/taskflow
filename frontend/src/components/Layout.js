import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/projects', icon: '◈', label: 'Projects' },
  { to: '/my-tasks', icon: '✓', label: 'My Tasks' }
];

const avatarColors = ['#7c6ef7','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899'];
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            <span style={{ fontSize: 18, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              color: isActive ? 'var(--accent2)' : 'var(--text2)',
              textDecoration: 'none'
            })}>
              <span style={{ fontSize: 16, opacity: 0.85 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)', position: 'relative' }}>
          <button onClick={() => setShowMenu(m => !m)} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            background: 'transparent', border: 'none', padding: '8px 10px',
            borderRadius: 8, cursor: 'pointer', color: 'var(--text)', textAlign: 'left'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: getColor(user?.name), display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0
            }}>{getInitials(user?.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute', bottom: '72px', left: 12, right: 12,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
            }}>
              <button onClick={handleLogout} style={{
                display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left',
                background: 'none', border: 'none', color: 'var(--red)', fontSize: 14, cursor: 'pointer'
              }}>Sign out</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
};

export const getInitialsAvatar = (name, size = 32) => ({
  width: size, height: size, borderRadius: '50%',
  background: getColor(name), display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#fff'
});

export { getInitials, getColor };
