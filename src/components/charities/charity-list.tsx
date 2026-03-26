'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Search, Star, Heart } from 'lucide-react';
import Link from 'next/link';

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  is_featured: boolean;
  total_received: number;
}

export function CharityList({ charities }: { charities: Charity[] }) {
  const [search, setSearch] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = charities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesFeatured = !featuredOnly || c.is_featured;
    return matchesSearch && matchesFeatured;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <Star className="h-3.5 w-3.5 text-accent-500" />
          Featured only
        </label>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((charity) => (
          <Link key={charity.id} href={`/charities/${charity.slug}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <div className="h-40 bg-gradient-to-br from-brand-100 to-brand-200 rounded-t-xl flex items-center justify-center relative">
                <Heart className="h-12 w-12 text-brand-400 group-hover:scale-110 transition-transform" />
                {charity.is_featured && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-accent-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    <Star className="h-3 w-3" /> Featured
                  </span>
                )}
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-1">{charity.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {charity.description}
                </p>
                <p className="text-xs text-brand-600 font-medium">
                  {formatCurrency(charity.total_received)} raised
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">No charities found.</p>
      )}
    </div>
  );
}
