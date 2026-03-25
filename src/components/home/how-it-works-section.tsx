'use client';

import { motion } from 'framer-motion';
import { UserPlus, Target, Dices, Heart } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Subscribe',
    description: 'Choose a monthly or yearly plan. Pick a charity to support with your subscription.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Target,
    title: 'Enter Your Scores',
    description: 'Log your last 5 Stableford golf scores. They become your draw numbers.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Dices,
    title: 'Monthly Draw',
    description: 'Each month, winning numbers are generated. Match 3, 4, or all 5 to win prizes.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Heart,
    title: 'Give Back',
    description: 'At least 10% of your subscription goes directly to your chosen charity.',
    color: 'bg-red-50 text-red-600',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            Four simple steps to play, win, and make a real difference.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className={`inline-flex p-4 rounded-2xl ${step.color} mb-4`}>
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
