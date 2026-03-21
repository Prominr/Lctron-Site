'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlameKindling, Menu, X, Download, Crown } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    try {
      const u = localStorage.getItem('lctron-site-user');
      if (u) setUser(JSON.parse(u));
    } catch {}
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#features', label: 'Features' },
    { href: '#performance', label: 'Performance' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#download', label: 'Download' },
    { href: 'https://discord.gg/7J62ArFa75', label: 'Discord', external: true, color: '#5865F2' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(9,9,16,0.88)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(224,48,48,0.15)',
              border: '1px solid rgba(224,48,48,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FlameKindling size={16} style={{ color: '#e03030' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>
              LCTRON
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noopener noreferrer' : undefined}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 500,
                  color: l.color || 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  transition: 'color 0.18s, background 0.18s',
                }}
                onMouseEnter={e => { e.target.style.color = l.color || '#fff'; e.target.style.background = l.color ? `${l.color}18` : 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.target.style.color = l.color || 'rgba(255,255,255,0.55)'; e.target.style.background = 'transparent'; }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href="/account" className="btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
                My Account
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
                  Sign In
                </Link>
                <Link href="/register" className="btn-red" style={{ padding: '8px 18px', fontSize: 13 }}>
                  <Download size={13} /> Get Lctron
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, zIndex: 49,
              background: 'rgba(9,9,16,0.97)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
              padding: '16px 24px 20px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileOpen(false)}
                style={{ color: l.color || 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 500, padding: '10px 0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                {l.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Link href="/login" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
              <Link href="/register" className="btn-red" style={{ flex: 1, justifyContent: 'center' }}>Get Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
