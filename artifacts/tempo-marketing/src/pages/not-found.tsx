import { Link } from "wouter";
import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-8xl font-serif font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-serif mb-4">Page not found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex text-sm font-semibold bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/90 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
