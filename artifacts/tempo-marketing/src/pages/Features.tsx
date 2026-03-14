import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Mic, Calendar, ListTodo, BrainCircuit, Timer, ArrowRight, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

export default function Features() {
  const features = [
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: "AI Daily Staging",
      description: "Tempo reviews your overdue tasks, upcoming calendar events, and natural rhythms to propose a realistic plan for the day. You just Accept, Edit, or Reject.",
      color: "bg-blue-50"
    },
    {
      icon: <Mic className="w-8 h-8 text-primary" />,
      title: "Smart Brain Dump",
      description: "Got a thought? Don't lose it. Type it or record a voice memo. Our AI processes the raw text, extracts actionable items, and categorizes them automatically.",
      color: "bg-purple-50"
    },
    {
      icon: <Timer className="w-8 h-8 text-primary" />,
      title: "Flow State Timers",
      description: "Built-in Pomodoro and gentle time-tracking. When you start a task, Tempo hides everything else so you can focus on the one thing that matters right now.",
      color: "bg-orange-50"
    },
    {
      icon: <LayoutDashboard className="w-8 h-8 text-primary" />,
      title: "NotePlan-style Editor",
      description: "Edit your day like a text document. Markdown support, inline task creation, and seamless mixing of notes and action items.",
      color: "bg-green-50"
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary" />,
      title: "Two-Way Calendar Sync",
      description: "Integrates perfectly with Google and Outlook. Your schedule and your tasks live in harmony, not in silos.",
      color: "bg-yellow-50"
    },
    {
      icon: <ListTodo className="w-8 h-8 text-primary" />,
      title: "Gentle Rescheduling",
      description: "Didn't finish everything? No red badges of shame. Tempo gently rolls unfinished items over or asks if they are still relevant.",
      color: "bg-pink-50"
    }
  ];

  return (
    <Layout>
      <SEO
        title="Features — TEMPO"
        description="AI daily planning, smart brain dump, flow state timers, calendar sync, and gentle rescheduling. Discover the ADHD-friendly features that make TEMPO different."
        path="/features"
      />
      <div className="bg-background pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-5xl font-serif mb-6">Everything you need. Nothing you don't.</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A carefully curated suite of tools designed to bypass executive dysfunction and get you moving.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 rounded-2xl ${feat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-32 text-center bg-white rounded-[3rem] p-12 md:p-24 border border-border shadow-sm">
            <h2 className="text-4xl font-serif mb-6">See Tempo in action</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Stop fighting your brain. Start working with it. Experience the calm of a truly intelligent daily planner.
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 text-lg font-semibold bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Free Trial <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
