import { Component, ReactNode } from 'react';
import { Film, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console or error reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRefresh = () => {
    // Refresh the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
          <div className="glass-card max-w-lg p-8 text-center">
            <Film className="h-16 w-16 text-neon-blue/30 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-300 mb-6">
              We're having trouble connecting to our booking service.
            </p>
            <div className="bg-background-dark/50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm font-mono text-gray-400 break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <button
              onClick={this.handleRefresh}
              className="btn-primary inline-flex items-center"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
