import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-brand-700 mb-4">GolfGives</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Play. Win. Give Back. — Coming soon.
      </p>
      <Link
        href="/auth/login"
        className="rounded-full bg-brand-600 px-8 py-3 text-white font-semibold hover:bg-brand-700 transition-colors"
      >
        Get Started
      </Link>
    </main>
  );
}
