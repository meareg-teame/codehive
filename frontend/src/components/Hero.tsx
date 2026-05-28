import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  Clock,
  Cpu,
  Github,
  Globe,
  Layers,
  Linkedin,
  Lock,
  Plug,
  ShieldCheck,
  Sparkles,
  Star,
  Twitter,
  Users,
  Zap,
} from "lucide-react";
import HeroNavbar from "./HeroNavbar";

const featurePillars = [
  {
    title: "Agentic Delivery",
    description:
      "From spec to pull request, your workflows run as a coordinated system of agents.",
    icon: Sparkles,
  },
  {
    title: "Realtime Collaboration",
    description:
      "Live cursors, shared execution, and instant context for distributed teams.",
    icon: Users,
  },
  {
    title: "Enterprise Runtime",
    description:
      "Secure, sandboxed compute with auditable trails and policy controls.",
    icon: ShieldCheck,
  },
];

const workflowSteps = [
  { title: "Plan", description: "Define goals and scope with shared context.", icon: Layers },
  { title: "Build", description: "Generate, review, and refine continuously.", icon: Cpu },
  { title: "Validate", description: "Run tests, security checks, and QA loops.", icon: BarChart3 },
  { title: "Ship", description: "Deploy with guarded rollouts and metrics.", icon: Zap },
];

const integrations = [
  "GitHub",
  "GitLab",
  "Linear",
  "Notion",
  "Slack",
  "Vercel",
  "AWS",
  "Stripe",
];

const compliance = [
  { title: "SOC 2 Ready", detail: "Audit logs, retention policies, and controls." },
  { title: "Private Networks", detail: "VPC and IP allowlisting for regulated teams." },
  { title: "Data Residency", detail: "Region-aware storage and compute options." },
];

const testimonials = [
  {
    quote:
      "We cut cycle time by 40% and finally unified our engineering workflows.",
    name: "Irene Walsh",
    role: "VP Engineering, Northwind",
  },
  {
    quote:
      "The collaborative runtime made onboarding across time zones effortless.",
    name: "Kaito Murakami",
    role: "Director of Product, Kumo",
  },
  {
    quote:
      "We now ship weekly with confidence, with full traceability.",
    name: "Elena Petrova",
    role: "CTO, Aster",
  },
];

const pricing = [
  {
    title: "Launch",
    price: "$29",
    detail: "per seat / month",
    features: ["Unlimited projects", "Shared IDE", "Basic analytics"],
  },
  {
    title: "Scale",
    price: "$79",
    detail: "per seat / month",
    features: ["Workflow agents", "Private runtimes", "Advanced analytics"],
    highlighted: true,
  },
  {
    title: "Enterprise",
    price: "Custom",
    detail: "annual contracts",
    features: ["SLA + SSO", "Dedicated support", "Compliance bundle"],
  },
];

const faqs = [
  {
    question: "How does CodeHive handle data security?",
    answer:
      "We use encryption in transit and at rest, plus org-level policy controls and audit logs.",
  },
  {
    question: "Can we bring our own cloud or VPC?",
    answer:
      "Yes. We offer managed VPC deployments and IP allowlisting for enterprise plans.",
  },
  {
    question: "What integrations are available?",
    answer:
      "Git providers, CI/CD, issue trackers, and chat tools are supported out of the box.",
  },
  {
    question: "Does this replace our current IDE?",
    answer:
      "Not necessarily. You can adopt CodeHive as a collaboration layer on top of existing workflows.",
  },
];

