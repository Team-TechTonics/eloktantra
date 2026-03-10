'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '@/app/theme-provider';

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Candidates', href: '/candidates' },
    { label: 'Issues', href: '/issues' },
    { label: 'Promises', href: '/promises' },
    { label: 'Manifestos', href: '/manifestos/compare' },
    { label: 'Elections', href: '/elections' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-surface backdrop-blur-md h-16 flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold orange-text-gradient tracking-tight">
          eLoktantra
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link text-sm font-medium ${pathname === link.href ? 'nav-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-colors"
          >
            {theme === 'theme-dark' ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m0-11.314L7.05 7.05m10.9 10.9l1.414 1.414" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            )}
          </button>

          <div className="hidden sm:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-full bg-primary hover:bg-accent text-white text-sm font-semibold transition-all shadow-lg shadow-primary/20"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 top-16 navbar-surface z-40 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex flex-col space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`text-xl font-black uppercase tracking-widest ${
                pathname === link.href ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="pt-8 border-t border-white/5 flex flex-col space-y-4 sm:hidden">
            <Link
              href="/login"
              className="text-lg font-black uppercase tracking-widest text-gray-400"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="w-full py-4 bg-primary text-white text-center font-black uppercase tracking-widest rounded-xl"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
