import type { ReactNode } from 'react'
import { Component } from 'react'
import { GlobalErrorFallback } from '#/components/layout/GlobalErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <GlobalErrorFallback
            error={this.state.error || new Error('Unknown error')}
            reset={() => this.setState({ hasError: false, error: null })}
          />
        )
      )
    }

    return this.props.children
  }
}
