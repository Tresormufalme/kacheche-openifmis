import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DepartmentService } from '../../core/services/department.service';
import { BaseCrudPage, CrudPageText } from '../../shared/base/base-crud-page';
import { AuditButton } from '../../shared/components/audit-button/audit-button';
import {
  Department,
  DepartmentRequest
} from '../../shared/models/department.model';
import { DepartmentForm } from './department-form/department-form';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    AuditButton,
    DepartmentForm,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './departments.html',
  styleUrl: './departments.scss'
})
export class Departments extends BaseCrudPage<Department, DepartmentRequest> {

  protected override readonly service = inject(DepartmentService);

  protected override readonly resource = 'DEPARTMENT';

  protected override readonly text: CrudPageText = {
    loadFailed: 'Impossible de charger les départements depuis le serveur.',
    created: 'Le département a été créé avec succès.',
    updated: 'Le département a été modifié avec succès.',
    deleted: 'Le département a été supprimé avec succès.',
    deleteTitle: 'Supprimer le département',
    deleteFailed:
      'Impossible de supprimer ce département. Il est peut-être utilisé par des budgets.'
  };

  protected override deleteMessage(department: Department): string {
    return `Voulez-vous vraiment supprimer le département « ${department.name} » ? ` +
      'Cette action est enregistrée dans l’audit trail.';
  }
}
