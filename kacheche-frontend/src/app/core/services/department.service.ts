import { Injectable } from '@angular/core';

import { API_URL } from '../config/api.config';
import { BaseCrudService } from './base-crud.service';
import {
  Department,
  DepartmentRequest
} from '../../shared/models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService extends BaseCrudService<Department, DepartmentRequest> {

  constructor() {
    super(`${API_URL}/departments`);
  }
}
