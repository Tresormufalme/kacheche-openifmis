import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  AuditEntityKey,
  AuditEntry
} from '../../shared/models/audit.model';

/**
 * Un seul service d'audit pour toutes les entités.
 * Fonctionne aussi pour les entités créées plus tard,
 * tant qu'elles sont @Audited côté backend.
 */
@Injectable({
  providedIn: 'root'
})
export class AuditService {

  private readonly http = inject(HttpClient);

  // GET /api/audit/departments/1 | /budgets/1 | /expenses/1 ...
  getHistory(entity: AuditEntityKey, id: number): Observable<AuditEntry[]> {
    return this.http.get<AuditEntry[]>(`${API_URL}/audit/${entity}/${id}`);
  }
}
