
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Department } from '../../../shared/models/department.model';
import { DepartmentService } from '../../../core/services/department.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './department-form.html',
  styleUrl: './department-form.scss'
})
export class DepartmentForm implements OnChanges {

  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);

  @Input() department: Department | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isSubmitting = false;
  errorMessage = '';

  departmentForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(120)
    ]],
    code: ['', [
      Validators.required,
      Validators.pattern(/^[A-Z0-9-]+$/),
      Validators.maxLength(20)
    ]],
    description: ['', [
      Validators.maxLength(500)
    ]]
  });

  ngOnChanges(): void {
    if (this.department) {
      this.departmentForm.patchValue({
        name: this.department.name,
        code: this.department.code,
        description: this.department.description ?? ''
      });
    } else {
      this.departmentForm.reset({
        name: '',
        code: '',
        description: ''
      });
    }
  }

  submit(): void {

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request = this.departmentForm.getRawValue();

    const operation = this.department
      ? this.departmentService.update(this.department.id, request)
      : this.departmentService.create(request);

    operation.subscribe({

      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
      },

      error: (error) => {
        console.error('Erreur lors de l’enregistrement du département :', error);

        this.isSubmitting = false;

        if (error.status === 409) {
          this.errorMessage = 'Ce code de département existe déjà.';
        } else if (error.status === 400) {
          this.errorMessage = 'Les informations saisies sont invalides.';
        } else if (error.status === 403) {
          this.errorMessage = 'Vous n’avez pas les permissions nécessaires.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l’enregistrement.';
        }
      }

    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
