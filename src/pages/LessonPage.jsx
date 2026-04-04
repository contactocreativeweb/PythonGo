import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import Quiz from '../components/Quiz';
import FillBlanks from '../components/FillBlanks';
import CodeOrder from '../components/CodeOrder';
import lessons from '../data/lessons.json';
import confetti from 'canvas-confetti';

function syntaxHighlight(code) {
  // Simple highlight for display
  return code
    .replace(/\b(if|else|elif|for|while|in|def|return|import|from|and|or|not|True|False|None|print|range|len|type|append|insert|remove|pop|sort|sorted|enumerate|zip)\b/g, '<span class="kw">$1</span>')
    .replace(/"([^"]*?)"/g, '<span class="str">"$1"</span>')
    .replace(/'([^']*?)'/g, "<span class='str'>'$1'</span>")
    .replace(/#.*$/gm, '<span class="cm">$&</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
}

export default function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { completeLesson } = useApp();

  const module = lessons.modules.find(m => m.id === moduleId);
  const lesson = module?.lessons.find(l => l.id === lessonId);
  const lessonIdx = module?.lessons.findIndex(l => l.id === lessonId) ?? 0;

  const [phase, setPhase] = useState('theory'); // 'theory' | 'exercise' | 'done'
  const [exercisePassed, setExercisePassed] = useState(false);

  if (!module || !lesson) return null;

  const handleExerciseDone = (isCorrect) => {
    completeLesson(lessonId);
    setExercisePassed(isCorrect);
    setPhase('done');
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#fbbf24']
      });
    }
  };

  const goNext = () => {
    const nextIdx = lessonIdx + 1;
    if (nextIdx < module.lessons.length) {
      navigate(`/lesson/${moduleId}/${module.lessons[nextIdx].id}`);
    } else {
      navigate(`/module/${moduleId}`);
    }
  };

  const progress = ((lessonIdx + 1) / module.lessons.length) * 100;

  const ExerciseComponent = {
    quiz: Quiz,
    fill: FillBlanks,
    order: CodeOrder,
  }[lesson.exercise.type];

  return (
    <div className="page">
      {/* Header */}
      <div className="lesson-header" style={{ paddingBottom: 8 }}>
        <div className="lesson-progress-row">
          <button className="back-btn" onClick={() => navigate(`/module/${moduleId}`)}>
            ←
          </button>
          <div className="lesson-progress-bar">
            <ProgressBar percent={progress} color={module.color} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
            {lessonIdx + 1}/{module.lessons.length}
          </span>
        </div>
        <div className="lesson-title-main">{lesson.title}</div>
      </div>

      {/* Theory */}
      {phase === 'theory' && (
        <>
          <div className="theory-card">
            <div className="theory-label">📖 Teoría</div>
            <p className="theory-text">{lesson.theory}</p>
          </div>

          <div className="code-card">
            <div className="code-label">⌨️ Ejemplo</div>
            <pre
              className="code-text"
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(lesson.code) }}
            />
          </div>

          <div style={{ padding: '0 16px' }}>
            <button
              className="btn btn-primary btn-full"
              onClick={() => setPhase('exercise')}
            >
              Practicar ahora ⚡
            </button>
          </div>
        </>
      )}

      {/* Exercise */}
      {phase === 'exercise' && ExerciseComponent && (
        <ExerciseComponent
          exercise={lesson.exercise}
          onComplete={handleExerciseDone}
        />
      )}

      {/* Completion overlay */}
      {phase === 'done' && (
        <div className="completion-overlay">
          <div className="completion-card">
            <span className="completion-emoji">
              {exercisePassed ? '🎉' : '📖'}
            </span>
            <div className="completion-title">
              {exercisePassed ? '¡Lección completada!' : 'Lección vista'}
            </div>
            <div className="completion-xp" style={{ color: exercisePassed ? 'var(--xp)' : 'var(--text-secondary)' }}>
              {exercisePassed ? '+10 XP ganados' : 'Sin XP — ¡inténtalo de nuevo mañana!'}
            </div>
            <button
              className={`btn ${exercisePassed ? 'btn-success' : 'btn-primary'} btn-full`}
              onClick={goNext}
            >
              {lessonIdx + 1 < module.lessons.length ? 'Siguiente lección →' : '🏆 Módulo terminado'}
            </button>
            <button
              className="btn btn-ghost btn-full"
              style={{ marginTop: 10 }}
              onClick={() => navigate(`/module/${moduleId}`)}
            >
              Ver todas las lecciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
