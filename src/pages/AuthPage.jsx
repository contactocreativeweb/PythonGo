import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const navigate = useNavigate();

  const handle = async (fn) => {
    setError('');
    setLoading(true);
    try {
      await fn();
      navigate('/');
    } catch (e) {
      setError(e.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={s.card}
      >
        {/* Logo */}
        <div style={s.logo}>🐍</div>
        <h1 style={s.title}>PythonGo</h1>
        <p style={s.subtitle}>{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}</p>

        {error && <div style={s.error}>{error}</div>}

        {/* Social buttons */}
        <div style={s.socials}>
          <button style={s.googleBtn} onClick={() => handle(signInWithGoogle)} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} alt="" />
            Continuar con Google
          </button>
        </div>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>o con correo</span>
          <div style={s.dividerLine} />
        </div>

        {/* Email form */}
        <form onSubmit={e => { e.preventDefault(); handle(() => isLogin ? signIn(email, password) : signUp(email, password)); }}>
          <input
            style={s.input}
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={s.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button style={s.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
          </button>
        </form>

        <button style={s.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </motion.div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0f172a', padding: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24, padding: '36px 28px', width: '100%', maxWidth: 400,
    backdropFilter: 'blur(10px)',
  },
  logo: { fontSize: 52, textAlign: 'center', marginBottom: 8 },
  title: { color: '#e2e8f0', textAlign: 'center', margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800 },
  subtitle: { color: '#64748b', textAlign: 'center', margin: '0 0 24px', fontSize: '0.9rem' },
  error: {
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171', borderRadius: 10, padding: '10px 14px',
    fontSize: '0.85rem', marginBottom: 16,
  },
  socials: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0',
    background: '#fff', color: '#1a1a1a', fontWeight: 600, fontSize: '0.95rem',
    cursor: 'pointer', width: '100%',
  },
  fbBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: '12px', borderRadius: 12, border: 'none',
    background: '#1877f2', color: '#fff', fontWeight: 600, fontSize: '0.95rem',
    cursor: 'pointer', width: '100%',
  },
  divider: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' },
  dividerText: { color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  input: {
    display: 'block', width: '100%', padding: '12px 14px', marginBottom: 12,
    borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', padding: '13px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    marginBottom: 16,
  },
  toggleBtn: {
    background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer',
    fontSize: '0.85rem', width: '100%', textAlign: 'center', textDecoration: 'underline',
  },
};
