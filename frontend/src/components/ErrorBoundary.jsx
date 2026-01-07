import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F0E] text-[#F3F5F4] flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-4 text-[#1E7A4A]">Something went wrong</h1>
            <p className="text-[#A6B0AA] mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 bg-[#1E7A4A] text-[#F3F5F4] rounded-xl font-semibold hover:bg-[#2AAE67] transition-colors"
            >
              Reload Page
            </button>
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-[#A6B0AA] mb-2">
                Error Details
              </summary>
              <pre className="bg-[#101614] border border-[#1B2420] rounded-lg p-4 text-xs text-[#A6B0AA] overflow-auto">
                {this.state.error?.stack || JSON.stringify(this.state.error, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

