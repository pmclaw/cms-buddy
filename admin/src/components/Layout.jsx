import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--color-bg)', overflow: 'hidden'
      }}>
        <Header
          onToggleSidebar={() => setCollapsed((c) => !c)}
          collapsed={collapsed}
        />
        <main style={{ flex: 1, overflow: 'auto', background: '#F5F6F8' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
