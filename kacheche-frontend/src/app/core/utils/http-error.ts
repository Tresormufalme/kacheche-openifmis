import { HttpErrorResponse } from '@angular/common/http';

interface ApiError {
  error?: string;
  message?: string;
}

// Le backend répond 409 + "Version Conflict" quand un autre utilisateur
// a modifié la ressource entre-temps (optimistic locking).
export function isVersionConflict(error: unknown): boolean {
  return (
    error instanceof HttpErrorResponse &&
    error.status === 409 &&
    (error.error as ApiError | null)?.error === 'Version Conflict'
  );
}

// Transforme une erreur HTTP en message lisible (le backend renvoie déjà
// des messages métier en français dans le champ "message").
export function describeError(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Le serveur est injoignable. Vérifiez votre connexion.';
    }

    if (error.status === 403) {
      return 'Vous n’avez pas les permissions nécessaires pour cette action.';
    }

    const message = (error.error as ApiError | null)?.message;

    if (message) {
      return message;
    }
  }

  return fallback;
}
