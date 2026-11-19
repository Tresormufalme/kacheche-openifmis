import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DepartmentService } from '../../../core/services/department.service';
import { BaseEntityForm } from '../../../shared/base/base-entity-form';
import {
  Department,
  DepartmentRequest
} from '../../../shared/models/department.model';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './department-form.html',
  styleUrl: './department-form.scss'
})
export class DepartmentForm extends BaseEntityForm<Department, DepartmentRequest> {

  private readonly fb = inject(FormBuilder);

  protected override readonly service = inject(DepartmentService);

  protected override readonly saveFailed =
    'Une erreur est survenue lors de l’enregistrement du département.';

  // Mêmes règles que DepartmentRequest côté Spring Boot.
  override readonly form = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ]],
    code: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(20),
      Validators.pattern(/^[A-Z0-9_-]+$/)
    ]],
    description: ['', [
      Validators.maxLength(500)
    ]]
  });

  protected override populate(department: Department | null): void {
    this.form.reset({
      name: department?.name ?? '',
      code: department?.code ?? '',
      description: department?.description ?? ''
    });
  }

  protected override toRequest(): DepartmentRequest {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      code: value.code.trim(),
      description: value.description.trim()
    };
  }

  // Le code est toujours saisi en majuscules (règle imposée par le backend).
  upperCaseCode(): void {
    const control = this.form.controls.code;
    control.setValue(control.value.toUpperCase(), { emitEvent: false });
  }
}
