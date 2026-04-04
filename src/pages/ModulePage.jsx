import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import RegisterModal from '../components/RegisterModal';
import lessons from '../data/lessons.json';
import confetti from 'canvas-confetti';

// The first module ID — after completing it we invite the user to register
const FIRST_MODULE_ID = lessons.modules[0]?.id;

export default function ModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { state, getModuleProgress } = useApp();
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  const module = lessons.modules.find(m => m.id === moduleId);
  if (!module) return <div className="page"><p style={{ padding: 20 }}>Módulo no encontrado</p></div>;

  const progress = getModuleProgress(module);
  const isFirstModule = moduleId === FIRST_MODULE_ID;
  const isCompleted = progress.percent === 100;

  // Show register modal when first module is 100% complete and user is not logged in
  useEffect(() => {
    if (isFirstModule && isCompleted && !user) {
      // Explode confetti!
      const end = Date.now() + 2 * 1000;
      const colors = ['#6366f1', '#fbbf24', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      // Small delay so the UI updates first
      const t = setTimeout(() => setShowRegister(true), 1200);
      return () => clearTimeout(t);
    }
  }, [isFirstModule, isCompleted, user]);

  const getLessonStatus = (idx) => {
    const lesson = module.lessons[idx];
    if (state.completedLessons[lesson.id]) return 'completed';
    if (idx === 0) return 'available';
    const prev = module.lessons[idx - 1];
    if (state.completedLessons[prev.id]) return 'available';
    return 'locked';
  };

  return (
    <div className="page">
      {/* Register modal */}
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSuccess={() => setShowRegister(false)}
        />
      )}

      {/* Header */}
      <div className="lesson-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Volver
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '16px 0' }}>
          <div
            className="module-icon"
            style={{
              background: `${module.color}22`,
              border: `1px solid ${module.color}44`,
              width: 60, height: 60,
              fontSize: 28
            }}
          >
            {module.icon}
          </div>
          <div>
            <div className="lesson-title-main">{module.title}</div>
            <div className="page-subtitle">{module.description}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <ProgressBar percent={progress.percent} color={module.color} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: module.colorLight, flexShrink: 0 }}>
            {progress.percent}%
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {progress.completed} de {progress.total} lecciones completadas
        </div>

        {/* Invite banner if first module complete and not logged in */}
        {isFirstModule && isCompleted && !user && (
          <div
            onClick={() => setShowRegister(true)}
            style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc', fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            🔐 <span><strong>¡Guarda tu progreso!</strong> Regístrate para continuar en cualquier dispositivo</span>
          </div>
        )}
      </div>

      {/* Lesson List */}
      <div className="section-label">LECCIONES</div>
      <div className="lesson-list">
        {module.lessons.map((lesson, idx) => {
          const status = getLessonStatus(idx);
          return (
            <div
              key={lesson.id}
              className="lesson-item"
              onClick={() => {
                if (status !== 'locked') navigate(`/lesson/${moduleId}/${lesson.id}`);
              }}
              style={{
                opacity: status === 'locked' ? 0.5 : 1,
                cursor: status === 'locked' ? 'not-allowed' : 'pointer',
              }}
            >
              <div className={`lesson-number ${status}`}>
                {status === 'completed' ? '✓' : status === 'locked' ? '🔒' : idx + 1}
              </div>
              <div className="lesson-title">{lesson.title}</div>
              {status !== 'locked' && (
                <div className="lesson-arrow">›</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
