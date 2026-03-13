import { Link } from "wouter";
import { Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wider text-primary mb-4 block">
            TEMPO
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Your ADHD brain deserves a planner that gets it. AI-powered daily planning for neurodivergent minds.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-primary transition-colors"><Twitter size={20} /></a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-primary transition-colors"><Github size={20} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-primary transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-foreground mb-4">Product</h4>
          <ul className="space-y-3">
            <li><Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
            <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
            <li><span className="text-sm text-muted-foreground/60 cursor-default">Integrations</span></li>
            <li><span className="text-sm text-muted-foreground/60 cursor-default">Changelog</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-foreground mb-4">Company</h4>
          <ul className="space-y-3">
            <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
            <li><span className="text-sm text-muted-foreground/60 cursor-default">Careers</span></li>
            <li><span className="text-sm text-muted-foreground/60 cursor-default">Blog</span></li>
            <li><span className="text-sm text-muted-foreground/60 cursor-default">Contact</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-foreground mb-4">Legal</h4>
          <ul className="space-y-3">
            <li><span className="text-sm text-muted-foreground/60 cursor-default">Privacy Policy</span></li>
            <li><span className="text-sm text-muted-foreground/60 cursor-default">Terms of Service</span></li>
            <li><span className="text-sm text-muted-foreground/60 cursor-default">Cookie Policy</span></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Tempo Labs Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
