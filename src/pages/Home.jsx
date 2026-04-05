import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import lessons from '../data/lessons.json';

export default function Home() {
  const { state, toggleDarkMode, getModuleProgress } = useApp();
  const navigate = useNavigate();

  const { user } = useAuth();
  const totalLessons = lessons.modules.reduce((a, m) => a + m.lessons.length, 0);
  const completedTotal = Object.keys(state.completedLessons).length;

  return (
    <div className="page">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="logo">Python<span>Go</span></div>
        <div className="top-actions">
          <div className="streak-badge">
            🔥 {state.streak}
          </div>
          <div className="xp-badge">
            ⚡ {state.xp} XP
          </div>
          <button className="dark-toggle" onClick={toggleDarkMode}>
            {state.darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-card">
          <div className="hero-greeting">
            {user ? `¡Qué bueno verte de nuevo, ${user.displayName?.split(' ')[0] || 'Pythonista'}! 👋` : '¡Bienvenido, explorador! 👋'}
          </div>
          <div className="hero-title">
            {user ? 'Sigue tu camino 🚀' : <>Aprende <span>Python</span> hoy</>}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{completedTotal}</span>
              <span className="hero-stat-label">Lecciones</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{state.xp}</span>
              <span className="hero-stat-label">XP Total</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{state.streak}</span>
              <span className="hero-stat-label">Días racha</span>
            </div>
          </div>

          {!user && (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button 
                onClick={() => navigate('/auth')}
                style={{
                  padding: '10px 18px', borderRadius: 100,
                  background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)',
                  color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  backdropFilter: 'blur(10px)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                🔐 Registrarse
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('show-pwa-install-modal'))}
                style={{
                  padding: '10px 18px', borderRadius: 100,
                  background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  backdropFilter: 'blur(10px)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                📲 Instalar App
              </button>
            </div>
          )}

          {!user && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'PythonGo',
                      text: 'Aprende Python paso a paso desde tu celular',
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    alert('¡Enlace copiado al portapapeles!');
                  }
                }}
                style={{
                  padding: '10px 18px', borderRadius: 100,
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px dashed rgba(255, 255, 255, 0.3)',
                  color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  backdropFilter: 'blur(10px)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                ↗️ Compartir
              </button>
            </div>
          )}

          {user && (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'PythonGo',
                      text: '¡Mira mi progreso aprendiendo Python en PythonGo!',
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    alert('¡Enlace copiado al portapapeles!');
                  }
                }}
                style={{
                  padding: '10px 18px', borderRadius: 100,
                  background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  backdropFilter: 'blur(10px)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                ↗️ Compartir PythonGo
              </button>
            </div>
          )}

          <div className="hero-emoji">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Avatar" 
                style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', objectFit: 'cover' }} 
              />
            ) : '🐍'}
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            Progreso general
          </span>
          <span style={{ fontSize: 13, color: 'var(--accent-light)', fontWeight: 700 }}>
            {totalLessons > 0 ? Math.round((completedTotal / totalLessons) * 100) : 0}%
          </span>
        </div>
        <ProgressBar percent={totalLessons > 0 ? (completedTotal / totalLessons) * 100 : 0} />
      </div>

      {/* Modules */}
      <div className="section-label">MÓDULOS</div>
      {lessons.modules.map((module, idx) => {
        const progress = getModuleProgress(module);
        return (
          <div
            key={module.id}
            className="module-card"
            onClick={() => navigate(`/module/${module.id}`)}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="module-card-inner">
              <div
                className="module-card-glow"
                style={{ background: module.color }}
              />
              <div className="module-card-header">
                <div
                  className="module-icon"
                  style={{ background: `${module.color}22`, border: `1px solid ${module.color}44` }}
                >
                  {module.icon}
                </div>
                <div className="module-info">
                  <div className="module-title">{module.title}</div>
                  <div className="module-desc">{module.description}</div>
                </div>
                <div style={{ fontSize: 20, color: 'var(--text-muted)' }}>›</div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <ProgressBar
                  percent={progress.percent}
                  color={module.color}
                />
              </div>

              <div className="module-meta">
                <span
                  className="module-level"
                  style={{ color: module.colorLight, borderColor: `${module.color}44` }}
                >
                  {module.level}
                </span>
                <span className="module-progress-text">
                  {progress.completed}/{progress.total} lecciones
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Footer Copyright */}
      <div style={{ textAlign: 'center', padding: '20px 20px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
        © Creativeweb IA 2026 - Todos los Derechos Reservados
      </div>
    </div>
  );
}
