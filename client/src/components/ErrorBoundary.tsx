import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Last-resort boundary: without it a render crash unmounts the entire app
// and leaves a blank page with no clue. Shows the error + stack instead.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10">
          <h1 className="text-lg font-semibold text-rose-300 mb-2">
            Something crashed
          </h1>
          <p className="text-sm text-rose-200 mb-4 break-words">
            {this.state.error.message}
          </p>
          <pre className="text-xs text-rose-200/70 overflow-auto max-h-64 whitespace-pre-wrap">
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-medium"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
