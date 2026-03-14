import { motion } from "framer-motion";
import { Link } from "wouter";
import { Brain, Clock, Inbox, Sparkles, CheckCircle2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TEMPO",
  "url": "https://tempo.app",
  "logo": "https://tempo.app/opengraph.jpg",
  "description": "ADHD-friendly AI planner. Daily planning, smart task management, and focus tools designed for neurodivergent minds.",
  "sameAs": [
    "https://twitter.com/tempo",
    "https://linkedin.com/company/tempo"
  ]
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

export default function Home() {
  return (
    <Layout>
      <SEO
        title="TEMPO — ADHD-Friendly AI Planner"
        description="TEMPO uses AI to gracefully organize your chaos. Daily planning, smart task management, and focus tools designed for ADHD and neurodivergent minds."
        path="/"
        jsonLd={organizationJsonLd}
      />
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
            alt="Abstract Background" 
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <motion.div 
          className="max-w-4xl mx-auto px-6 relative z-10 text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>Meet your new AI executive assistant</span>
          </motion.div>
          
          <motion.h1 variants={item} className="text-5xl md:text-7xl font-serif text-foreground leading-[1.1] mb-6">
            Your ADHD brain deserves a <span className="text-primary italic">planner</span> that gets it.
          </motion.h1>
          
          <motion.p variants={item} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Tempo uses AI to gracefully organize your chaos. We handle the heavy lifting of scheduling, prioritizing, and breaking down tasks so you can just focus on doing.
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="w-full sm:w-auto text-lg font-semibold bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started Free
            </Link>
            <Link 
              href="/features"
              className="w-full sm:w-auto text-lg font-medium text-foreground bg-white border border-border px-8 py-4 rounded-full hover:bg-secondary transition-all"
            >
              See how it works
            </Link>
          </motion.div>
          
          <motion.p variants={item} className="mt-6 text-sm text-muted-foreground">
            No credit card required. 14-day free trial on Pro.
          </motion.p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Designed for how you naturally work</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              We stripped away the rigid structures of traditional planners and replaced them with flexible, intelligent systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="text-primary w-8 h-8" />,
                title: "AI Daily Planning",
                desc: "Wake up to a pre-staged daily plan. Tempo analyzes your inbox, calendar, and past habits to suggest a realistic schedule."
              },
              {
                icon: <Clock className="text-primary w-8 h-8" />,
                title: "Flexible Focus Blocks",
                desc: "Don't force it. Tempo suggests focus periods based on your energy levels, complete with built-in timers and gentle nudges."
              },
              {
                icon: <Inbox className="text-primary w-8 h-8" />,
                title: "Smart Brain Dump",
                desc: "Just type or speak your chaotic thoughts into the Inbox. Our AI automatically categorizes, tags, and schedules them for you."
              }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="bg-background rounded-3xl p-8 border border-border/50 card-hover"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Quote */}
      <section className="py-24 bg-accent relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-8">
            {[1, 2, 3, 4, 5].map(star => (
              <svg key={star} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <h2 className="text-2xl md:text-4xl font-serif text-foreground leading-relaxed mb-8">
            "For the first time in my life, I don't feel guilty about my to-do list. Tempo actually adapts to my brain instead of asking my brain to adapt to it."
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/80 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Sarah J.</p>
              <p className="text-sm text-muted-foreground">Product Designer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 bg-white text-center px-6">
        <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to find your tempo?</h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join thousands of neurodivergent professionals who have finally found a system that sticks.
        </p>
        <Link 
          href="/signup"
          className="inline-flex text-lg font-semibold bg-primary text-primary-foreground px-10 py-4 rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1"
        >
          Start Your Free Trial
        </Link>
      </section>
    </Layout>
  );
}
