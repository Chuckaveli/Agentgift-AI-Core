"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo)

    // Send to error tracking service
    if (typeof window !== "undefined") {
      fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error)
    }

    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>

            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or return to the homepage.
            </p>

            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>

              <Button variant="outline" onClick={() => this.setState({ hasError: false })} className="w-full">
                Try Again
              </Button>

              <Button variant="ghost" asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="text-xs bg-red-50 p-3 rounded border border-red-200">
                    <p className="font-semibold text-red-800 mb-1">Error Message:</p>
                    <p className="text-red-700">{this.state.error.message}</p>
                  </div>
                  <div className="text-xs bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-1">Stack Trace:</p>
                    <pre className="text-gray-700 overflow-auto max-h-40">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div className="text-xs bg-gray-50 p-3 rounded border border-gray-200">
                      <p className="font-semibold text-gray-800 mb-1">Component Stack:</p>
                      <pre className="text-gray-700 overflow-auto max-h-40">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
