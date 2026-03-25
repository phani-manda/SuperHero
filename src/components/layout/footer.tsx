import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">GolfGives</h3>
            <p className="text-sm leading-relaxed">
              A subscription platform combining golf, charity, and monthly prize draws.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/subscribe" className="hover:text-white transition-colors">Subscribe</Link></li>
              <li><Link href="/charities" className="hover:text-white transition-colors">Charities</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><span className="cursor-default">Cookie Policy</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} GolfGives. All rights reserved.
          </p>
          <p className="text-xs flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-red-500" /> for charity
          </p>
        </div>
      </div>
    </footer>
  );
}
