
import React from "react";

type ErrorBoundaryState = { hasError: boolean };

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-viewport flex items-center justify-center">
          <div className="text-center space-y-3">
            <h2 className="text-lg font-semibold">Un problème est survenu</h2>
            <p className="text-muted-foreground">Veuillez recharger la page.</p>
            <button onClick={this.handleReload} className="px-4 py-2 rounded-md border theme-border">
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;
