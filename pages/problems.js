import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { OverhaulApp } from '@/components/OverhaulApp';

export default function Problems() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin?callbackUrl=/problems');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div
        data-theme="dark"
        className="flex min-h-screen items-center justify-center bg-[var(--bg)]"
        style={{ '--navy-2': '#0D1B2A' }}
      >
        <span className="font-mono text-sm text-[var(--text-mute)] opacity-60">Loading…</span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Problems · OverHaul</title>
        <meta
          name="description"
          content="Explore civic problems, upvote what matters, and track builders working on fixes."
        />
      </Head>
      <OverhaulApp
        initialView="feed"
        initialProblemId="p2"
        onGoHome={() => router.push('/')}
      />
    </>
  );
}
