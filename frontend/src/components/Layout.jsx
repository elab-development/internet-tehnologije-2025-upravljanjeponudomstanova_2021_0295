import { Link } from 'react-router-dom';

export default function Layout({ title, children }) {
  return (
    <div style={{ fontFamily: 'system-ui, Arial', minHeight: '100vh', background: '#f6f7fb' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 700, color: '#111827' }}>
            Ponuda stanova
          </Link>
          <span style={{ color: '#6b7280' }}>{title}</span>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
        {children}
      </main>
    </div>
  );
}
