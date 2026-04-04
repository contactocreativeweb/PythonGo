import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import lessons from '../data/lessons.json';

const BADGES = [
  { id: 'first_lesson', icon: '🌱', name: 'Primera lección', req: (s) => Object.keys(s.completedLessons).length >= 1 },
  { id: 'five_lessons', icon: '📚', name: '5 lecciones', req: (s) => Object.keys(s.completedLessons).length >= 5 },
  { id: 'all_lessons', icon: '🏆', name: 'Módulo completo', req: (s, modules) => modules.some(m => m.lessons.every(l => s.completedLessons[l.id])) },
  { id: 'streak_3', icon: '🔥', name: 'Racha de 3', req: (s) => s.streak >= 3 },
  { id: 'xp_50', icon: '⚡', name: '50 XP', req: (s) => s.xp >= 50 },
  { id: 'xp_100', icon: '💎', name: '100 XP', req: (s) => s.xp >= 100 },
  { id: 'xp_200', icon: '🌟', name: '200 XP', req: (s) => s.xp >= 200 },
  { id: 'xp_500', icon: '👑', name: '500 XP', req: (s) => s.xp >= 500 },
  { id: 'perfect', icon: '💯', name: 'Todas las lecciones', req: (s) => Object.keys(s.completedLessons).length >= 20 },
];

export default function ProfilePage() {
  const { state, toggleDarkMode } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const modules = lessons.modules;

  const completedTotal = Object.keys(state.completedLessons).length;
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);

  const getLevel = (xp) => {
    if (xp >= 500) return 'Experto 🏆';
    if (xp >= 200) return 'Avanzado 🥇';
    if (xp >= 100) return 'Intermedio 🥈';
    return 'Principiante 🌱';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: 80 }}>
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : '🐍'}
        </div>
        <div className="profile-name">{user?.displayName || user?.email?.split('@')[0] || 'Pythonista Invitado'}</div>
        <div className="profile-xp">{getLevel(state.xp)}</div>
        <div style={{ marginTop: 16 }}>
          <div className="xp-badge" style={{ display: 'inline-flex' }}>
            ⚡ {state.xp} XP
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div style={{ padding: '0 16px 20px', display: 'flex', gap: 10, justifyContent: 'center' }}>
        {!user ? (
          <button 
            onClick={() => navigate('/auth')}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: 14 }}
          >
            Inicia Sesión para Guardar
          </button>
        ) : (
          <button 
            onClick={handleSignOut}
            className="btn btn-ghost"
            style={{ padding: '10px 24px', fontSize: 13, borderColor: '#ef444433', color: '#f87171' }}
          >
            Cerrar Sesión
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px 20px' }}>
        {[
          { icon: '🔥', value: state.streak, label: 'Racha' },
          { icon: '✅', value: completedTotal, label: 'Lecciones' },
          { icon: '📊', value: `${totalLessons > 0 ? Math.round((completedTotal/totalLessons)*100) : 0}%`, label: 'Progreso' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ flex: 1, padding: '14px 10px', textAlign: 'center' }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="section-label">LOGROS</div>
      <div className="badges-grid">
        {BADGES.map(badge => {
          const unlocked = badge.req(state, modules);
          return (
            <div key={badge.id} className={`badge-card ${unlocked ? 'unlocked' : ''}`}>
              <div className="badge-icon" style={{ opacity: unlocked ? 1 : 0.3 }}>
                {badge.icon}
              </div>
              <div className="badge-name">
                {unlocked ? badge.name : '???'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings */}
      <div className="section-label" style={{ marginTop: 8 }}>CONFIGURACIÓN</div>
      <div style={{ padding: '0 16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>{state.darkMode ? '🌙' : '☀️'}</span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>
              Modo {state.darkMode ? 'oscuro' : 'claro'}
            </span>
          </div>
          <button
            onClick={toggleDarkMode}
            style={{
              width: 52,
              height: 28,
              borderRadius: 100,
              border: 'none',
              background: state.darkMode ? 'var(--accent)' : 'var(--bg-glass)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.3s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3, 
                left: state.darkMode ? 'calc(100% - 25px)' : 3,
                width: 22, height: 22,
                borderRadius: '50%',
                background: 'white',
                transition: 'left 0.3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

      </div>
    </div>
  );
}
