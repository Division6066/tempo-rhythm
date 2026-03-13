import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Heart, Maximize, Zap } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="bg-background pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-serif mb-6">Built for minds that move differently.</h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We started Tempo because we were tired of tools that made us feel broken.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-serif">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Traditional planners assume you operate like a machine: input task, output execution. But ADHD brains don't work like that. We run on interest, urgency, and momentum.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                After trying dozens of productivity apps and abandoning them by day three, we decided to build something different. A tool that acts as scaffolding, not a cage. A tool that uses AI to reduce executive dysfunction instead of adding to it.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="aspect-square rounded-3xl overflow-hidden bg-accent relative"
            >
              <img 
                src={`${import.meta.env.BASE_URL}images/focus-illustration.png`} 
                alt="Focus Illustration" 
                className="w-full h-full object-cover p-8"
              />
            </motion.div>
          </div>

          <div className="space-y-16">
            <h2 className="text-3xl font-serif text-center mb-12">Our Values</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-border">
                <Heart className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">Empathy First</h3>
                <p className="text-muted-foreground">
                  We design for bad brain days. If the app feels overwhelming when you're stressed, we've failed.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-border">
                <Maximize className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">Radical Simplicity</h3>
                <p className="text-muted-foreground">
                  Less configuration, more doing. We hide complexity behind clean interfaces and smart defaults.
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-border">
                <Zap className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">Flow State Focus</h3>
                <p className="text-muted-foreground">
                  Everything in Tempo is designed to get you into flow and keep you there without distraction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
