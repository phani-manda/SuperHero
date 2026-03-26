'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string | null;
}

export function FeaturedCharities({ charities }: { charities: Charity[] }) {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Charities We Support
          </h2>
          <p className="mt-3 text-gray-500">
            Your subscription directly supports these incredible causes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {charities.slice(0, 3).map((charity, i) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/charities/${charity.slug}`}>
                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group h-full">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                    {charity.image_url ? (
                      <img src={charity.image_url} alt={charity.name} className="h-full w-full object-cover" />
                    ) : (
                      <Heart className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{charity.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3">{charity.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/charities">
            <Button variant="outline" className="rounded-full">
              View All Charities <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
