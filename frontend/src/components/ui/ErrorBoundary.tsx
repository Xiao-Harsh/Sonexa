import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside SONEXA React context:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-neutral-950/20 border border-neutral-900 rounded-3xl max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="p-4.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full animate-bounce">
            <AlertCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Oops, something went wrong</h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
              We encountered an unexpected error while loading this content. Try refreshing or going back to the homepage.
            </p>
          </div>

          {this.state.error && (
            <div className="p-4 bg-neutral-900 border border-neutral-800/80 rounded-xl max-w-md mx-auto overflow-hidden">
              <p className="text-[11px] font-mono text-rose-400 truncate text-left">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          <div className="flex gap-4 items-center justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-full text-xs font-semibold cursor-pointer transition-all shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Page
            </button>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-full text-xs font-semibold cursor-pointer transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
            >
              <Home className="w-3.5 h-3.5" />
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
