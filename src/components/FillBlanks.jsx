import { useState } from 'react';
import { useApp } from '../context/AppContext';

const MAX_ATTEMPTS = 3;

export default function FillBlanks({ exercise, onComplete }) {
  const { addXP } = useApp();
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showXP, setShowXP] = useState(false);

  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const locked = solved || exhausted;
  const isCurrentCorrect = value.trim().toLowerCase() === exercise.answer.toLowerCase();

  const handleHint = () => {
    if (!hintUsed) {
      setHintUsed(true);
      addXP(2);
    }
    setShowHint(true);
  };

  const handleCheck = () => {
    if (!value.trim() || locked) return;
    setChecked(true);

    if (isCurrentCorrect) {
      setSolved(true);
      if (!hintUsed) {
        addXP(10);
        setShowXP(true);
        setTimeout(() => setShowXP(false), 1500);
      }
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setExhausted(true);
      }
    }
  };

  const handleRetry = () => {
    setValue('');
    setChecked(false);
  };

  const inputClass = () => {
    if (!checked) return 'fill-input';
    if (isCurrentCorrect) return 'fill-input correct';
    return 'fill-input wrong';
  };

  return (
    <div className="exercise-card card-enter">
      {showXP && <div className="xp-popup">+10 XP ⚡</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div className="exercise-label" style={{ margin: 0 }}>✏️ Completar código</div>
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

      <div className="fill-container">
        <div className="fill-code-block">{exercise.before}</div>

        <input
          className={inputClass()}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Escribe tu respuesta..."
          disabled={locked}
          onKeyDown={e => e.key === 'Enter' && !locked && !checked && handleCheck()}
        />

        {!locked && !checked && (
          <button className="hint-btn" onClick={handleHint}>
            💡 Pista {hintUsed ? '' : '(+2 XP)'}
          </button>
        )}

        {showHint && (
          <div className="hint-text">💡 {exercise.hint}</div>
        )}
      </div>

      {/* Wrong feedback (still has retries) */}
      {checked && !isCurrentCorrect && !exhausted && (
        <div className="feedback-card wrong" style={{ marginTop: 16 }}>
          <span className="feedback-icon">💡</span>
          <div>
            <div className="feedback-title">Incorrecto — intenta de nuevo</div>
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
            <div className="feedback-title">¡Correcto!{!hintUsed ? ' +10 XP' : ' +2 XP (pista)'}</div>
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
              La respuesta era: <strong>{exercise.answer}</strong>. {exercise.explanation}
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

      {/* Verify (first attempt) */}
      {!checked && !locked && (
        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: 16 }}
          onClick={handleCheck}
          disabled={!value.trim()}
        >
          Verificar ✓
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
