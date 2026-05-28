import React, { ReactNode } from 'react';
import HeroNavbar from './HeroNavbar';

export const LayoutShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-foreground/5 to-background text-foreground dark">
    {/* Header/Nav */}
    <header className="glass p-4 mx-4 mt-4 md:mx-8 md:mt-8">
      {/* pull in your existing HeroNavbar component */}
      <HeroNavbar />
    </header>

    {/* Main content */}
    <main className="flex-1 glass p-6 mx-4 my-4 md:mx-8 md:my-8 fade-in">
      {children}
    </main>

    {/* Footer (optional) */}
    <footer className="glass p-4 mx-4 mb-4 md:mx-8 md:mb-8 text-sm text-muted-foreground text-center">
      © {new Date().getFullYear()} CodeCollab – All rights reserved
    </footer>
  </div>
);
