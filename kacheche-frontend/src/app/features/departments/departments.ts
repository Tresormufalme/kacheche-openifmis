
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { DepartmentService } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';
import { Department } from '../../shared/models/department.model';
import { DepartmentForm } from './department-form/department-form';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    DepartmentForm,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './departments.html',
  styleUrls: ['./departments.scss']
})
export class Departments implements OnInit {

  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  departments: Department[] = [];

  displayedColumns: string[] = [
    'id',
    'name',
    'code',
    'description',
    'actions'
  ];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showForm = false;
  selectedDepartment: Department | null = null;

  // Vérifie le rôle de l'utilisateur connecté.
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  // Récupération des départements depuis Spring Boot.
  loadDepartments(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.markForCheck();

    this.departmentService.getAll().subscribe({

      next: (data) => {
        this.departments = data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: (err) => {
        console.error('Erreur lors du chargement des départements', err);

        this.errorMessage =
          'Impossible de charger les départements depuis le serveur.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }

    });
  }

  // Ouverture du formulaire de création.
  openCreateForm(): void {
    this.selectedDepartment = null;
    this.showForm = true;
    this.successMessage = '';
    this.cdr.markForCheck();
  }

  // Ouverture du formulaire de modification.
  openEditForm(department: Department): void {
    this.selectedDepartment = department;
    this.showForm = true;
    this.successMessage = '';
    this.cdr.markForCheck();
  }

  // Fermeture du formulaire.
  closeForm(): void {
    this.showForm = false;
    this.selectedDepartment = null;
    this.cdr.markForCheck();
  }

  // Appelée après une création ou une modification réussie.
  onDepartmentSaved(): void {

    const wasEditing = this.selectedDepartment !== null;

    this.closeForm();

    this.successMessage = wasEditing
      ? 'Le département a été modifié avec succès.'
      : 'Le département a été créé avec succès.';

    this.loadDepartments();
  }

  // Suppression d'un département.
  deleteDepartment(department: Department): void {

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le département "${department.name}" ?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.departmentService.delete(department.id).subscribe({

      next: () => {

        this.successMessage =
          'Le département a été supprimé avec succès.';

        this.loadDepartments();

      },

      error: (err) => {

        console.error('Erreur lors de la suppression', err);

        if (err.status === 403) {
          this.errorMessage =
            'Vous ne disposez pas des permissions nécessaires.';
        } else if (err.status === 409) {
          this.errorMessage =
            'Ce département ne peut pas être supprimé car il est utilisé.';
        } else {
          this.errorMessage =
            'Impossible de supprimer ce département.';
        }

        this.cdr.markForCheck();

      }

    });
  }
}
