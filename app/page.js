'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Zap, Gamepad2, Rocket, Wifi, Trash2, Activity,
  Download, ArrowRight, CheckCircle, Crown, Star,
  MemoryStick, Shield, ChevronRight, FlameKindling,
  Monitor, Cpu, Server, Lock
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const FEATURES = [
  { icon: Zap, title: '100+ Tweaks', desc: 'Registry, kernel, GPU and service-level optimizations applied in one click.', color: '#e03030' },
  { icon: Gamepad2, title: 'Gaming Mode', desc: 'Kill background tasks, switch power plan, flush RAM — one click before you play.', color: '#f97316', premium: true },
  { icon: Rocket, title: 'App Booster', desc: 'Set CPU affinity and priority for any game or app to maximize frame rates.', color: '#3b82f6' },
  { icon: Wifi, title: 'Network Tools', desc: 'Lower your ping with DNS switching, TCP/IP tweaks and adapter optimizations.', color: '#22c55e' },
  { icon: Trash2, title: 'Deep Cleaner', desc: 'Remove temp files, Windows junk and leftover data to reclaim disk space.', color: '#f59e0b' },
  { icon: Activity, title: 'Process Manager', desc: 'View and kill background processes that are eating your CPU and RAM.', color: '#a78bfa' },
  { icon: Shield, title: 'Restore Points', desc: 'Create a snapshot before applying tweaks so you can always roll back safely.', color: '#06b6d4' },
  { icon: MemoryStick, title: 'RAM Flush', desc: 'Instantly reclaim standby memory from background apps for a real boost.', color: '#10b981', premium: true },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Core optimizations for every Windows user.',
    features: ['50+ optimization tweaks', 'App Booster', 'Deep Cleaner', 'Process Manager', 'Startup Manager', '3 restore points', 'Community support'],
    cta: 'Download Free',
    href: '#download',
    style: 'ghost',
  },
  {
    name: 'Premium',
    price: '$12.99',
    period: 'one-time',
    desc: 'Unlock everything for maximum performance.',
    features: ['Everything in Free', 'Gaming Mode', 'RAM Flush', 'Network Optimizer', 'Unlimited restore points', 'All themes & wallpapers', 'Priority support'],
    cta: 'Get Premium',
    style: 'premium',
    highlight: true,
  },
];

function StatCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function AppMockup() {
  const sidebarItems = [
    { label: 'Home', active: true },
    { label: 'Optimize', active: false },
    { label: 'App Booster', active: false },
    { label: 'Cleaner', active: false },
    { label: 'Network', active: false },
    { label: 'Processes', active: false },
    { label: 'Settings', active: false },
  ];
  const tweaks = [
    { title: 'Disable Telemetry', active: true, premium: false },
    { title: 'Optimize Memory', active: true, premium: false },
    { title: 'Ultimate Perf Plan', active: false, premium: true },
    { title: 'Disable Mitigations', active: false, premium: true },
  ];
  return (
    <div style={{
      width: '100%', maxWidth: 700,
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: '0 40px 120px rgba(0,0,0,0.75), 0 0 60px rgba(224,48,48,0.06)',
      background: '#0c0c12',
    }}>
      {/* Title bar — matches real app */}
      <div style={{ height: 36, background: '#080810', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 7 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', flexShrink: 0 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', flexShrink: 0 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41', flexShrink: 0 }} />
        <span style={{ marginLeft: 10, fontSize: 10.5, color: 'rgba(255,255,255,0.28)', fontWeight: 500, letterSpacing: '0.2px' }}>Lctron Optimizer v1.7.6</span>
      </div>

      <div style={{ display: 'flex', height: 350 }}>
        {/* Sidebar — matches real app exactly */}
        <div style={{ width: 155, background: '#080810', borderRight: '1px solid rgba(255,255,255,0.04)', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sidebarItems.map(item => (
            <div key={item.label} style={{
              padding: '7px 10px', borderRadius: 7, fontSize: 11, fontWeight: item.active ? 600 : 400,
              color: item.active ? '#fff' : 'rgba(255,255,255,0.35)',
              background: item.active ? 'rgba(224,48,48,0.15)' : 'transparent',
              borderLeft: item.active ? '2px solid #e03030' : '2px solid transparent',
              cursor: 'default',
            }}>{item.label}</div>
          ))}
          {/* Premium at bottom — matches real app */}
          <div style={{ marginTop: 'auto', padding: '7px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.18)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10 }}>✦</span> Premium
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, background: '#0c0c12', overflow: 'hidden' }}>
          {/* Greeting */}
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Good Evening, User <span style={{ fontSize: 13 }}>⚡</span>
          </div>

          {/* Stats row — matches screenshot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
            {[
              { label: 'CPU USAGE', value: '12%' },
              { label: 'RAM FREE', value: '8.4 GB' },
              { label: 'PING', value: '14ms' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#34d399', letterSpacing: '-0.3px' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tweak cards — matches screenshot layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {tweaks.map(t => (
              <div key={t.title} style={{
                background: t.active ? 'rgba(200,40,40,0.09)' : t.premium ? 'rgba(120,80,200,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${t.active ? 'rgba(224,48,48,0.22)' : t.premium ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.055)'}`,
                borderRadius: 8, padding: '7px 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
              }}>
                <span style={{ fontSize: 9.5, color: t.premium ? '#a78bfa' : 'rgba(255,255,255,0.65)', fontWeight: 500, lineHeight: 1.3 }}>{t.title}</span>
                {/* Toggle switch */}
                <div style={{
                  width: 30, height: 16, borderRadius: 8, flexShrink: 0,
                  background: t.active ? '#e03030' : t.premium ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center',
                  padding: '2px 3px',
                  justifyContent: t.active ? 'flex-end' : 'flex-start',
                  boxShadow: t.active ? '0 0 8px rgba(224,48,48,0.4)' : 'none',
                }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', opacity: (t.premium && !t.active) ? 0.5 : 1 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.2)', marginTop: 'auto', letterSpacing: '0.2px' }}>32 tweaks active · System optimized</div>
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
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });
  const perfInView = useInView(perfRef, { once: true, margin: '-80px' });
  const pricingInView = useInView(pricingRef, { once: true, margin: '-80px' });
  const [siteUser, setSiteUser] = useState(null);
  const [loginMsg, setLoginMsg] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem('lctron-site-user');
      if (u) setSiteUser(JSON.parse(u));
    } catch {}
  }, []);

  const handleBuyPremium = (e) => {
    e.preventDefault();
    if (!siteUser) {
      setLoginMsg(true);
      setTimeout(() => setLoginMsg(false), 4000);
      return;
    }
    const email = encodeURIComponent(siteUser.email || '');
    window.open(`${STRIPE_LINK}?prefilled_email=${email}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090910', position: 'relative' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>
        {/* Background glows */}
        <div className="glow-pulse" style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(224,48,48,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Grid */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 740, width: '100%' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 20, background: 'rgba(224,48,48,0.1)', border: '1px solid rgba(224,48,48,0.22)', marginBottom: 28 }}>
              <FlameKindling size={13} style={{ color: '#e03030' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#e03030' }}>v1.7.6 now available</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-2.5px', marginBottom: 24, color: '#fff' }}
          >
            Your PC Has{' '}
            <span className="gradient-text">More to Give.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 40px' }}
          >
            Boost FPS, crush input lag, free up RAM and strip Windows bloat — with 100+ tweaks built for serious gamers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <a href="#download" className="btn-red" style={{ fontSize: 15, padding: '13px 28px' }}>
              <Download size={16} /> Download Free
            </a>
            <a href="#pricing" className="btn-ghost" style={{ fontSize: 15, padding: '13px 28px' }}>
              Get Premium <ChevronRight size={15} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}
          >
            {['Free to use', 'No bloat installed', 'Runs on Windows 10/11'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
                <CheckCircle size={12} style={{ color: '#34d399' }} /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* App mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="float-anim"
          style={{ position: 'relative', zIndex: 1, marginTop: 60, width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse, rgba(224,48,48,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <AppMockup />
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, textAlign: 'center' }}>
          {[
            { value: 50000, suffix: '+', label: 'Downloads' },
            { value: 100, suffix: '+', label: 'Tweaks Available' },
            { value: 30, suffix: '+', label: 'FPS Gained on Avg' },
            { value: 5, suffix: 'ms', label: 'Avg Ping Drop' },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px 0' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
                <StatCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" ref={featuresRef} style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={featuresInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>Features</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#fff', marginBottom: 14 }}>
                Everything your PC needs
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', maxWidth: 440, margin: '0 auto' }}>
                From registry tweaks to GPU tuning — all tools in one lightweight app.
              </p>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="glass-card glass-card-hover"
                  style={{ padding: '20px', position: 'relative', overflow: 'hidden', cursor: 'default' }}
                >
                  {f.premium && (
                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', fontSize: 9, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.5px' }}>
                      <Crown size={8} /> PRO
                    </div>
                  )}
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: f.color }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.55 }}>{f.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PERFORMANCE ──────────────────────────────────────── */}
      <section id="performance" ref={perfRef} style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={perfInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>Performance</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#fff', marginBottom: 12 }}>
              See the difference
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 50 }}>Real numbers from real users on mid-range hardware.</p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { label: 'FPS in Fortnite', before: 78, after: 127, unit: 'FPS', beforePct: 42, afterPct: 100 },
              { label: 'Input Latency', before: 28, after: 11, unit: 'ms', beforePct: 100, afterPct: 39, lower: true },
              { label: 'Startup Time', before: 41, after: 18, unit: 's', beforePct: 100, afterPct: 44, lower: true },
              { label: 'Ping (CS2)', before: 42, after: 24, unit: 'ms', beforePct: 100, afterPct: 57, lower: true },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -20 }}
                animate={perfInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{ textAlign: 'left' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>
                    {row.lower ? `${row.before - row.after}${row.unit} less` : `+${row.after - row.before}${row.unit}`}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 40, textAlign: 'right', flexShrink: 0 }}>Before</span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={perfInView ? { width: `${row.beforePct}%` } : { width: 0 }}
                        transition={{ duration: 0.9, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'rgba(255,255,255,0.18)', borderRadius: 4 }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', width: 50, flexShrink: 0 }}>{row.before}{row.unit}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 40, textAlign: 'right', flexShrink: 0 }}>After</span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={perfInView ? { width: `${row.afterPct}%` } : { width: 0 }}
                        transition={{ duration: 0.9, delay: i * 0.1 + 0.5, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg,#e03030,#ff6060)', borderRadius: 4, boxShadow: '0 0 10px rgba(224,48,48,0.4)' }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e03030', width: 50, flexShrink: 0 }}>{row.after}{row.unit}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 32 }}>Results vary by hardware configuration and existing system state.</p>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={pricingInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>Pricing</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#fff', marginBottom: 12 }}>
                Simple pricing
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)' }}>Start free. Upgrade when you want more power.</p>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                style={{
                  padding: '28px 26px',
                  borderRadius: 18,
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
                  <div style={{ position: 'absolute', top: 18, right: 18, padding: '3px 10px', borderRadius: 20, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', fontSize: 10, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.5px' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: plan.highlight ? '#a78bfa' : 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>{plan.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', marginBottom: 22, lineHeight: 1.5 }}>{plan.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                      <CheckCircle size={13} style={{ color: plan.highlight ? '#a78bfa' : '#34d399', flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
                {plan.highlight ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={handleBuyPremium} className="btn-purple" style={{ width: '100%', justifyContent: 'center', padding: '12px', cursor: 'pointer', border: 'none' }}>
                      <Crown size={15} /> {plan.cta}
                    </button>
                    {loginMsg && (
                      <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
                        You need to <Link href="/login" style={{ color: '#fca5a5', fontWeight: 700 }}>sign in</Link> before purchasing.
                      </div>
                    )}
                    {!siteUser && (
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', textAlign: 'center', margin: 0 }}>
                        <Link href="/login" style={{ color: 'rgba(167,139,250,0.7)', textDecoration: 'none' }}>Sign in</Link> to purchase
                      </p>
                    )}
                  </div>
                ) : (
                  <a href={plan.href} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    <Download size={15} /> {plan.cta}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD ─────────────────────────────────────────── */}
      <section id="download" style={{ padding: '80px 24px', background: 'rgba(224,48,48,0.04)', borderTop: '1px solid rgba(224,48,48,0.1)', borderBottom: '1px solid rgba(224,48,48,0.08)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(224,48,48,0.12)', border: '1px solid rgba(224,48,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#e03030', boxShadow: '0 0 30px rgba(224,48,48,0.2)' }}>
            <FlameKindling size={28} />
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-1.2px', color: '#fff', marginBottom: 12 }}>
            Ready to optimize?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', marginBottom: 32, lineHeight: 1.6 }}>
            Download Lctron free and see the difference in minutes. No subscriptions required to start.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/Prominr/Lctron-Optimizer/releases/latest"
              target="_blank" rel="noopener noreferrer"
              className="btn-red"
              style={{ fontSize: 15, padding: '14px 32px' }}
            >
              <Download size={17} /> Download for Windows
            </a>
            <Link href="/register" className="btn-ghost" style={{ fontSize: 15, padding: '14px 32px' }}>
              Create Account <ArrowRight size={15} />
            </Link>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 18 }}>Windows 10 / 11 · 64-bit · ~90MB · v1.7.6</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ padding: '48px 24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
            <div style={{ maxWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(224,48,48,0.12)', border: '1px solid rgba(224,48,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlameKindling size={15} style={{ color: '#e03030' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>LCTRON</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>Advanced Windows optimization for gamers and power users.</p>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              {[
                { heading: 'Product', links: [['Features', '#features'], ['Pricing', '#pricing'], ['Download', '#download']] },
                { heading: 'Account', links: [['Sign In', '/login'], ['Register', '/register'], ['My Account', '/account']] },
                { heading: 'Community', links: [['Discord', 'https://discord.gg/7J62ArFa75'], ['GitHub', 'https://github.com/Prominr/Lctron-Optimizer']] },
                { heading: 'Legal', links: [['Privacy', '#'], ['Terms', '#']] },
              ].map(col => (
                <div key={col.heading}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>{col.heading}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {col.links.map(([label, href]) => (
                      href.startsWith('#') || href.startsWith('/')
                        ? <Link key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>
                            {label}
                          </Link>
                        : <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>{label}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>© 2025 Lctron. All rights reserved.</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>Made for Windows gamers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
