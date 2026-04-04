import { useState } from 'react';
import { useApp } from '../context/AppContext';

const MAX_ATTEMPTS = 3;

export default function Quiz({ exercise, onComplete }) {
  const { addXP } = useApp();
  const [selected, setSelected] = useState(null);
  const [lastWrong, setLastWrong] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);   // answered correctly
  const [exhausted, setExhausted] = useState(false); // used all 3 attempts
  const [showXP, setShowXP] = useState(false);

  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const showFeedback = selected !== null;
  const isCorrect = selected === exercise.answer;
  const locked = solved || exhausted;

  const handleAnswer = (idx) => {
    if (locked) return;
    setSelected(idx);

    if (idx === exercise.answer) {
      // Correct!
      setSolved(true);
      addXP(10);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1500);
    } else {
      // Wrong
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setLastWrong(idx);
      if (newAttempts >= MAX_ATTEMPTS) {
        setExhausted(true);
      }
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setLastWrong(null);
  };

  const getOptionClass = (idx) => {
    if (!showFeedback) return 'quiz-option';
    if (solved) {
      if (idx === exercise.answer) return 'quiz-option correct';
      return 'quiz-option';
    }
    if (exhausted) {
      if (idx === exercise.answer) return 'quiz-option correct';
      if (idx === lastWrong) return 'quiz-option wrong';
      return 'quiz-option';
    }
    // Mid-attempt wrong answer
    if (idx === selected && !isCorrect) return 'quiz-option wrong';
    return 'quiz-option';
  };

  return (
    <div className="exercise-card card-enter">
      {showXP && <div className="xp-popup">+10 XP ⚡</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div className="exercise-label" style={{ margin: 0 }}>⚡ Ejercicio</div>
        {!solved && !exhausted && (
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

      <div className="quiz-options">
        {exercise.options.map((opt, idx) => (
          <button
            key={idx}
            className={getOptionClass(idx)}
            onClick={() => handleAnswer(idx)}
            disabled={locked}
          >
            <span style={{ marginRight: 8 }}>
              {(solved || exhausted) && idx === exercise.answer
                ? '✓'
                : (solved || exhausted) && idx === lastWrong && !isCorrect
                ? '✗'
                : !locked && selected === idx && !isCorrect
                ? '✗'
                : String.fromCharCode(65 + idx) + ')'}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {/* Feedback after wrong (still has retries) */}
      {showFeedback && !solved && !exhausted && (
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

      {/* Feedback after correct */}
      {solved && (
        <div className="feedback-card correct" style={{ marginTop: 16 }}>
          <span className="feedback-icon">🎉</span>
          <div>
            <div className="feedback-title">¡Correcto! +10 XP</div>
            <div className="feedback-text">{exercise.explanation}</div>
          </div>
        </div>
      )}

      {/* Feedback after exhausted attempts */}
      {exhausted && (
        <div className="feedback-card wrong" style={{ marginTop: 16 }}>
          <span className="feedback-icon">😔</span>
          <div>
            <div className="feedback-title">Sin más intentos</div>
            <div className="feedback-text">
              La respuesta correcta era: <strong>{exercise.options[exercise.answer]}</strong>.{' '}
              {exercise.explanation}
            </div>
          </div>
        </div>
      )}

      {/* Retry button */}
      {showFeedback && !solved && !exhausted && (
        <button
          className="btn btn-ghost btn-full"
          style={{ marginTop: 16 }}
          onClick={handleRetry}
        >
          🔄 Intentar de nuevo ({attemptsLeft} restante{attemptsLeft !== 1 ? 's' : ''})
        </button>
      )}

      {/* Continue button */}
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
