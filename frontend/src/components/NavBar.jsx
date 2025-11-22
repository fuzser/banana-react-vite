// src/components/NavBar.jsx
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🎨', label: '生成' },
    { path: '/video', icon: '🎬', label: '视频生成' },
    { path: '/gallery', icon: '🖼️', label: '画廊' },
    { path: '/settings', icon: '⚙️', label: '设置' }
  ];

  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <span className="brand-icon">🐂🌧</span>
        <span className="brand-text">Demo</span>
      </div>
      
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="nav-footer">
        <div className="version">v1.0.0</div>
      </div>
    </nav>
  );
};

export default NavBar;