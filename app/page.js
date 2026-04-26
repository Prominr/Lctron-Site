'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Zap, Gamepad2, Rocket, Wifi, Trash2, Activity,
  Download, ArrowRight, CheckCircle, Crown,
  MemoryStick, Shield, ChevronRight, FlameKindling,
  Cpu, Brain, Menu, X
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { APP_VERSION } from '../lib/version';

const FEATURES = [
  { icon: Zap, title: '100+ Tweaks', desc: 'Registry, kernel, GPU and service-level optimizations — search, categories, and smart picks.', color: '#e03030', id: 'tweaks' },
  { icon: Brain, title: 'Lctron Intelligence', desc: 'Full system scan plus describe-your-problem fixes — runs locally on your PC, no chatbot API.', color: '#a78bfa', id: 'ai' },
  { icon: Gamepad2, title: 'Gaming Mode & presets', desc: 'Pro Gaming Mode, aggressive tweak presets, and one-tap lanes before you queue.', color: '#f97316', premium: true, id: 'gaming' },
  { icon: Rocket, title: 'App Booster', desc: 'CPU affinity and priority profiles for any game or app.', color: '#3b82f6', id: 'booster' },
  { icon: Wifi, title: 'Net Scripts & adapter tune', desc: 'Baseline scripts free; gaming profile, bufferbloat, NIC depth-tune and connectivity fixes are Pro.', color: '#22c55e', premium: true, id: 'network' },
  { icon: Cpu, title: 'Pro performance overrides', desc: 'Ultimate Performance plan, CPU parking, power throttling, advanced latency & GPU toggles (Pro).', color: '#f59e0b', premium: true, id: 'pro-cpu' },
  { icon: Trash2, title: 'Deep Cleaner', desc: 'Temp files, junk and reclaim disk space.', color: '#f59e0b', id: 'cleaner' },
  { icon: Activity, title: 'Process & startup tools', desc: 'See what is eating CPU/RAM and trim startup noise.', color: '#a78bfa', id: 'processes' },
  { icon: Shield, title: 'Restore points', desc: 'Snapshots before big changes — unlimited with Pro.', color: '#06b6d4', id: 'restore' },
  { icon: MemoryStick, title: 'RAM Flush', desc: 'Reclaim standby memory when you need a clean slate.', color: '#10b981', premium: true, id: 'ram' },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Solid baseline tuning for every Windows user.',
    features: ['Core optimization tweaks & categories', 'Lctron Intelligence (local scan & describe)', 'App Booster', 'Cleaner & debloat tools', 'Net Scripts (non‑Pro scripts)', 'Power plans', 'Process & startup views', 'Limited restore points', 'Community support'],
    cta: 'Download Free',
    href: '#download',
    style: 'ghost',
  },
  {
    name: 'Premium',
    price: '$12.99',
    period: 'one-time',
    desc: 'Same unlocks as Pro inside the desktop app.',
    features: [
      'Everything in Free',
      'Gaming Mode + aggressive preset packs',
      'RAM Flush',
      'Network / adapter Pro scripts & optimizers',
      'Ultimate Performance & advanced CPU / power toggles',
      'GPU & latency Pro tweaks (HAGS, MSI, scheduler, etc.)',
      'Unlimited restore points',
      'Themes & wallpapers',
      'Pro dashboard & Ultimate Boost',
      '24+ Pro-only tweak slots unlocked',
      'Priority support',
    ],
    cta: 'Get Premium',
    style: 'premium',
    highlight: true,
  },
];

function StatCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  
  useEffect(() => {
    if (!inView || hasAnimated) return;
    setHasAnimated(true);
    
    let startTime = null;
    let rafId = null;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    
    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [inView, target, duration, hasAnimated]);
  
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function AppMockup() {
  const sidebarBlocks = [
    { head: 'Overview', items: [{ label: 'Home', active: true }] },
    { head: 'Optimize', items: [{ label: 'Optimize', active: false, sub: true }] },
    { head: 'Tools', items: ['App Booster', 'Power Plan', 'Cleaner', 'Net Scripts'].map((label) => ({ label, active: false })) },
    { head: 'System', items: ['Startup', 'Processes', 'Restore'].map((label) => ({ label, active: false })) },
    { head: 'App', items: [{ label: 'Settings', active: false }] },
  ];
  const tweaks = [
    { title: 'Disable Telemetry', active: true, premium: false },
    { title: 'Optimize Memory', active: true, premium: false },
    { title: 'Ultimate Perf Plan', active: true, premium: true },
    { title: 'Disable Mitigations', active: false, premium: true },
  ];
  return (
    <div style={{
      width: '100%', maxWidth: 760,
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 48px 140px rgba(0,0,0,0.82), 0 0 80px rgba(124,58,237,0.07), inset 0 1px 0 rgba(255,255,255,0.04)',
      background: 'linear-gradient(165deg, #12121c 0%, #0a0a10 45%)',
    }}>
      <div style={{ height: 34, background: 'linear-gradient(180deg, #101018, #0a0a10)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 7 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', flexShrink: 0 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', flexShrink: 0 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41', flexShrink: 0 }} />
        <span style={{ marginLeft: 10, fontSize: 10.5, color: 'rgba(255,255,255,0.32)', fontWeight: 500 }}>
          Lctron Optimizer v{APP_VERSION}
        </span>
      </div>

      <div style={{ display: 'flex', minHeight: 380 }}>
        <div style={{ width: 168, background: '#080810', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '10px 7px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sidebarBlocks.map((block) => (
            <div key={block.head}>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.9px', padding: '0 8px 4px' }}>
                {block.head}
              </div>
              {block.items.map((item) => (
                <div
                  key={typeof item === 'string' ? item : item.label}
                  style={{
                    padding: '5px 8px', borderRadius: 6, fontSize: 10, fontWeight: item.active ? 600 : 400,
                    color: item.active ? '#fff' : 'rgba(255,255,255,0.38)',
                    background: item.active ? 'rgba(224,48,48,0.14)' : 'transparent',
                    borderLeft: item.active ? '2px solid #e03030' : '2px solid transparent',
                    paddingLeft: item.sub ? 14 : 8,
                  }}
                >
                  {item.label || item}{item.sub ? ' ›' : ''}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 'auto', padding: '6px 8px', borderRadius: 7, fontSize: 10, fontWeight: 700, color: '#c4b5fd', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(167,139,250,0.22)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Crown size={10} /> Premium
          </div>
        </div>

        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9, background: 'linear-gradient(180deg, #0e0e16 0%, #0a0a10 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Good Afternoon <Zap size={12} style={{ color: '#fbbf24' }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.25)', color: '#c4b5fd' }}>
              v{APP_VERSION}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(4, 1fr)', gap: 6, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(224,48,48,0.08)', border: '1px solid rgba(224,48,48,0.2)', borderRadius: 10 }}>
              <div style={{ position: 'relative', width: 40, height: 40 }}>
                <svg width={40} height={40} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={20} cy={20} r={16} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
                  <circle cx={20} cy={20} r={16} fill="none" stroke="#e03030" strokeWidth={4} strokeDasharray={100} strokeDashoffset={18} strokeLinecap="round" />
                </svg>
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>81</span>
              </div>
            </div>
            {[
              { label: 'CPU', value: '12%' },
              { label: 'RAM', value: '82%' },
              { label: 'DISK', value: '275 GB' },
              { label: 'GPU', value: '4 GB' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '6px 8px' }}>
                <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.28)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#6ee7b7' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', padding: '6px 8px', borderRadius: 8, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(167,139,250,0.12)' }}>
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>Lctron Intelligence</span>
            {' · '}Local scan & repair — no cloud
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {tweaks.map((t) => (
              <div key={t.title} style={{
                background: t.active ? 'rgba(200,40,40,0.08)' : t.premium ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${t.active ? 'rgba(224,48,48,0.22)' : t.premium ? 'rgba(139,92,246,0.22)' : 'rgba(255,255,255,0.055)'}`,
                borderRadius: 8, padding: '6px 9px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
              }}>
                <span style={{ fontSize: 9, color: t.premium ? '#c4b5fd' : 'rgba(255,255,255,0.65)', fontWeight: 600, lineHeight: 1.3 }}>{t.title}</span>
                <div style={{
                  width: 28, height: 15, borderRadius: 8, flexShrink: 0,
                  background: t.active ? '#e03030' : t.premium ? 'rgba(139,92,246,0.28)' : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center',
                  padding: '2px 3px',
                  justifyContent: t.active ? 'flex-end' : 'flex-start',
                  boxShadow: t.active ? '0 0 8px rgba(224,48,48,0.35)' : 'none',
                }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#fff', opacity: (t.premium && !t.active) ? 0.45 : 1 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 'auto' }}>81 tweaks active</div>
        </div>
      </div>
    </div>
  );
}

const STRIPE_LINK = 'https://buy.stripe.com/8x200j5prfMjgT17RXaZi00';

export default function LandingPage() {
  const featuresRef = useRef(null);
  const perfRef = useRef(null);
  const pricingRef = useRef(null);
  const downloadRef = useRef(null);
  
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const perfInView = useInView(perfRef, { once: true, margin: '-100px' });
  const pricingInView = useInView(pricingRef, { once: true, margin: '-100px' });
  
  const [siteUser, setSiteUser] = useState(null);
  const [loginMsg, setLoginMsg] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('lctron-site-user');
        if (u) setSiteUser(JSON.parse(u));
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    }
  }, []);

  const handleBuyPremium = useCallback((e) => {
    e.preventDefault();
    setIsBuying(true);
    
    if (!siteUser) {
      setLoginMsg(true);
      setTimeout(() => setLoginMsg(false), 4000);
      setIsBuying(false);
      return;
    }
    
    const email = encodeURIComponent(siteUser.email || '');
    window.open(`${STRIPE_LINK}?prefilled_email=${email}`, '_blank');
    setIsBuying(false);
  }, [siteUser]);

  const handleDownload = useCallback((e) => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 2000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    };
    const handleClick = () => {
      document.body.classList.remove('keyboard-nav');
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#090910', position: 'relative' }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, #e03030, #a78bfa)',
        transform: `scaleX(${scrollProgress / 100})`,
        transformOrigin: 'left',
        zIndex: 100,
        opacity: scrollProgress > 5 ? 1 : 0,
        transition: 'opacity 0.3s',
      }} />

      <Navbar />

      <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>
        <div className="glow-pulse" style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(224,48,48,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 740, width: '100%' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 7, 
              padding: '8px 16px', 
              borderRadius: 20, 
              background: 'rgba(224,48,48,0.1)', 
              border: '1px solid rgba(224,48,48,0.22)', 
              marginBottom: 28,
              cursor: 'default'
            }}>
              <FlameKindling size={14} style={{ color: '#e03030' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#e03030' }}>v{APP_VERSION} — current release</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24, color: '#fff' }}
          >
            Your PC Has{' '}
            <span className="gradient-text">More to Give.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 40px' }}
          >
            Boost FPS, crush input lag, free up RAM and strip Windows bloat — with 100+ tweaks built for serious gamers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <a 
              href="#download" 
              onClick={handleDownload}
              className="btn-red" 
              style={{ fontSize: 15, padding: '14px 28px' }}
            >
              {isDownloading ? (
                <><span className="spinner" /> Downloading...</>
              ) : (
                <><Download size={16} /> Download Free</>
              )}
            </a>
            <a href="#pricing" className="btn-ghost" style={{ fontSize: 15, padding: '14px 28px' }}>
              Get Premium <ChevronRight size={15} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}
          >
            {['Free to use', 'No bloat installed', 'Runs on Windows 10/11'].map((t, i) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
                <CheckCircle size={13} style={{ color: '#34d399' }} /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="float-anim"
          style={{ position: 'relative', zIndex: 1, marginTop: 60, width: '100%', display: 'flex', justifyContent: 'center', padding: '0 16px' }}
        >
          <div style={{ 
            position: 'absolute', 
            inset: -40, 
            background: 'radial-gradient(ellipse, rgba(224,48,48,0.08) 0%, transparent 70%)', 
            borderRadius: '50%', 
            pointerEvents: 'none' 
          }} />
          <div style={{ width: '100%', maxWidth: 760 }}>
            <AppMockup />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{ width: 24, height: 36, border: '2px solid rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', justifyContent: 'center', paddingTop: 6 }}
            >
              <motion.div
                animate={{ opacity: [1, 0, 1], y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{ width: 4, height: 6, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }}
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, textAlign: 'center' }}>
          {[
            { value: 50000, suffix: '+', label: 'Downloads' },
            { value: 100, suffix: '+', label: 'Tweaks Available' },
            { value: 30, suffix: '+', label: 'FPS Gained on Avg' },
            { value: 5, suffix: 'ms', label: 'Avg Ping Drop' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 0' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
                <StatCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" ref={featuresRef} style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={featuresInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>Features</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#fff', marginBottom: 14 }}>
                Everything your PC needs
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', maxWidth: 440, margin: '0 auto' }}>
                From registry tweaks to GPU tuning — all tools in one lightweight app.
              </p>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="glass-card glass-card-hover"
                  style={{ padding: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${f.title} - ${f.desc}`}
                >
                  {f.premium && (
                    <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', fontSize: 10, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.5px' }}>
                      <Crown size={10} /> PRO
                    </div>
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: f.color }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6 }}>{f.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="performance" ref={perfRef} style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={perfInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>Performance</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#fff', marginBottom: 12 }}>
              See the difference
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 50 }}>Real numbers from real users on mid-range hardware.</p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {[
              { label: 'FPS in Fortnite', before: 78, after: 127, unit: 'FPS', beforePct: 42, afterPct: 100 },
              { label: 'Input Latency', before: 28, after: 11, unit: 'ms', beforePct: 100, afterPct: 39, lower: true },
              { label: 'Startup Time', before: 41, after: 18, unit: 's', beforePct: 100, afterPct: 44, lower: true },
              { label: 'Ping (CS2)', before: 42, after: 24, unit: 'ms', beforePct: 100, afterPct: 57, lower: true },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -30 }}
                animate={perfInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: '#34d399', fontWeight: 700 }}>
                    {row.lower ? `${row.before - row.after}${row.unit} less` : `+${row.after - row.before}${row.unit}`}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', width: 45, textAlign: 'right', flexShrink: 0 }}>Before</span>
                    <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={perfInView ? { width: `${row.beforePct}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'rgba(255,255,255,0.18)', borderRadius: 5 }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', width: 55, flexShrink: 0 }}>{row.before}{row.unit}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', width: 45, textAlign: 'right', flexShrink: 0 }}>After</span>
                    <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={perfInView ? { width: `${row.afterPct}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.5, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,#e03030,#ff6060)', borderRadius: 5, boxShadow: '0 0 12px rgba(224,48,48,0.4)' }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e03030', width: 55, flexShrink: 0 }}>{row.after}{row.unit}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 32 }}>Results vary by hardware configuration and existing system state.</p>
        </div>
      </section>

      <section id="pricing" ref={pricingRef} style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={pricingInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>Pricing</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#fff', marginBottom: 12 }}>
                Simple pricing
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)' }}>Start free. Upgrade when you want more power.</p>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={plan.highlight ? { y: -4 } : {}}
                style={{
                  padding: '32px 28px',
                  borderRadius: 20,
                  position: 'relative',
                  overflow: 'hidden',
                  border: plan.highlight ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  background: plan.highlight ? 'linear-gradient(145deg, rgba(124,58,237,0.1) 0%, rgba(9,9,16,1) 100%)' : 'rgba(255,255,255,0.025)',
                  boxShadow: plan.highlight ? '0 0 60px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                }}
              >
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }} />
                )}
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: 18, right: 18, padding: '4px 12px', borderRadius: 20, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.5px' }}>
                    MOST POPULAR
                  </div>
                )}
                
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: plan.highlight ? '#a78bfa' : 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>{plan.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                      <CheckCircle size={14} style={{ color: plan.highlight ? '#a78bfa' : '#34d399', flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
                
                {plan.highlight ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button 
                      onClick={handleBuyPremium} 
                      disabled={isBuying}
                      className="btn-purple" 
                      style={{ width: '100%', padding: '14px', fontSize: 14 }}
                    >
                      {isBuying ? 'Opening...' : <><Crown size={16} /> {plan.cta}</>}
                    </button>
                    <AnimatePresence>
                      {loginMsg && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          style={{ fontSize: 12, color: '#f87171', textAlign: 'center', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}
                        >
                          You need to <Link href="/login" style={{ color: '#fca5a5', fontWeight: 700 }}>sign in</Link> before purchasing.
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!siteUser && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', textAlign: 'center', margin: 0 }}>
                        <Link href="/login" style={{ color: 'rgba(167,139,250,0.7)', textDecoration: 'none' }}>Sign in</Link> to purchase
                      </p>
                    )}
                  </div>
                ) : (
                  <a href={plan.href} className="btn-ghost" style={{ width: '100%', padding: '14px', fontSize: 14 }}>
                    <Download size={16} /> {plan.cta}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="download" ref={downloadRef} style={{ padding: '100px 24px', background: 'rgba(224,48,48,0.04)', borderTop: '1px solid rgba(224,48,48,0.1)', borderBottom: '1px solid rgba(224,48,48,0.08)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(224,48,48,0.12)', border: '1px solid rgba(224,48,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#e03030', boxShadow: '0 0 40px rgba(224,48,48,0.2)' }}>
              <FlameKindling size={30} />
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#fff', marginBottom: 14 }}
          >
            Ready to optimize?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', marginBottom: 32, lineHeight: 1.6 }}
          >
            Download Lctron free and see the difference in minutes. No subscriptions required to start.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <a
              href="https://github.com/Prominr/Lctron-Optimizer/releases/latest"
              target="_blank" rel="noopener noreferrer"
              onClick={handleDownload}
              className="btn-red"
              style={{ fontSize: 15, padding: '14px 32px' }}
            >
              <Download size={18} /> {isDownloading ? 'Opening...' : 'Download for Windows'}
            </a>
            <Link href="/register" className="btn-ghost" style={{ fontSize: 15, padding: '14px 32px' }}>
              Create Account <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 20 }}
          >
            Windows 10 / 11 · 64-bit · ~90MB · v{APP_VERSION}
          </motion.p>
        </div>
      </section>
    </div>
  );
}
