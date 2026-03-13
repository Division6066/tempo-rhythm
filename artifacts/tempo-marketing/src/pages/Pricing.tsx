import Layout from "@/components/Layout";
import { Check, X } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect to test the waters and get basic organization.",
      features: [
        "Basic Daily Plan",
        "Standard Task Management",
        "5 AI Suggestions / day",
        "Community Support"
      ],
      missing: [
        "Calendar Integration",
        "Voice Memos to Tasks",
        "Advanced Analytics"
      ],
      cta: "Get Started",
      href: "/signup",
      highlight: false
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      description: "Everything you need to master your focus and time.",
      features: [
        "Everything in Free",
        "Unlimited AI Planning",
        "Two-Way Calendar Sync",
        "Voice Memos to Tasks",
        "Focus Timers & Analytics",
        "Priority Support"
      ],
      missing: [],
      cta: "Start 14-Day Trial",
      href: "/signup",
      highlight: true
    },
    {
      name: "Team",
      price: "$19",
      period: "/mo/user",
      description: "For teams that want to support neurodivergent workflows.",
      features: [
        "Everything in Pro",
        "Shared Workspaces",
        "Team Task Delegation",
        "Admin Controls & Billing",
        "Dedicated Success Manager"
      ],
      missing: [],
      cta: "Contact Sales",
      href: "#",
      highlight: false
    }
  ];

  return (
    <Layout>
      <div className="bg-background pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-5xl font-serif mb-6">Simple, transparent pricing</h1>
            <p className="text-xl text-muted-foreground">
              Invest in your peace of mind. Choose the plan that fits your rhythm.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "rounded-[2rem] p-8 flex flex-col relative bg-white transition-all duration-300",
                  tier.highlight 
                    ? "border-2 border-primary shadow-xl shadow-primary/10 scale-105 z-10" 
                    : "border border-border hover:shadow-lg"
                )}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-muted-foreground text-sm h-10">{tier.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-serif font-bold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-foreground text-sm font-medium">{f}</span>
                    </li>
                  ))}
                  {tier.missing.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 opacity-50">
                      <X className="w-5 h-5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={cn(
                    "w-full text-center py-4 rounded-xl font-semibold transition-all",
                    tier.highlight 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
