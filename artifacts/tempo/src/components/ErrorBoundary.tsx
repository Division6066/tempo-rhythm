import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message ?? "Unknown error";
      const reportSubject = encodeURIComponent("Tempo Flow — Error Report");
      const reportBody = encodeURIComponent(
        `Hi, I encountered an error in Tempo Flow:\n\n${errorMessage}\n\nPage: ${window.location.href}\nTime: ${new Date().toISOString()}`
      );

      return (
        <div className="flex items-center justify-center min-h-[50vh] px-4">
          <div className="text-center max-w-md space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <details className="text-left bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <summary className="cursor-pointer font-medium">Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {errorMessage}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
              <a
                href={`mailto:support@tempo.app?subject=${reportSubject}&body=${reportBody}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors min-h-[44px]"
              >
                <MessageSquare className="h-4 w-4" />
                Report Issue
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
