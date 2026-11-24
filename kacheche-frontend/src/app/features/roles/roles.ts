import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RoleService } from '../../core/services/role.service';
import { BaseCrudPage, CrudPageText } from '../../shared/base/base-crud-page';
import { AuditButton } from '../../shared/components/audit-button/audit-button';
import { Role, RoleRequest } from '../../shared/models/role.model';
import { RoleForm } from './role-form/role-form';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    AuditButton,
    RoleForm,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.scss'
})
export class Roles extends BaseCrudPage<Role, RoleRequest> {

  protected override readonly service = inject(RoleService);

  protected override readonly resource = 'ROLE';

  protected override readonly text: CrudPageText = {
    loadFailed: 'Impossible de charger les rôles.',
    created: 'Le rôle a été créé avec succès.',
    updated: 'Le rôle a été modifié avec succès. Les utilisateurs concernés le voient à leur prochaine requête.',
    deleted: 'Le rôle a été supprimé avec succès.',
    deleteTitle: 'Supprimer le rôle',
    deleteFailed: 'Impossible de supprimer ce rôle.'
  };

  protected override deleteMessage(role: Role): string {
    return `Voulez-vous vraiment supprimer le rôle « ${role.name} » ? ` +
      'Cette action est enregistrée dans l’audit trail.';
  }

  // Aperçu des permissions dans la liste : 5 premières + compteur.
  preview(role: Role): string[] {
    return role.permissions.slice(0, 5);
  }
}
