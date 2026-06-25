import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(err: any, fallbackMessage: string = 'An unexpected error occurred.'): string {
  if (!err) {
    return fallbackMessage;
  }

  // Handle Angular HttpErrorResponse
  if (err instanceof HttpErrorResponse || (err.status !== undefined && err.message !== undefined)) {
    // Connection / CORS / Server Down
    if (err.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection or try again later.';
    }

    // Backend returned structured message
    if (err.error?.message) {
      return err.error.message;
    }

    // Backend returned string directly
    if (typeof err.error === 'string' && err.error.trim().length > 0 && err.error.length < 200) {
      return err.error;
    }

    // ASP.NET Core Validation Errors (ModelState dictionary)
    if (err.error?.errors) {
      const validationErrors = err.error.errors;
      if (typeof validationErrors === 'object') {
        const messages = Object.values(validationErrors).flat();
        if (messages.length > 0) {
          return messages.join(' ');
        }
      }
    }

    // Backend validation list
    if (Array.isArray(err.error)) {
      const messages = err.error.map((e: any) => e.message || e).filter(Boolean);
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
  }

  // Standard JS Error object
  if (err.message && !err.message.includes('Http failure response')) {
    return err.message;
  }

  return fallbackMessage;
}
