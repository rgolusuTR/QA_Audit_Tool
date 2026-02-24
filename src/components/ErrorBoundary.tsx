import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('Error details:', errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <h2 className="text-xl font-bold text-red-800 mb-4">
            Something went wrong
          </h2>
          <div className="bg-white p-4 rounded border border-red-300 mb-4">
            <p className="text-sm font-mono text-red-700 mb-2">
              {this.state.error?.toString()}
            </p>
            {this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-red-800 mb-2">
                  Component Stack
                </summary>
                <pre className="text-xs text-red-600 overflow-auto max-h-64 bg-red-50 p-2 rounded">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}