'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FlameKindling, User, Mail, Crown, Download, LogOut,
  CheckCircle, Eye, EyeOff, ExternalLink, Key, Shield,
  Zap, ChevronRight, Copy, Check
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const OWNER_EMAIL = 'omariirvin44@gmail.com';
const STRIPE_LINK = 'https://buy.stripe.com/8x200j5prfMjgT17RXaZi00';
const CHECK_API = 'https://lctronoptimizer.netlify.app/.netlify/functions/check-premium';

function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  const masked = local[0] + '*'.repeat(Math.max(local.length - 2, 3)) + (local.length > 1 ? local[local.length - 1] : '');
  return `${masked}@${domain}`;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lctron-site-user');
      if (!raw) { router.replace('/login'); return; }
      const parsed = JSON.parse(raw);
      setUser(parsed);
      // Check live premium status from API
      const email = parsed.email?.toLowerCase().trim();
      if (email) {
        if (email === OWNER_EMAIL.toLowerCase()) {
          setIsPremium(true);
        } else {
          setPremiumLoading(true);
          fetch(`${CHECK_API}?email=${encodeURIComponent(email)}`)
            .then(r => r.json())
            .then(d => { setIsPremium(!!d.premium); })
            .catch(() => {})
            .finally(() => setPremiumLoading(false));
        }
      }
    } catch {
      router.replace('/login');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('lctron-site-user');
    router.push('/');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#090910', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(224,48,48,0.2)', borderTop: '3px solid #e03030', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#090910', position: 'relative', overflow: 'hidden' }}>
      {/* BG */}
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(224,48,48,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(9,9,16,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(224,48,48,0.12)', border: '1px solid rgba(224,48,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlameKindling size={15} style={{ color: '#e03030' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>LCTRON</span>
        </Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '7px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(224,48,48,0.2), rgba(224,48,48,0.05))', border: '1px solid rgba(224,48,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#e03030', flexShrink: 0 }}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>
                {user.username}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isPremium ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.28)', fontSize: 11, fontWeight: 700, color: '#a78bfa' }}>
                    <Crown size={10} /> Premium
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                    Free
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Account Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(224,48,48,0.1)', border: '1px solid rgba(224,48,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e03030' }}>
                <User size={15} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Account Info</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.025)', borderRadius: 11, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>Username</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{user.username}</div>
                </div>
                <button onClick={() => handleCopy(user.username)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
                  {copied ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} />}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.025)', borderRadius: 11, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {showEmail ? user.email : maskEmail(user.email)}
                  </div>
                </div>
                <button onClick={() => setShowEmail(s => !s)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
                  {showEmail ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>

              {user.createdAt && (
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.025)', borderRadius: 11, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4 }}>Member Since</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/Prominr/Lctron-Optimizer/releases/latest"
                target="_blank" rel="noopener noreferrer"
                className="btn-red"
                style={{ fontSize: 13, padding: '9px 18px' }}
              >
                <Download size={13} /> Open / Download App
              </a>
            </div>
          </motion.div>

          {/* Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              background: isPremium ? 'linear-gradient(145deg, rgba(124,58,237,0.1), rgba(9,9,16,1))' : 'rgba(255,255,255,0.025)',
              border: isPremium ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '24px', position: 'relative', overflow: 'hidden',
            }}
          >
            {isPremium && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <Crown size={15} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Subscription</span>
              {isPremium && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }}>✦ ACTIVE</span>}
            </div>
            {premiumLoading ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Checking status...</p>
            ) : isPremium ? (
              <div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 0 }}>
                  You have <strong style={{ color: '#a78bfa' }}>Lctron Premium</strong>. All features are unlocked in the app — make sure you&apos;re signed in with this account.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, margin: 0 }}>
                  Upgrade to unlock Gaming Mode, RAM Flush, Network Optimizer, all themes &amp; wallpapers, and more.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>$12.99</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>one-time</span>
                </div>
                <button
                  onClick={() => { const email = encodeURIComponent(user.email || ''); window.open(`${STRIPE_LINK}?prefilled_email=${email}`, '_blank'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.35)', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Crown size={14} /> Upgrade to Premium
                </button>
              </div>
            )}
          </motion.div>

          {/* Download */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                <Download size={15} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Download App</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginBottom: 18, lineHeight: 1.55 }}>
              Download the latest version of Lctron Optimizer for Windows 10/11.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="https://github.com/Prominr/Lctron-Optimizer/releases/latest"
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, textDecoration: 'none', transition: 'border-color 0.15s, background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(224,48,48,0.25)'; e.currentTarget.style.background = 'rgba(224,48,48,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(224,48,48,0.1)', border: '1px solid rgba(224,48,48,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FlameKindling size={17} style={{ color: '#e03030' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Lctron Optimizer Setup</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Windows 10/11 · x64 · v1.7.23</div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </a>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { icon: Zap, label: 'Plan', value: isPremium ? 'Premium' : 'Free', color: isPremium ? '#a78bfa' : '#e03030' },
              { icon: Shield, label: 'Status', value: 'Active', color: '#34d399' },
              { icon: Download, label: 'Version', value: 'v1.7.6', color: '#3b82f6' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, textAlign: 'center' }}>
                  <Icon size={16} style={{ color: stat.color, margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
