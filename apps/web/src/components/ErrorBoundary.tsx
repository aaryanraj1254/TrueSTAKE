import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
            <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Refresh the page or return to the dashboard.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign('/dashboard')}
              className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
