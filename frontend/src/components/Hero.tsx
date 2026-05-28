import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  FileText,
  Github,
  Linkedin,
  Twitter,
  ArrowRight,
} from "lucide-react";
import HeroNavbar from "./HeroNavbar";

const Hero = () => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-background text-foreground",
        "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
      )}
    >
      <HeroNavbar />
      <main className="container mx-auto max-w-5xl flex flex-col items-center justify-center h-full px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-block rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-sm mb-4">
            Public Beta Access
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
            Ship Features, Not Just Code.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            The AI-native agentic IDE that automates the full workflow. From
            vague spec to merge-ready Pull Request—CodeHive handles the heavy
            lifting.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/auth">
              <Button size="lg">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              See Documentation
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-16 w-full"
        >
          <div className="relative rounded-xl border border-border bg-card/50 shadow-lg">
            <div className="p-4">
              <img
                src="/placeholder-ide.png"
                alt="CodeHive IDE"
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-24 w-full"
        >
          <h2 className="text-center text-3xl font-bold">
            Trusted by the best teams
          </h2>
          <div className="mt-8 flex justify-center items-center gap-8 text-muted-foreground">
            <p>Vercel</p>
            <p>GitHub</p>
            <p>OpenAI</p>
            <p>Stripe</p>
          </div>
        </motion.div>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container mx-auto max-w-5xl flex justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-foreground">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-foreground">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;

