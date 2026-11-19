import {
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BaseCrudService } from '../../core/services/base-crud.service';
import { describeError, isVersionConflict } from '../../core/utils/http-error';
import { Versioned } from '../models/base.model';

/**
 * Formulaire générique création / modification.
 * Gère l'envoi, l'état "enregistrement", les erreurs et le conflit de version.
 * Chaque formulaire déclare seulement ses champs.
 */
@Directive()
export abstract class BaseEntityForm<T extends Versioned, R extends object>
  implements OnChanges {

  // Élément à modifier ; null = création.
  @Input() entity: T | null = null;

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() conflict = new EventEmitter<string>();

  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  protected abstract readonly service: BaseCrudService<T, R>;
  protected abstract readonly saveFailed: string;

  abstract readonly form: FormGroup;

  protected abstract toRequest(): R;
  protected abstract populate(entity: T | null): void;

  get isEditMode(): boolean {
    return this.entity !== null;
  }

  ngOnChanges(): void {
    this.errorMessage.set('');
    this.populate(this.entity);
  }

  submit(): void {

    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.toRequest();

    this.isSaving.set(true);
    this.errorMessage.set('');

    const operation = this.entity
      ? this.service.update(this.entity, request)
      : this.service.create(request);

    operation.subscribe({

      next: () => {
        this.isSaving.set(false);
        this.saved.emit();
      },

      error: (error) => {
        console.error(this.saveFailed, error);
        this.isSaving.set(false);

        if (isVersionConflict(error)) {
          this.conflict.emit(
            'Cet élément a été modifié par un autre utilisateur pendant que vous le ' +
            'modifiiez. La liste a été actualisée : recommencez votre modification.'
          );
          return;
        }

        this.errorMessage.set(describeError(error, this.saveFailed));
      }

    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
