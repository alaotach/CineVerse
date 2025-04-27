import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { logger } from '../../utils/logger';

interface ErrorHandlerProps {
  children: ReactNode;
}

interface ErrorHandlerState {
  hasError: boolean;
  error: Error | null;
}

class ErrorHandler extends Component<ErrorHandlerProps, ErrorHandlerState> {
  constructor(props: ErrorHandlerProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorHandlerState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('React Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="glass-card p-8 max-w-md mx-auto text-center">
            <AlertTriangle size={48} className="mx-auto text-warning mb-4" />
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              We're sorry, but there was an error rendering this component.
            </p>
            {this.state.error && (
              <div className="bg-background-dark rounded-lg p-4 mb-6 text-left overflow-auto">
                <p className="text-sm text-red-400 font-mono mb-2">Error:</p>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            <button onClick={this.handleRetry} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorHandler;
