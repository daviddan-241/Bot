import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Search, BarChart2, Sparkles, FileText, Users2, ArrowRight,
  CheckCircle2, Zap,
} from "lucide-react";

const stats = [
  { value: "10,000+", label: "Businesses discovered" },
  { value: "2,400+", label: "Proposals generated" },
  { value: "€1.2M+", label: "Revenue closed" },
  { value: "98%", label: "Client satisfaction" },
];

const features = [
  {
    icon: Search,
    iconBg: "bg-indigo-900",
    iconColor: "text-indigo-400",
    title: "Business Discovery",
    desc: "Find businesses with weak online presence in any city or industry worldwide using real public data.",
  },
  {
    icon: BarChart2,
    iconBg: "bg-blue-900",
    iconColor: "text-blue-400",
    title: "Website Scanner",
    desc: "Real SSL, SEO, performance, mobile, and PageSpeed scores in seconds.",
  },
  {
    icon: Sparkles,
    iconBg: "bg-emerald-900",
    iconColor: "text-emerald-400",
    title: "AI Website Generator",
    desc: "Generate full multi-page websites with AI, then auto-humanize all content before delivery.",
  },
  {
    icon: FileText,
    iconBg: "bg-orange-900",
    iconColor: "text-orange-400",
    title: "Proposal Generator",
    desc: "Create stunning PDF proposals with before/after comparisons and shareable links in seconds.",
  },
  {
    icon: Users2,
    iconBg: "bg-pink-900",
    iconColor: "text-pink-400",
    title: "CRM Pipeline",
    desc: "Manage every lead from discovery to closed client with a visual kanban pipeline.",
  },
];

const steps = [
  {
    num: "01",
    icon: Search,
    iconBg: "bg-indigo-900",
    iconColor: "text-indigo-400",
    title: "Discover",
    desc: "Search any city or industry for businesses with poor or no websites.",
  },
  {
    num: "02",
    icon: BarChart2,
    iconBg: "bg-blue-900",
    iconColor: "text-blue-400",
    title: "Scan & Score",
    desc: "Instantly analyze their website for SEO, performance, mobile, and SSL issues.",
  },
  {
    num: "03",
    icon: Sparkles,
    iconBg: "bg-emerald-900",
    iconColor: "text-emerald-400",
    title: "Generate with AI",
    desc: "Create a stunning AI website preview and professional PDF proposal automatically.",
  },
  {
    num: "04",
    icon: Users2,
    iconBg: "bg-pink-900",
    iconColor: "text-pink-400",
    title: "Close the Deal",
    desc: "Send the shareable proposal link and track opens, replies, and conversions in your CRM.",
  },
];

const plans = [
  {
    name: "Starter",
    desc: "Perfect for freelancers getting started",
    price: "€29",
    features: ["50 website scans/month", "10 AI proposals", "Business discovery", "CRM pipeline", "Email support"],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    desc: "For growing agencies closing more deals",
    price: "€79",
    features: ["Unlimited website scans", "50 AI proposals/month", "AutoScan scheduler", "Priority support", "White-label proposals", "API access"],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Agency",
    desc: "For established agencies at scale",
    price: "€149",
    features: ["Everything in Growth", "Unlimited AI proposals", "Team seats (5 users)", "Custom domain", "Dedicated account manager", "SLA guarantee"],
    popular: false,
    cta: "Contact Sales",
  },
];

export default function Landing() {
  const [, navigate] = useLocation();

  const goToDashboard = () => {
    window.location.href = "/api/login?returnTo=/dashboard";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-white">SF</span>
            </div>
            <span className="font-semibold text-base">SiteForge AI</span>
          </div>
          <Button
            className="h-9 px-4 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
            onClick={goToDashboard}
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/70 mb-8">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          AI-Powered Web Agency Platform
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          <span className="text-white">Find</span>{" "}
          <span className="text-white">Businesses.</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Build Websites.
          </span>
          <br />
          <span className="text-white">Close Deals.</span>
        </h1>

        <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          SiteForge AI helps web design agencies discover local businesses with weak online presence, scan their
          websites, generate AI-powered redesigns and proposals, and manage the entire client journey — all from
          one premium dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
          <Button
            className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl gap-2 font-semibold"
            onClick={goToDashboard}
          >
            Start for Free <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 text-base border-white/20 text-white hover:bg-white/5 rounded-2xl font-semibold"
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
          >
            See How It Works
          </Button>
        </div>
        <p className="text-white/40 text-sm">No credit card required · 14-day free trial · Cancel anytime</p>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-14 border-t border-white/5">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-white/50 text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-14 border-t border-white/5">
        <div className="text-center mb-12">
          <span className="text-white/50 text-sm border border-white/10 rounded-full px-4 py-1.5">
            Everything You Need
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4">One platform. Every tool.</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            From finding your first lead to delivering a finished website — SiteForge AI covers the full agency
            workflow.
          </p>
        </div>
        <div className="space-y-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/8 rounded-2xl p-6 flex items-start gap-5"
            >
              <div className={`h-12 w-12 rounded-xl ${f.iconBg} flex items-center justify-center shrink-0`}>
                <f.icon className={`h-6 w-6 ${f.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-14 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">How SiteForge AI Works</h2>
          <p className="text-white/50 text-lg">Four steps from zero to closed deal.</p>
        </div>
        <div className="space-y-10">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className={`h-16 w-16 rounded-2xl ${s.iconBg} flex items-center justify-center mb-4`}>
                <s.icon className={`h-8 w-8 ${s.iconColor}`} />
              </div>
              <p className={`text-sm font-semibold mb-1 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent`}>
                {s.num}
              </p>
              <h3 className="font-bold text-xl mb-2">{s.title}</h3>
              <p className="text-white/50 text-sm max-w-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-14 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Plans that grow with you</h2>
          <p className="text-white/50 text-lg">Start free. Upgrade when you're ready. Cancel anytime.</p>
        </div>
        <div className="space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 relative ${
                plan.popular
                  ? "border-indigo-500/60 bg-white/5"
                  : "border-white/10 bg-white/3"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
              <p className="text-white/50 text-sm mb-4">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-white/50">/month</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full h-11 rounded-xl font-semibold ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                }`}
                onClick={goToDashboard}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-white/5 py-14 text-center px-4">
        <h2 className="text-2xl font-bold mb-3">Ready to grow your agency?</h2>
        <p className="text-white/50 mb-6">Join thousands of agencies already closing more deals with SiteForge AI.</p>
        <Button
          className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl gap-2 font-semibold"
          onClick={goToDashboard}
        >
          Get Started Free <ArrowRight className="h-5 w-5" />
        </Button>
      </section>
    </div>
  );
}
