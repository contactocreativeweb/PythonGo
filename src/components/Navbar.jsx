import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', icon: '🏠', label: 'Inicio', exact: true },
  { to: '/progress', icon: '📊', label: 'Progreso' },
  { to: '/profile', icon: '👤', label: 'Perfil' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
