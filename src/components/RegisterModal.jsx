import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterModal({ onClose, onSuccess }) {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('options'); // 'options' | 'email'
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (fn) => {
    setError('');
    setLoading(true);
    try {
      await fn();
      onSuccess?.();
    } catch (e) {
      setError(e.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.overlay}
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 40 }}
          transition={{ type: 'spring', damping: 20 }}
          style={styles.card}
        >
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.trophy}>🏆</span>
            <h2 style={styles.title}>¡Módulo completado!</h2>
            <p style={styles.subtitle}>
              Guarda tu progreso y continúa aprendiendo en cualquier dispositivo
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {mode === 'options' && (
            <div style={styles.body}>
              {/* Google */}
              <button
                style={{ ...styles.socialBtn, background: '#fff', color: '#1a1a1a', border: '1px solid #e2e8f0' }}
                onClick={() => handle(signInWithGoogle)}
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} alt="Google" />
                Continuar con Google
              </button>

              <div style={styles.divider}><span>o</span></div>

              {/* Email */}
              <button
                style={{ ...styles.socialBtn, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
                onClick={() => setMode('email')}
              >
                ✉️ &nbsp; Continuar con correo
              </button>

              <button style={styles.skipBtn} onClick={onClose}>
                Ahora no, continuar sin guardar
              </button>
            </div>
          )}

          {mode === 'email' && (
            <div style={styles.body}>
              <button style={styles.backBtn} onClick={() => setMode('options')}>← Volver</button>
              <h3 style={{ color: '#e2e8f0', marginBottom: 16, textAlign: 'center' }}>
                {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </h3>
              <input
                style={styles.input}
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Contraseña (mín. 6 caracteres)"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                style={styles.submitBtn}
                onClick={() => handle(() => isLogin ? signIn(email, password) : signUp(email, password))}
                disabled={loading || !email || !password}
              >
                {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Crear cuenta')}
              </button>
              <button style={styles.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  card: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24, width: '100%', maxWidth: 400,
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    padding: '32px 24px 24px',
    textAlign: 'center',
  },
  trophy: { fontSize: 48, display: 'block', marginBottom: 8 },
  title: { color: '#fff', margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 700 },
  subtitle: { color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 },
  body: { padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 },
  error: {
    margin: '0 24px', padding: '10px 14px', borderRadius: 10,
    background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.85rem',
  },
  socialBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.95rem', transition: 'opacity 0.2s',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: 12, color: '#475569',
    fontSize: '0.85rem',
    '::before': { content: '""', flex: 1, height: 1, background: '#1e293b' },
  },
  skipBtn: {
    background: 'none', border: 'none', color: '#475569', cursor: 'pointer',
    fontSize: '0.8rem', textAlign: 'center', padding: '4px',
    textDecoration: 'underline',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer',
    fontSize: '0.9rem', textAlign: 'left', padding: 0, marginBottom: 4,
  },
  input: {
    padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.95rem', width: '100%',
    boxSizing: 'border-box', outline: 'none',
  },
  submitBtn: {
    padding: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700,
    fontSize: '0.95rem', cursor: 'pointer',
  },
  toggleBtn: {
    background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer',
    fontSize: '0.85rem', textAlign: 'center', textDecoration: 'underline',
  },
};
