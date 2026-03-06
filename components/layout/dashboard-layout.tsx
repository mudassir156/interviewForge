'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MobileNav } from './mobile-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');

        .dl-root {
          font-family: 'Instrument Sans', sans-serif;
          background: var(--background);
        }

        /* Animated noise grain overlay */
        .dl-grain::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .light .dl-grain::after {
          opacity: 0.015;
        }

        /* Sidebar glass border */
        .dl-sidebar {
          background: color-mix(in srgb, var(--sidebar) 88%, transparent) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border-right: 1px solid color-mix(in srgb, var(--sidebar-border) 82%, transparent) !important;
        }

        /* Main scrollbar */
        .dl-main::-webkit-scrollbar { width: 5px; }
        .dl-main::-webkit-scrollbar-track { background: transparent; }
        .dl-main::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--primary) 35%, transparent);
          border-radius: 999px;
        }
        .dl-main::-webkit-scrollbar-thumb:hover {
          background: color-mix(in srgb, var(--primary) 55%, transparent);
        }

        @keyframes dl-blob-drift {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 15px) scale(0.97); }
        }
        .dl-blob { animation: dl-blob-drift 18s ease-in-out infinite; }
        .dl-blob-2 { animation: dl-blob-drift 24s ease-in-out infinite reverse; }
      `}</style>

      <div className="dl-root dl-grain flex h-screen overflow-hidden">

        {/* Desktop Sidebar */}
        <div className="dl-sidebar hidden w-64 flex-col border-r lg:flex">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="dl-main flex-1 overflow-auto relative">

            {/* Ambient background blobs — slow drifting */}
            <div
              className="dl-blob pointer-events-none fixed"
              style={{
                top: '-5%', right: '-5%', width: '600px', height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at center, rgba(124,58,237,0.09) 0%, transparent 70%)',
                zIndex: 0,
              }}
            />
            <div
              className="dl-blob-2 pointer-events-none fixed"
              style={{
                bottom: '-8%', left: '-3%', width: '500px', height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at center, rgba(79,70,229,0.07) 0%, transparent 70%)',
                zIndex: 0,
              }}
            />
            {/* Subtle center shimmer */}
            <div
              className="pointer-events-none fixed inset-0"
              style={{
                background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.04) 0%, transparent 60%)',
                zIndex: 0,
              }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
              {children}
            </div>
          </main>
        </div>

      </div>
    </>
  );
}