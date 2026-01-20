'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const newScrolled = window.scrollY > 10;
          if (newScrolled !== scrolledRef.current) {
            scrolledRef.current = newScrolled;
            setScrolled(newScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Test' },
    { href: '/practice', label: 'Latihan' },
    { href: '/analytics', label: 'Analitik' },
  ];

  return (
    <header className={`sticky top-0 z-[100] pointer-events-auto transition-all duration-300 ${
      scrolled
        ? 'sketch-header'
        : 'bg-[var(--paper)]'
    }`}>
      <div className="pl-4 sm:pl-6 lg:pl-8 pr-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Pencil icon with handwritten text */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            {/* Hand-drawn pencil icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Pencil body */}
                <path
                  d="M8 32 L28 12 L32 16 L12 36 L6 38 Z"
                  stroke="var(--pencil)"
                  strokeWidth="2"
                  fill="var(--pencil-yellow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Pencil tip */}
                <path
                  d="M6 38 L8 32 L12 36 Z"
                  fill="var(--paper-dark)"
                  stroke="var(--pencil)"
                  strokeWidth="1.5"
                />
                {/* Eraser */}
                <path
                  d="M28 12 L32 8 L36 12 L32 16 Z"
                  fill="var(--pencil-red)"
                  stroke="var(--pencil)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Pencil line detail */}
                <path
                  d="M10 30 L26 14"
                  stroke="var(--pencil)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </div>
            <span
              className="hidden sm:block text-2xl sm:text-3xl font-bold transition-colors group-hover:text-[var(--ink-blue)]"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              TypeMaster
            </span>
          </Link>

          {/* Navigation - Notebook tabs style */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 sm:px-5 sm:py-2.5 transition-all duration-200 text-base sm:text-lg font-semibold ${
                  pathname === item.href
                    ? 'text-[var(--ink-blue)]'
                    : 'text-[var(--pencil-light)] hover:text-[var(--pencil)]'
                }`}
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                {item.label}
                {/* Hand-drawn underline for active state */}
                {pathname === item.href && (
                  <span
                    className="absolute bottom-0 left-1 right-1 h-1"
                    style={{
                      background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 6'%3E%3Cpath d='M0 3 Q 15 1, 30 4 T 60 2 T 100 4' stroke='%231a4080' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat`,
                      backgroundSize: '100% 100%',
                    }}
                  />
                )}
                {/* Hover circle effect */}
                {pathname !== item.href && (
                  <span
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity -z-10"
                    style={{
                      background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 40'%3E%3Cellipse cx='50' cy='20' rx='48' ry='18' stroke='%233d3d3d' stroke-width='1.5' fill='none' stroke-dasharray='4 3'/%3E%3C/svg%3E") no-repeat center`,
                      backgroundSize: '100% 100%',
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Decorative doodle stars */}
          <div className="hidden lg:flex items-center gap-2 opacity-60">
            <span className="doodle-star" />
            <span className="doodle-star" style={{ transform: 'rotate(15deg) scale(0.8)' }} />
          </div>
        </div>
      </div>

      {/* Hand-drawn bottom border line */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 4'%3E%3Cpath d='M0 2 Q 20 0, 40 2 T 80 2 T 120 2 T 160 2 T 200 2' stroke='%231a1a1a' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") repeat-x`,
          backgroundSize: '200px 4px',
        }}
      />
    </header>
  );
}
