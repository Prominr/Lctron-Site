'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlameKindling, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { hashPassword, getStoredUser, setStoredUser, getStoredUsers, setStoredUsers, authFetch, fetchGoogleProfile } from '../../lib/auth';

function InputField({ label, icon: Icon, type, placeholder, value, onChange, required, rightSlot, style, error, helpText }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
        <input
          className="input-field"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={{ paddingLeft: 44, paddingRight: rightSlot ? 44 : undefined, borderColor: error ? 'rgba(248,113,113,0.4)' : undefined, ...style }}
        />
        {rightSlot}
      </div>
      {helpText && <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{helpText}</div>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (typeof window !== 'undefined') {
      if (getStoredUser()) router.replace('/account');
    }
  }, [router]);

  // Password strength calculator
  const calculateStrength = useCallback((pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    
    const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#f87171', '#f87171', '#fbbf24', '#34d399', '#22c55e'];
    
    return { score, label: labels[score], color: colors[score] };
  }, []);

  const strength = calculateStrength(form.password);

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      setError('');
      try {
        const gUser = await fetchGoogleProfile(tokenResponse.access_token);
        const remote = await authFetch({
          action: 'google',
          email: gUser.email,
          name: gUser.name,
          picture: gUser.picture,
        });
        
        const existing = getStoredUsers().find(
          (u) => u.email.toLowerCase() === gUser.email.toLowerCase(),
        );
        const serverTrialStart = remote?.user?.trial?.start || remote?.user?.createdAt;
        const trialStart = serverTrialStart || existing?.trialStart || new Date().toISOString();
        
        if (remote.success && remote.user) {
          setStoredUser({
            username: remote.user.name,
            email: remote.user.email,
            picture: remote.user.picture || gUser.picture,
            isPremium: remote.user.isPremium || false,
            trialStart,
            trial: remote.user.trial || null,
          });
        } else {
          setStoredUser({
            username: gUser.name,
            email: gUser.email.toLowerCase(),
            picture: gUser.picture,
            isPremium: false, // Never auto-grant premium on Google signup now
            trialStart,
          });
        }
        router.push('/account');
      } catch (e) {
        setError(e?.message || 'Google sign-in failed.');
      } finally {
        setGLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled.');
      setGLoading(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (form.username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const emailKey = form.email.toLowerCase().trim();
      
      // Check if email exists
      const existingUsers = getStoredUsers();
      if (existingUsers.some(u => u.email.toLowerCase() === emailKey)) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      const remote = await authFetch({
        action: 'register',
        name: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (remote.success && remote.user) {
        // Server is authoritative for createdAt + trial — use what it returns.
        const serverCreated = remote.user.createdAt || new Date().toISOString();
        const serverTrialStart = remote.user.trial?.start || serverCreated;
        const hash = await hashPassword(form.password);
        
        const newUser = {
          username: remote.user.name,
          email: remote.user.email,
          password: hash,
          isPremium: remote.user.isPremium || false,
          createdAt: serverCreated,
          trialStart: serverTrialStart,
        };
        
        setStoredUsers([...existingUsers.filter(u => u.email.toLowerCase() !== emailKey), newUser]);
        setStoredUser({
          username: remote.user.name,
          email: remote.user.email,
          picture: remote.user.picture || null,
          isPremium: remote.user.isPremium || false,
          createdAt: serverCreated,
          trialStart: serverTrialStart,
          trial: remote.user.trial || null,
        });
        
        router.push('/account');
        return;
      }
      
      setError(remote.error || 'Could not create account. Please try again.');
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#090910', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(224,48,48,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }} 
        transition={{ duration: 0.5 }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(224,48,48,0.14)', border: '1px solid rgba(224,48,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlameKindling size={20} style={{ color: '#e03030' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>LCTRON</span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30, scale: isVisible ? 1 : 0.95 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px 32px',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(224,48,48,0.6), transparent)' }} />

        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Create account</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 20 }}>Join Lctron and start optimizing</p>

        {/* Trial Banner */}
        <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#86efac', margin: 0 }}>
            <strong>New users get a 3-day free Premium trial!</strong> Experience full performance without commitment.
          </p>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={gLoading}
          className="btn-ghost"
          style={{ width: '100%', marginBottom: 20, gap: 12 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
          {gLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InputField 
            label="Username" 
            icon={User} 
            type="text" 
            placeholder="YourUsername" 
            value={form.username} 
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required 
            helpText={form.username.length > 0 && form.username.length < 3 ? 'At least 3 characters' : null}
          />

          <InputField 
            label="Email" 
            icon={Mail} 
            type="email" 
            placeholder="you@example.com" 
            value={form.email} 
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required 
          />

          {/* Password with Strength */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input
                className="input-field"
                type={showPw ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{ paddingLeft: 44, paddingRight: 44 }}
              />
              <button 
                type="button" 
                onClick={() => setShowPw(s => !s)} 
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Strength Indicator */}
            {form.password.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div 
                      key={n} 
                      style={{ 
                        flex: 1, 
                        height: 4, 
                        borderRadius: 2, 
                        background: n <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.2s'
                      }} 
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Password strength</span>
                  <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { met: form.password.length >= 8, text: '8+ chars' },
                    { met: /[A-Z]/.test(form.password), text: 'Uppercase' },
                    { met: /[0-9]/.test(form.password), text: 'Number' },
                    { met: /[^A-Za-z0-9]/.test(form.password), text: 'Special' },
                  ].map(req => (
                    <span key={req.text} style={{ 
                      fontSize: 10, 
                      padding: '3px 8px', 
                      borderRadius: 4,
                      background: req.met ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                      color: req.met ? '#34d399' : 'rgba(255,255,255,0.3)',
                      border: `1px solid ${req.met ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'}` 
                    }}>
                      {req.met ? '✓' : '○'} {req.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input
                className="input-field"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
                aria-invalid={!!(form.confirm && form.confirm !== form.password)}
                aria-describedby="confirm-help"
                style={{ 
                  paddingLeft: 44,
                  paddingRight: form.confirm && form.confirm === form.password ? 68 : 44,
                  borderColor: form.confirm && form.confirm !== form.password ? 'rgba(248,113,113,0.4)' : undefined
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(s => !s)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {form.confirm && form.confirm === form.password && (
                <CheckCircle size={16} style={{ position: 'absolute', right: 44, top: '50%', transform: 'translateY(-50%)', color: '#34d399', pointerEvents: 'none' }} />
              )}
            </div>
            <div id="confirm-help" role="status" aria-live="polite">
              {form.confirm && form.confirm !== form.password && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#f87171' }}>Passwords don&apos;t match</div>
              )}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                <AlertCircle size={14} style={{ color: '#fca5a5', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#fca5a5' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-red" 
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Creating account...
              </span>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 24 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#e03030', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: 0.5 }}
        style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 32 }}
      >
        © 2025 Lctron. All rights reserved.
      </motion.p>
    </div>
  );
}
