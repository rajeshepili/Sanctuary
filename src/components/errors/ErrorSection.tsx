import { AlertCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface ErrorSectionProps {
  title: string
  message: string
  onRetry?: () => void
  showDetails?: boolean
  details?: string
}

export function ErrorSection({
  title,
  message,
  onRetry,
  showDetails,
  details,
}: ErrorSectionProps) {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
      <div className="flex gap-4">
        <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          {showDetails && details && (
            <pre className="mt-3 overflow-auto rounded bg-background/50 p-3 text-xs text-muted-foreground">
              {details}
            </pre>
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
