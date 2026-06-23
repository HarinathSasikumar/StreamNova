'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserLocation, getAutoTheme, getAuthMethod } from '@/utils/location';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [location, setLocation] = useState(null);
  const [authMethod, setAuthMethod] = useState({ method: 'email', label: 'Email OTP' });
  const [toasts, setToasts] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [downloadCountToday, setDownloadCountToday] = useState(0);
  const [modalOpen, setModalOpen] = useState(null); // 'invoice' | 'upgrade'
  const [invoiceData, setInvoiceData] = useState(null);

  // Load persisted data
  useEffect(() => {
    const savedUser = localStorage.getItem('sn_user');
    const savedTheme = localStorage.getItem('sn_theme');
    const savedDownloads = localStorage.getItem('sn_downloads');
    const savedDlCount = localStorage.getItem('sn_dl_count');
    const savedDlDate = localStorage.getItem('sn_dl_date');

    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }

    // Reset download count if new day
    const today = new Date().toDateString();
    if (savedDlDate !== today) {
      localStorage.setItem('sn_dl_date', today);
      localStorage.setItem('sn_dl_count', '0');
      setDownloadCountToday(0);
    } else if (savedDlCount) {
      setDownloadCountToday(parseInt(savedDlCount, 10));
    }

    if (savedDownloads) {
      try { setDownloads(JSON.parse(savedDownloads)); } catch {}
    }

    // Theme
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Location & auto theme detection
  useEffect(() => {
    async function detectLocation() {
      try {
        const loc = await getUserLocation();
        setLocation(loc);
        const auth = getAuthMethod(loc);
        setAuthMethod(auth);

        // Auto theme if not manually set
        const savedThemePref = localStorage.getItem('sn_theme_manual');
        if (!savedThemePref) {
          const autoTheme = getAutoTheme(loc.timezone);
          setTheme(autoTheme);
          document.documentElement.setAttribute('data-theme', autoTheme);
        }
      } catch (e) {
        console.warn('Location detection failed:', e);
      }
    }
    detectLocation();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sn_theme', next);
    localStorage.setItem('sn_theme_manual', '1');
    document.documentElement.setAttribute('data-theme', next);
  }, [theme]);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('sn_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sn_user');
  }, []);

  const upgradePlan = useCallback((planId) => {
    if (!user) return;
    const updated = { ...user, plan: planId, upgradedAt: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem('sn_user', JSON.stringify(updated));
  }, [user]);

  const addDownload = useCallback((video) => {
    const newDownloads = [
      { ...video, downloadedAt: new Date().toISOString(), dlId: Date.now() },
      ...downloads.filter(d => d.id !== video.id),
    ];
    setDownloads(newDownloads);
    localStorage.setItem('sn_downloads', JSON.stringify(newDownloads));

    const newCount = downloadCountToday + 1;
    setDownloadCountToday(newCount);
    localStorage.setItem('sn_dl_count', String(newCount));
    localStorage.setItem('sn_dl_date', new Date().toDateString());
  }, [downloads, downloadCountToday]);

  const canDownload = useCallback((userPlan) => {
    if (!userPlan || userPlan === 'free') return downloadCountToday < 1;
    if (userPlan === 'bronze') return downloadCountToday < 3;
    return true; // silver & gold unlimited
  }, [downloadCountToday]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showInvoice = useCallback((data) => {
    setInvoiceData(data);
    setModalOpen('invoice');
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(null);
    setInvoiceData(null);
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, logout, upgradePlan,
      theme, toggleTheme,
      location, authMethod,
      toasts, addToast, removeToast,
      downloads, addDownload, canDownload, downloadCountToday,
      modalOpen, showInvoice, closeModal, invoiceData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
