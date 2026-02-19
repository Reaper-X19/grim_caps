import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Scene Error:', error, errorInfo)

    // Auto-recover from transient WebGL context loss (up to 3 retries)
    if (this.state.retryCount < 3) {
      setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          retryCount: prev.retryCount + 1
        }))
      }, 1500)
    }
  }

  render() {
    if (this.state.hasError) {
      // Show loading state while auto-recovering
      if (this.state.retryCount < 3) {
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-grim-darker to-grim-dark rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-grim-accent border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400">Reinitializing 3D scene...</p>
            </div>
          </div>
        )
      }

      // Permanent error after max retries
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-grim-darker to-grim-dark rounded-lg">
          <div className="text-center p-8">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-display font-semibold text-red-400 mb-2">
              3D Rendering Error
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              WebGL context could not be initialized
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-grim-accent text-grim-darker rounded hover:scale-105 transition-transform"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

