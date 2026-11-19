import { Versioned } from './base.model';

export interface Department extends Versioned {
  name: string;
  code: string;
  description: string | null;
}

// Version réduite renvoyée à l'intérieur d'un budget.
export interface DepartmentSummary {
  id: number;
  name: string;
  code: string;
}

// La version est ajoutée automatiquement par BaseCrudService.update().
export interface DepartmentRequest {
  name: string;
  code: string;
  description: string;
}
