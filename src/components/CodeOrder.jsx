import { useState } from 'react';
import { useApp } from '../context/AppContext';

const MAX_ATTEMPTS = 3;

export default function CodeOrder({ exercise, onComplete }) {
  const { addXP } = useApp();
  const [lines, setLines] = useState(() =>
    [...exercise.lines].sort(() => Math.random() - 0.5).map((l, i) => ({ id: i, text: l }))
  );
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showXP, setShowXP] = useState(false);

  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const locked = solved || exhausted;

  const handleDragStart = (idx) => setDragging(idx);
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragging === null || dragging === idx) return;
    const newLines = [...lines];
    const [removed] = newLines.splice(dragging, 1);
    newLines.splice(idx, 0, removed);
    setLines(newLines);
    setDragging(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const moveUp = (idx) => {
    if (idx === 0 || locked) return;
    const newLines = [...lines];
    [newLines[idx - 1], newLines[idx]] = [newLines[idx], newLines[idx - 1]];
    setLines(newLines);
  };

  const moveDown = (idx) => {
    if (idx === lines.length - 1 || locked) return;
    const newLines = [...lines];
    [newLines[idx], newLines[idx + 1]] = [newLines[idx + 1], newLines[idx]];
    setLines(newLines);
  };

  const isCurrentCorrect = lines.every((line, idx) =>
    line.text === exercise.lines[exercise.answer[idx]]
  );

  const checkOrder = () => {
    setChecked(true);
    if (isCurrentCorrect) {
      setSolved(true);
      addXP(10);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setExhausted(true);
      }
    }
  };

  const handleRetry = () => {
    setChecked(false);
  };

  return (
    <div className="exercise-card card-enter">
      {showXP && <div className="xp-popup">+10 XP ⚡</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div className="exercise-label" style={{ margin: 0 }}>🔀 Ordenar código</div>
        {!locked && (
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: attemptsLeft <= 1 ? 'var(--error-light)' : 'var(--text-muted)',
            background: attemptsLeft <= 1 ? 'var(--error-glow)' : 'var(--bg-glass)',
            border: `1px solid ${attemptsLeft <= 1 ? 'var(--error)' : 'var(--border-glass)'}`,
            padding: '3px 10px', borderRadius: 100,
            transition: 'all 0.3s',
          }}>
            {attemptsLeft === MAX_ATTEMPTS
              ? `${MAX_ATTEMPTS} intentos`
              : `${attemptsLeft} intento${attemptsLeft !== 1 ? 's' : ''} restante${attemptsLeft !== 1 ? 's' : ''}`}
          </div>
        )}
      </div>

      <p className="exercise-question">{exercise.question}</p>

      <div className="order-container">
        {lines.map((line, idx) => (
          <div
            key={line.id}
            className={`order-item ${dragging === idx ? 'dragging' : ''} ${solved ? 'correct-order' : ''}`}
            draggable={!locked}
            onDragStart={() => !locked && handleDragStart(idx)}
            onDragOver={(e) => !locked && handleDragOver(e, idx)}
            onDrop={(e) => !locked && handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            style={{
              borderColor: dragOver === idx && !locked ? 'var(--accent)' : '',
              opacity: dragging === idx ? 0.5 : 1,
              cursor: locked ? 'default' : 'grab',
            }}
          >
            <span className="order-handle" style={{ opacity: locked ? 0.3 : 1 }}>⠿</span>
            <span style={{ flex: 1, fontFamily: 'Courier New, monospace', fontSize: 13 }}>{line.text}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => moveUp(idx)} disabled={locked} style={{ background: 'none', border: 'none', cursor: locked ? 'default' : 'pointer', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1 }}>▲</button>
              <button onClick={() => moveDown(idx)} disabled={locked} style={{ background: 'none', border: 'none', cursor: locked ? 'default' : 'pointer', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1 }}>▼</button>
            </div>
          </div>
        ))}
      </div>

      {/* Wrong feedback (still has retries) */}
      {checked && !isCurrentCorrect && !exhausted && (
        <div className="feedback-card wrong" style={{ marginTop: 16 }}>
          <span className="feedback-icon">💡</span>
          <div>
            <div className="feedback-title">Orden incorrecto — intenta de nuevo</div>
            <div className="feedback-text">
              Te quedan <strong>{attemptsLeft}</strong> intento{attemptsLeft !== 1 ? 's' : ''}.
            </div>
          </div>
        </div>
      )}

      {/* Correct */}
      {solved && (
        <div className="feedback-card correct" style={{ marginTop: 16 }}>
          <span className="feedback-icon">🎉</span>
          <div>
            <div className="feedback-title">¡Orden correcto! +10 XP</div>
            <div className="feedback-text">{exercise.explanation}</div>
          </div>
        </div>
      )}

      {/* Exhausted */}
      {exhausted && (
        <div className="feedback-card wrong" style={{ marginTop: 16 }}>
          <span className="feedback-icon">😔</span>
          <div>
            <div className="feedback-title">Sin más intentos</div>
            <div className="feedback-text">
              El orden correcto era: <strong>{exercise.lines[exercise.answer[0]]}, ...</strong>. {exercise.explanation}
            </div>
          </div>
        </div>
      )}

      {/* Retry */}
      {checked && !isCurrentCorrect && !exhausted && (
        <button
          className="btn btn-ghost btn-full"
          style={{ marginTop: 16 }}
          onClick={handleRetry}
        >
          🔄 Intentar de nuevo ({attemptsLeft} restante{attemptsLeft !== 1 ? 's' : ''})
        </button>
      )}

      {/* Verify */}
      {!checked && !locked && (
        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: 16 }}
          onClick={checkOrder}
        >
          Verificar orden ✓
        </button>
      )}

      {/* Continue */}
      {(solved || exhausted) && (
        <button
          className={`btn ${solved ? 'btn-success' : 'btn-primary'} btn-full`}
          style={{ marginTop: 16 }}
          onClick={() => onComplete(solved)}
        >
          {solved ? 'Continuar →' : 'Siguiente lección →'}
        </button>
      )}
    </div>
  );
}
