import { Component } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
          <div className="glass-card-accent rounded-2xl p-8 max-w-md w-full text-center card-highlight">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 mx-auto mb-6 border border-rose-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">Something went wrong</h2>
            <p className="text-sm text-zinc-500 mb-6">An unexpected error occurred. Please reload the app.</p>
            {this.state.error && (
              <p className="text-[10px] text-zinc-600 bg-zinc-900/50 rounded-xl p-3 mb-6 font-mono border border-white/5 text-left truncate">
                {this.state.error.message}
              </p>
            )}
            <button onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}