import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message = 'Something went wrong',
  className = '',
}: ErrorMessageProps) {
  return (
    <div className={`p-8 ${className}`}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
