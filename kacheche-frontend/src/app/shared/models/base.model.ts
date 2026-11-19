// Toute ressource renvoyée par le backend porte un identifiant
// et une version (optimistic locking).
export interface Versioned {
  id: number;
  version: number;
}
