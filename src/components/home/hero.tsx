'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Trophy, TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-brand-50 py-20 sm:py-32 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-brand-100/50 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-100/40 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="max-w-5xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-800 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Heart className="h-3.5 w-3.5" />
            Play. Win. Give Back.
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Your scores.{' '}
          <span className="text-brand-600">Monthly prizes.</span>
          <br />
          Real{' '}
          <span className="text-accent-600">charitable impact.</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Enter your golf scores, get matched in our monthly draw, and support
          a charity you believe in — all through one simple subscription.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/subscribe">
            <Button size="lg" className="text-base px-8 py-4 rounded-full shadow-lg shadow-brand-200">
              Start Subscribing <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="outline" size="lg" className="text-base px-8 py-4 rounded-full">
              How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            { icon: TrendingUp, label: 'Scores Tracked', value: '10K+' },
            { icon: Trophy, label: 'Prizes Awarded', value: '£50K+' },
            { icon: Heart, label: 'Charity Raised', value: '£25K+' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
            >
              <stat.icon className="h-5 w-5 text-brand-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
