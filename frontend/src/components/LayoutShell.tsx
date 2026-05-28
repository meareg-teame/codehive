import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import HeroNavbar from "./HeroNavbar";

export const LayoutShell = ({ children }: { children: ReactNode }) => (
  <div
    className={cn(
      "min-h-screen w-full bg-background text-foreground",
      "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
    )}
  >
    <header className="p-4 mx-4 mt-4 md:mx-8 md:mt-8">
      <HeroNavbar />
    </header>

    <main className="flex-1 p-6 mx-4 my-4 md:mx-8 md:my-8 fade-in">
      {children}
    </main>

    <footer className="p-4 mx-4 mb-4 md:mx-8 md:mb-8 text-sm text-muted-foreground text-center">
      © {new Date().getFullYear()} CodeCollab – All rights reserved
    </footer>
  </div>
);
