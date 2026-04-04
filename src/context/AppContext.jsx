import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const defaultState = {
  xp: 0,
  streak: 0,
  lastPractice: null,
  completedLessons: {},
  darkMode: false,
};

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('pythongo_state');
      if (saved) return { ...defaultState, ...JSON.parse(saved) };
    } catch {}
    return defaultState;
  });

  // Load progress from Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setState(s => ({
          ...s,
          xp: data.xp ?? s.xp,
          streak: data.streak ?? s.streak,
          lastPractice: data.lastPractice ?? s.lastPractice,
          completedLessons: data.completedLessons ?? s.completedLessons,
        }));
      }
    };
    load();
  }, [user]);

  // Persist to localStorage always, Firestore if logged in
  useEffect(() => {
    localStorage.setItem('pythongo_state', JSON.stringify(state));
    if (!user) return;
    const timeout = setTimeout(async () => {
      await setDoc(doc(db, 'users', user.uid), {
        xp: state.xp,
        streak: state.streak,
        lastPractice: state.lastPractice,
        completedLessons: state.completedLessons,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [state, user]);

  // Reset streak if too many days passed
  useEffect(() => {
    const today = new Date().toDateString();
    const last = state.lastPractice;
    if (last) {
      const lastDate = new Date(last).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate !== today && lastDate !== yesterday) {
        setState(s => ({ ...s, streak: 0 }));
      }
    }
  }, []);

  const updateStreak = (lastPractice, currentStreak) => {
    if (!lastPractice) return 1;
    const today = new Date().toDateString();
    const lastDate = new Date(lastPractice).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today) return currentStreak;
    if (lastDate === yesterday) return currentStreak + 1;
    return 1;
  };

  const addXP = (amount) => {
    const today = new Date().toISOString();
    setState(s => ({
      ...s,
      xp: s.xp + amount,
      lastPractice: today,
      streak: updateStreak(s.lastPractice, s.streak),
    }));
  };

  const completeLesson = (lessonId) => {
    setState(s => ({
      ...s,
      completedLessons: { ...s.completedLessons, [lessonId]: true },
    }));
  };

  const toggleDarkMode = () => setState(s => ({ ...s, darkMode: !s.darkMode }));

  const getModuleProgress = (module) => {
    const total = module.lessons.length;
    const completed = module.lessons.filter(l => state.completedLessons[l.id]).length;
    return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
  };

  return (
    <AppContext.Provider value={{ state, addXP, completeLesson, toggleDarkMode, getModuleProgress }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
