import { Injectable } from '@angular/core';

import { API_URL } from '../config/api.config';
import { BaseCrudService } from './base-crud.service';
import { Role, RoleRequest } from '../../shared/models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseCrudService<Role, RoleRequest> {

  constructor() {
    super(`${API_URL}/roles`);
  }
}
