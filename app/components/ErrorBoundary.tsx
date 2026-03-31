"use client"

import React from "react"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          background: "rgba(245,243,239,0.03)",
          border: "1px solid rgba(245,243,239,0.08)",
          padding: "32px 36px",
        }}>
          <p style={{
            fontSize: "13px",
            color: "rgba(245,243,239,0.5)",
            margin: 0,
          }}>
            Something went wrong loading this section.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