const Hero = () => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-background text-foreground font-[\"Space_Grotesk\"]",
        "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,191,36,0.25),rgba(255,255,255,0))]"
      )}
    >
      <div className="absolute inset-0 bg-[url('../../grid.svg')] opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(251,146,60,0.18),transparent_60%)] blur-3xl pointer-events-none" />
      <HeroNavbar />

      <main className="container mx-auto max-w-6xl px-6 pb-24 pt-24 md:pt-32 space-y-28">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-amber-400" />
              AI-native workflow platform
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
              The collaborative engine for modern software teams.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              CodeHive unifies ideation, building, and delivery into a single, intelligent workspace. Move from requirements to production with confidence.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/auth">
                <Button size="lg">
                  Start building <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Schedule a demo
              </Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                28% faster delivery
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400" />
                120+ global teams
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-border bg-card/40 shadow-xl p-6"
          >
            <div className="rounded-2xl bg-black/70 border border-border p-5 text-sm text-muted-foreground">
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="uppercase tracking-[0.3em]">CodeHive Console</span>
                <span className="text-amber-400">Live</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-amber-400">01</span>
                  <div>
                    <p className="text-foreground">Spec -> implementation</p>
                    <p className="text-xs">Agents generate scaffolded modules and tests.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-400">02</span>
                  <div>
                    <p className="text-foreground">Realtime review</p>
                    <p className="text-xs">Inline feedback with audit trail.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-400">03</span>
                  <div>
                    <p className="text-foreground">Deploy safely</p>
                    <p className="text-xs">Guarded rollouts and metrics.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="space-y-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Trusted by product-forward teams</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-muted-foreground">
            {integrations.map((name) => (
              <div key={name} className="rounded-xl border border-border bg-card/30 p-4 text-center">
                {name}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Why CodeHive</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Align product, engineering, and delivery.</h2>
            <p className="text-muted-foreground">
              Replace fragmented tooling with a single workspace that keeps teams aligned. Everything from planning to execution lives in one place.
            </p>
            <div className="grid gap-3">
              {[
                "Unified roadmap and delivery view",
                "Collaborative execution with realtime context",
                "Instant insights into velocity and quality",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card/40 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Velocity</p>
                <p className="text-3xl font-semibold mt-2">3.2x</p>
                <p className="text-sm text-muted-foreground">Faster feature delivery</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reliability</p>
                <p className="text-3xl font-semibold mt-2">99.9%</p>
                <p className="text-sm text-muted-foreground">Pipeline uptime</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Collaboration</p>
                <p className="text-3xl font-semibold mt-2">24/7</p>
                <p className="text-sm text-muted-foreground">Global handoffs</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Insight</p>
                <p className="text-3xl font-semibold mt-2">18%</p>
                <p className="text-sm text-muted-foreground">Defect reduction</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-semibold">Product pillars</h2>
            <Button variant="ghost">Explore platform</Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featurePillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-3xl border border-border bg-card/40 p-6 space-y-4"
              >
                <pillar.icon className="h-6 w-6 text-amber-400" />
                <h3 className="text-xl font-semibold">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-semibold">From idea to production in four stages</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card/30 p-5">
                <div className="flex items-center justify-between">
                  <step.icon className="h-5 w-5 text-amber-400" />
                  <span className="text-xs text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="rounded-3xl border border-border bg-card/40 p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Integrations</p>
            <h2 className="text-3xl md:text-4xl font-semibold">Connected to your stack.</h2>
            <p className="text-muted-foreground">Bring CodeHive into your existing workflows without migration pain.</p>
            <div className="flex flex-wrap gap-3">
              {integrations.map((tool) => (
                <span key={tool} className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card/40 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Plug className="h-5 w-5 text-amber-400" />
              <p className="text-sm">Syncs with PRs, issues, and deployments.</p>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-amber-400" />
              <p className="text-sm">Global data routing with low latency.</p>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-amber-400" />
              <p className="text-sm">Unified analytics across teams.</p>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-semibold">Security and compliance</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {compliance.map((item) => (
              <div key={item.title} className="rounded-3xl border border-border bg-card/40 p-6">
                <Lock className="h-5 w-5 text-amber-400" />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-semibold">Customer outcomes</h2>
            <div className="flex items-center gap-2 text-amber-400">
              <Star className="h-4 w-4" />
              <Star className="h-4 w-4" />
              <Star className="h-4 w-4" />
              <Star className="h-4 w-4" />
              <Star className="h-4 w-4" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-3xl border border-border bg-card/40 p-6 space-y-4">
                <p className="text-sm text-muted-foreground">"{item.quote}"</p>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-semibold">Pricing built for scale</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.title}
                className={cn(
                  "rounded-3xl border border-border bg-card/40 p-6 space-y-5",
                  plan.highlighted && "border-amber-400/60 shadow-lg shadow-amber-500/10"
                )}
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{plan.title}</h3>
                  <p className="text-3xl font-semibold">{plan.price}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                    {plan.detail}
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-amber-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                  Start with {plan.title}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold">Frequently asked questions</h2>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-border bg-card/40 p-5">
                <p className="font-semibold">{faq.question}</p>
                <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/40 p-8 md:p-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold">Ready to scale your delivery engine?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join teams that use CodeHive to turn ideas into production-ready software in days, not quarters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg">Start free</Button>
            </Link>
            <Button size="lg" variant="outline">Talk to sales</Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-foreground">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-foreground">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hero;

