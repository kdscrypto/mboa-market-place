import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md space-y-4">
            <h2 className="text-2xl font-semibold">Un problème est survenu</h2>
            <p className="text-muted-foreground">
              Une erreur inattendue a empêché l'affichage de la page. Vous pouvez réessayer.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-md bg-mboa-orange text-white hover:opacity-90"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
