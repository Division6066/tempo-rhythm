import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export default function Layout({ children, hideNavFooter = false }: { children: ReactNode, hideNavFooter?: boolean }) {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background">
      {!hideNavFooter && <Navbar />}
      
      <AnimatePresence mode="wait">
        <motion.main
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn("flex-grow", !hideNavFooter && "pt-20")}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      {!hideNavFooter && <Footer />}
    </div>
  );
}

import { cn } from "@/lib/utils";
