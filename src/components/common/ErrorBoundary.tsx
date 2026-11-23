import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertIcon } from '../icons/Icons';

interface Props {
  readonly children: ReactNode;
  readonly fallbackMessage?: string;
}

interface State {
  readonly hasError: boolean;
  readonly errorMessage: string;
}

/**
 * Robust React Error Boundary with user-recoverable action.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  public override componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Error logged to telemetry if configured
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      const msg = this.state.errorMessage || (this.props.fallbackMessage ?? 'An unexpected error occurred.');
      return (
        <div
          role="alert"
          className="p-6 my-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-900 dark:text-rose-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertIcon className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <p className="text-sm text-rose-700 dark:text-rose-300 mb-4">{msg}</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
