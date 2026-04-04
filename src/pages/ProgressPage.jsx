import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import lessons from '../data/lessons.json';

export default function ProgressPage() {
  const { state, getModuleProgress } = useApp();

  const totalLessons = lessons.modules.reduce((a, m) => a + m.lessons.length, 0);
  const completedTotal = Object.keys(state.completedLessons).length;
  const overallPercent = totalLessons > 0 ? Math.round((completedTotal / totalLessons) * 100) : 0;

  const getLevel = (xp) => {
    if (xp >= 500) return { name: 'Experto 🏆', next: null };
    if (xp >= 200) return { name: 'Avanzado 🥇', next: 500 };
    if (xp >= 100) return { name: 'Intermedio 🥈', next: 200 };
    return { name: 'Principiante 🌱', next: 100 };
  };

  const level = getLevel(state.xp);
  const levelPercent = level.next
    ? Math.min(100, Math.round((state.xp / level.next) * 100))
    : 100;

  return (
    <div className="progress-page page">
      <div className="page-header">
        <div className="page-title">Mi Progreso 📊</div>
        <div className="page-subtitle">Sigue aprendiendo todos los días</div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value" style={{ color: 'var(--xp)' }}>{state.xp}</div>
          <div className="stat-label">XP Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value" style={{ color: 'var(--warning-light)' }}>{state.streak}</div>
          <div className="stat-label">Días de racha</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{ color: 'var(--success-light)' }}>{completedTotal}</div>
          <div className="stat-label">Lecciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value" style={{ color: 'var(--accent-light)' }}>{overallPercent}%</div>
          <div className="stat-label">Completado</div>
        </div>
      </div>

      {/* Level */}
      <div className="section-label">NIVEL</div>
      <div className="module-progress-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{level.name}</div>
            {level.next && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {state.xp} / {level.next} XP para el siguiente nivel
              </div>
            )}
          </div>
          <span style={{ fontSize: 22, color: 'var(--xp)', fontWeight: 800 }}>{levelPercent}%</span>
        </div>
        <ProgressBar percent={levelPercent} color="var(--xp)" />
      </div>

      {/* Module Progress */}
      <div className="section-label">POR MÓDULO</div>
      {lessons.modules.map((module) => {
        const prog = getModuleProgress(module);
        return (
          <div key={module.id} className="module-progress-card">
            <div className="module-progress-header">
              <div
                className="module-progress-icon"
                style={{ background: `${module.color}22`, border: `1px solid ${module.color}44` }}
              >
                {module.icon}
              </div>
              <div className="module-progress-info">
                <div className="module-progress-name">{module.title}</div>
                <div className="module-progress-count">{prog.completed}/{prog.total} lecciones</div>
              </div>
              <div className="module-progress-percent" style={{ color: module.colorLight }}>
                {prog.percent}%
              </div>
            </div>
            <ProgressBar percent={prog.percent} color={module.color} />
          </div>
        );
      })}

      {/* Motivational */}
      {completedTotal === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🚀</div>
          <p className="empty-state-text">¡Completa tu primera lección para ver tu progreso!</p>
        </div>
      )}
    </div>
  );
}
