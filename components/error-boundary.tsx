"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: undefined, errorInfo: undefined };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Detect if this is an Explore tab crash
    const isExploreCrash = errorInfo?.componentStack?.includes('Explore') || 
                          errorInfo?.componentStack?.includes('ExploreDeck') ||
                          errorInfo?.componentStack?.includes('ExploreTab');
    
    // Enhanced logging with explore-crash prefix when applicable
    const logPrefix = isExploreCrash ? '[explore-crash]' : '[Error Boundary]';
    
    console.error(logPrefix, {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      name: error.name,
      timestamp: new Date().toISOString(),
    });
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const errorInfo = this.state.errorInfo;
      
      // Extract first 3-5 lines of stack trace for preview
      const getStackPreview = (stack: string | undefined): string => {
        if (!stack) return '';
        const lines = stack.split('\n').slice(0, 5);
        return lines.join('\n');
      };
      
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <div className="max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-destructive">
              {this.props.fallbackTitle || "Something went wrong"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {this.props.fallbackMessage || "We encountered an error. This has been logged and we'll look into it."}
            </p>
            {error && (
              <>
                {/* Show error message prominently */}
                <div className="mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  <p className="text-sm font-medium text-destructive mb-1">Error:</p>
                  <p className="text-sm text-foreground break-words">{error.message || 'Unknown error'}</p>
                </div>
                
                {/* Stack trace and component stack in details */}
                <details className="text-left mt-4 p-3 bg-muted rounded-md text-xs">
                  <summary className="cursor-pointer text-muted-foreground mb-2 font-medium">Error details</summary>
                  <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                    {error.stack && `Stack Trace:\n${getStackPreview(String(error.stack))}${String(error.stack).split('\n').length > 5 ? '\n...' : ''}`}
                    {errorInfo?.componentStack && `\n\nComponent Stack:\n${String(errorInfo.componentStack)}`}
                  </pre>
                </details>
              </>
            )}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={this.handleReset}
                variant="outline"
              >
                Try again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="default"
              >
                Reload page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

