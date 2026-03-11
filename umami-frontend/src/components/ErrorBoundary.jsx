import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong.</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
