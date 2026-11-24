import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { BaseCrudService } from './base-crud.service';
import { AppUser, UserRequest } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseCrudService<AppUser, UserRequest> {

  constructor() {
    super(`${API_URL}/users`);
  }

  // Réinitialisation par un administrateur : mot de passe provisoire.
  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reset-password`, { newPassword });
  }
}
