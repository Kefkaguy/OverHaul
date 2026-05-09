import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const EASE_OUT = [0.22, 1, 0.36, 1];

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', handle: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          handle: form.handle,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }
      // Auto sign-in after registration
      await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      router.push('/problems');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create account · OverHaul</title>
      </Head>
      <div
        data-theme="dark"
        style={{
          '--navy-1': '#07111c',
          '--navy-2': '#0D1B2A',
          '--navy-3': '#1B263B',
          '--navy-4': '#243349',
          '--signal': '#FFD60A',
          '--signal-ink': '#0D1B2A',
          '--mute': '#778DA9',
          '--bone': '#E0E1DD',
        }}
        className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="w-full max-w-[420px]"
        >
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--signal)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 18V8l7 7 7-7v10" stroke="#0D1B2A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-sans text-[18px] font-semibold tracking-[-0.02em] text-[var(--text)]">OverHaul</span>
          </div>

          <h1 className="mb-1 font-sans text-[clamp(28px,8vw,32px)] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--text)]">
            Join the platform
          </h1>
          <p className="mb-8 text-sm text-[var(--text-mute)]">Report what's broken. Back what gets built.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Full name</label>
                <motion.input
                  whileFocus={{ borderColor: 'var(--text)' }}
                  transition={{ duration: 0.15 }}
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Jada Kim"
                  required
                  className="w-full rounded-[10px] border border-[var(--line-2)] bg-[var(--surface)] px-4 py-3.5 font-sans text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--text-mute)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">
                  Handle <span className="font-normal text-[var(--text-mute)]">(optional)</span>
                </label>
                <motion.input
                  whileFocus={{ borderColor: 'var(--text)' }}
                  transition={{ duration: 0.15 }}
                  type="text"
                  value={form.handle}
                  onChange={(e) => update('handle', e.target.value)}
                  placeholder="jadak"
                  className="w-full rounded-[10px] border border-[var(--line-2)] bg-[var(--surface)] px-4 py-3.5 font-sans text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--text-mute)]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Email</label>
              <motion.input
                whileFocus={{ borderColor: 'var(--text)' }}
                transition={{ duration: 0.15 }}
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-[10px] border border-[var(--line-2)] bg-[var(--surface)] px-4 py-3.5 font-sans text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--text-mute)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Password</label>
              <motion.input
                whileFocus={{ borderColor: 'var(--text)' }}
                transition={{ duration: 0.15 }}
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="w-full rounded-[10px] border border-[var(--line-2)] bg-[var(--surface)] px-4 py-3.5 font-sans text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--text-mute)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Confirm password</label>
              <motion.input
                whileFocus={{ borderColor: 'var(--text)' }}
                transition={{ duration: 0.15 }}
                type="password"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-[10px] border border-[var(--line-2)] bg-[var(--surface)] px-4 py-3.5 font-sans text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--text-mute)]"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[10px] border border-[#FF4D2E]/30 bg-[#FF4D2E]/10 px-4 py-3 text-[13px] text-[#FF4D2E]"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 bg-[var(--signal)] py-[14px] font-sans text-[15px] font-semibold text-[var(--signal-ink)] transition-opacity disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[var(--text-mute)]">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-[var(--signal)]">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
