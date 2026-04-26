'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlameKindling, User, Mail, Crown, Download, LogOut, CheckCircle, Eye, EyeOff, Key, Shield, Zap, ChevronRight, Copy, Check, RefreshCw, Calendar, ShieldCheck, AlertTriangle, Palette } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APP_VERSION } from '../../lib/version';
import { THEMES, getTheme } from '../../lib/themes';

const OWNER_EMAIL = 'omariirvin44@gmail.com';
const STRIPE_LINK = 'https://buy.stripe.com/8x200j5prfMjgT17RXaZi00';
const CHECK_API = 'https://lctronoptimizer.netlify.app/.netlify/functions/check-premium';
const TRIAL_DAYS = 3;
const PREMIUM_CHECK_TIMEOUT_MS = 10000;

function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const masked = local[0] + '*'.repeat(Math.max(local.length - 2, 3)) + local.slice(-1);
  return `${masked}@${domain}`;
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return 'Invalid date';
  }
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lctron-theme');
      if (saved) setCurrentTheme(saved);
    }
  }, []);

  const applyTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('lctron-theme', themeId);
    const theme = getTheme(themeId);
    document.documentElement.style.setProperty('--theme-bg', theme.colors.bg);
    document.documentElement.style.setProperty('--theme-accent', theme.colors.accent);
    document.body.style.background = theme.wallpaper && theme.wallpaper !== 'none'
      ? `${theme.colors.bg} ${theme.wallpaper}`
      : theme.colors.bg;
  };

  const checkPremiumStatus = useCallback(async (email) => {
    if (!email) return;
    
    const cleanEmail = email.toLowerCase().trim();
    
    // Owner bypass
    if (cleanEmail === OWNER_EMAIL.toLowerCase()) {
      setIsPremium(true);
      setPremiumLoading(false);
      return;
    }
    
    setPremiumLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PREMIUM_CHECK_TIMEOUT_MS);
      
      const response = await fetch(`${CHECK_API}?email=${encodeURIComponent(cleanEmail)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setIsPremium(!!data.premium);
    } catch (error) {
      console.error('Premium check failed:', error);
      if (error.name === 'AbortError') {
        setError('Premium check timed out. Please refresh.');
      }
    } finally {
      setPremiumLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkAuth = async () => {
      try {
        const raw = localStorage.getItem('lctron-site-user');
        if (!raw) {
          router.replace('/login');
          return;
        }
        
        const parsed = JSON.parse(raw);
        if (!parsed.email) {
          throw new Error('Invalid user data');
        }
        
        setUser(parsed);
        await checkPremiumStatus(parsed.email);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('lctron-site-user');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, checkPremiumStatus]);

  const handleRefreshPremium = useCallback(async () => {
    if (!user?.email || refreshing) return;
    setRefreshing(true);
    try {
      await checkPremiumStatus(user.email);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [user?.email, refreshing, checkPremiumStatus]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('lctron-site-user');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Calculate trial status
  const getTrialStatus = () => {
    if (!user?.trialStart) return null;
    const trialStart = new Date(user.trialStart);
    const trialEnd = new Date(trialStart.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    
    return {
      active: daysLeft > 0 && !isPremium,
      daysLeft: Math.max(0, daysLeft),
      endDate: trialEnd
    };
  };

  const trialStatus = getTrialStatus();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#090910', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20
      }}>
        <div style={{ 
          width: 48, 
          height: 48, 
          borderRadius: '50%', 
          border: '3px solid rgba(224,48,48,0.2)', 
          borderTop: '3px solid #e03030',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Loading your account...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#090910', position: 'relative', overflow: 'hidden' }}>
      {/* Background Effects */}
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(224,48,48,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(9,9,16,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(224,48,48,0.12)', border: '1px solid rgba(224,48,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlameKindling size={18} style={{ color: '#e03030' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>LCTRON</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
            Home
          </Link>
          <button 
            onClick={handleLogout} 
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 20, 
              background: isPremium 
                ? 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(124,58,237,0.1))' 
                : 'linear-gradient(135deg, rgba(224,48,48,0.25), rgba(224,48,48,0.05))', 
              border: `2px solid ${isPremium ? 'rgba(167,139,250,0.4)' : 'rgba(224,48,48,0.35)'}`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 32, 
              fontWeight: 800, 
              color: isPremium ? '#a78bfa' : '#e03030',
              position: 'relative'
            }}>
              {user.picture ? (
                <img src={user.picture} alt="" style={{ width: '100%', height: '100%', borderRadius: 18, objectFit: 'cover' }} />
              ) : (
                user.username?.[0]?.toUpperCase() || 'U'
              )}
              {isPremium && (
                <div style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #090910' }}>
                  <Crown size={14} style={{ color: '#fff' }} />
                </div>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8 }}>
                {user.username}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {premiumLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Checking...</span>
                  </div>
                ) : isPremium ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>
                    <Crown size={14} /> Premium Active
                  </span>
                ) : trialStatus?.active ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 13, fontWeight: 700, color: '#22c55e' }}>
                    <Zap size={14} /> {trialStatus.daysLeft} day{trialStatus.daysLeft !== 1 ? 's' : ''} left
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                    <Zap size={14} /> Free Plan
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 20 }}
              role="alert"
              aria-live="assertive"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#fca5a5' }}>{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 13 }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Account Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card"
            style={{ padding: '28px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(224,48,48,0.1)', border: '1px solid rgba(224,48,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e03030' }}>
                <User size={20} />
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Account Info</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Username */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Username</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{user.username}</div>
                </div>
                <button 
                  onClick={() => handleCopy(user.username)} 
                  className="btn-ghost"
                  style={{ padding: '10px', minWidth: 'auto' }}
                  title="Copy username"
                  aria-label="Copy username to clipboard"
                >
                  {copied ? <Check size={18} style={{ color: '#34d399' }} /> : <Copy size={18} />}
                </button>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Email</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
                    {showEmail ? user.email : maskEmail(user.email)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setShowEmail(s => !s)} 
                    className="btn-ghost"
                    style={{ padding: '10px', minWidth: 'auto' }}
                    title={showEmail ? 'Hide email' : 'Show email'}
                    aria-label={showEmail ? 'Hide email' : 'Show email'}
                  >
                    {showEmail ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button 
                    onClick={() => handleCopy(user.email)} 
                    className="btn-ghost"
                    style={{ padding: '10px', minWidth: 'auto' }}
                    title="Copy email"
                    aria-label="Copy email to clipboard"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              {/* Member Since */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Calendar size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Member Since</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/Prominr/Lctron-Optimizer/releases/latest"
                target="_blank" rel="noopener noreferrer"
                className="btn-red"
              >
                <Download size={18} /> Download App
              </a>
            </div>
          </motion.div>

          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              background: isPremium ? 'linear-gradient(145deg, rgba(124,58,237,0.12), rgba(9,9,16,0.8))' : 'rgba(255,255,255,0.025)',
              border: isPremium ? '1px solid rgba(167,139,250,0.35)' : '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, 
              padding: '28px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isPremium && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }} />}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <Crown size={20} />
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Subscription</span>
              {!isPremium && (
                <button 
                  onClick={handleRefreshPremium}
                  disabled={refreshing || premiumLoading}
                  style={{ 
                    marginLeft: 'auto', 
                    background: 'none', 
                    border: 'none', 
                    color: 'rgba(255,255,255,0.4)', 
                    cursor: refreshing ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    transition: 'all 0.2s'
                  }}
                  title="Refresh status"
                >
                  <RefreshCw size={16} style={{ animation: refreshing ? 'spin 0.5s linear infinite' : 'none' }} />
                  <span style={{ fontSize: 12 }}>Refresh</span>
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {premiumLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ padding: '30px 0', textAlign: 'center' }}
                >
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #a78bfa', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Checking premium status...</span>
                </motion.div>
              ) : isPremium ? (
                <motion.div
                  key="premium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: 'rgba(167,139,250,0.08)', borderRadius: 16, border: '1px solid rgba(167,139,250,0.15)', marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={24} style={{ color: '#a78bfa' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Premium Active</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>All features unlocked • Lifetime access</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {['Gaming Mode', 'RAM Flush', 'Network Pro', 'Unlimited Restore'].map(feature => (
                      <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(167,139,250,0.08)', borderRadius: 10, border: '1px solid rgba(167,139,250,0.15)' }}>
                        <CheckCircle size={14} style={{ color: '#a78bfa' }} />
                        <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(34,197,94,0.08)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p style={{ fontSize: 13, color: '#86efac', margin: 0, lineHeight: 1.6 }}>
                      <strong>Open the Lctron app</strong> and sign in with <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{user.email}</code> to activate premium features.
                    </p>
                  </div>
                </motion.div>
              ) : trialStatus?.active ? (
                <motion.div
                  key="trial"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: 'rgba(34,197,94,0.08)', borderRadius: 16, border: '1px solid rgba(34,197,94,0.2)', marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={24} style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Premium Trial Active</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{trialStatus.daysLeft} day{trialStatus.daysLeft !== 1 ? 's' : ''} remaining</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px', background: 'rgba(251,191,36,0.1)', borderRadius: 12, border: '1px solid rgba(251,191,36,0.25)', marginBottom: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Key size={16} style={{ color: '#fbbf24' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fbbf24', marginBottom: 2 }}>Trial expires {formatDate(trialStatus.endDate.toISOString())}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Upgrade before then to keep premium access</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const email = encodeURIComponent(user.email || '');
                      window.open(`${STRIPE_LINK}?prefilled_email=${email}`, '_blank');
                    }}
                    className="btn-purple"
                  >
                    <Crown size={18} /> Upgrade Now — $12.99 one-time
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="free"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={24} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Free Plan</div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Core features available</div>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(167,139,250,0.06)', borderRadius: 12, border: '1px solid rgba(167,139,250,0.15)', marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa', marginBottom: 8 }}>Unlock Premium Features:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {['Gaming Mode with aggressive presets', 'RAM Flush & memory optimization', 'Network Pro scripts & adapter tuning', 'Unlimited restore points', 'Priority support'].map((feature, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa' }} />
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>$12.99</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>one-time payment</div>
                    </div>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  </div>

                  <button
                    onClick={() => {
                      const email = encodeURIComponent(user.email || '');
                      window.open(`${STRIPE_LINK}?prefilled_email=${email}`, '_blank');
                    }}
                    className="btn-purple"
                  >
                    <Crown size={18} /> Upgrade to Premium
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Download Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card"
            style={{ padding: '28px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                <Download size={20} />
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Download App</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
              Get the latest version of Lctron Optimizer for Windows 10/11.
            </p>
            <a
              href="https://github.com/Prominr/Lctron-Optimizer/releases/latest"
              target="_blank" rel="noopener noreferrer"
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(224,48,48,0.1)', border: '1px solid rgba(224,48,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlameKindling size={22} style={{ color: '#e03030' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Lctron Optimizer</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Windows 10/11 · x64 · v{APP_VERSION}</div>
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </a>
          </motion.div>

          {/* Theme Picker */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.22 }}
            className="glass-card"
            style={{ padding: '28px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <Palette size={20} />
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Site Theme</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {Object.values(THEMES).map(theme => (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: theme.id === currentTheme ? theme.colors.bgCard : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${theme.id === currentTheme ? theme.colors.accent : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    width: '100%', 
                    height: 60, 
                    borderRadius: 8, 
                    background: theme.wallpaper !== 'none' ? theme.wallpaper : theme.colors.bg,
                    marginBottom: 12,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{theme.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{theme.description}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.25 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
          >
            {[
              { icon: Zap, label: 'Plan', value: isPremium ? 'Premium' : trialStatus?.active ? 'Trial' : 'Free', color: isPremium ? '#a78bfa' : '#e03030' },
              { icon: Shield, label: 'Status', value: 'Active', color: '#22c55e' },
              { icon: Download, label: 'Version', value: `v${APP_VERSION}`, color: '#3b82f6' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{ padding: '24px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, textAlign: 'center' }}>
                  <Icon size={20} style={{ color: stat.color, margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{stat.label}</div>
                </div>
              );
            })}
          </motion.div>

          {/* Security Tip */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ marginTop: 8 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px', background: 'rgba(59,130,246,0.08)', borderRadius: 16, border: '1px solid rgba(59,130,246,0.15)' }}>
              <Shield size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>Security Tip</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                  Never share your account credentials. Lctron staff will never ask for your password. Enable two-factor authentication when available.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 40 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© 2025 Lctron. All rights reserved.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#e03030' }}>Made with</span>
            <FlameKindling size={14} style={{ color: '#e03030' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>for Windows gamers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
