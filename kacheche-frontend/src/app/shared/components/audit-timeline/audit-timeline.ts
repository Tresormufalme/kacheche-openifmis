import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  computed,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription, map, switchMap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AuditService } from '../../../core/services/audit.service';
import {
  RefSource,
  ReferenceLookupService
} from '../../../core/services/reference-lookup.service';
import { describeError } from '../../../core/utils/http-error';
import {
  getAuditConfig,
  resolveAuditFields
} from '../../audit/audit-config';
import {
  AuditChange,
  AuditRevision,
  buildAuditTimeline
} from '../../audit/audit-diff';

/**
 * Timeline d'audit générique : anciennes valeurs, nouvelles valeurs,
 * auteur et date de chaque opération. Utilisée par la fenêtre d'audit
 * (bouton sur chaque ligne) et par la page "Audit Trails".
 */
@Component({
  selector: 'app-audit-timeline',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  templateUrl: './audit-timeline.html',
  styleUrl: './audit-timeline.scss'
})
export class AuditTimeline implements OnChanges, OnDestroy {

  private readonly auditService = inject(AuditService);
  private readonly lookup = inject(ReferenceLookupService);

  @Input({ required: true }) entity!: string;
  @Input({ required: true }) entityId!: number;

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly revisions = signal<AuditRevision[]>([]);
  readonly onlyChanges = signal(true);

  readonly contributors = computed(() =>
    new Set(this.revisions().map(revision => revision.username)).size
  );

  // Les révisions sont triées de la plus récente à la plus ancienne.
  readonly latest = computed(() => this.revisions()[0] ?? null);

  readonly creation = computed(() => {
    const all = this.revisions();
    const last = all[all.length - 1];

    return last?.kind === 'created' ? last : null;
  });

  private subscription?: Subscription;

  ngOnChanges(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  load(): void {

    this.subscription?.unsubscribe();

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.revisions.set([]);

    const config = getAuditConfig(this.entity);

    this.subscription = this.auditService
      .getHistory(this.entity, this.entityId)
      .pipe(
        switchMap(entries => {

          const fields = resolveAuditFields(config, entries);

          const sources = [...new Set(
            fields
              .filter(field => field.type === 'ref' && field.refSource)
              .map(field => field.refSource as RefSource)
          )];

          return this.lookup.load(sources).pipe(
            map(refs => buildAuditTimeline(entries, fields, refs))
          );
        })
      )
      .subscribe({

        next: (timeline) => {
          this.revisions.set(timeline);
          this.isLoading.set(false);
        },

        error: (error) => {
          console.error('Erreur lors du chargement de l’audit :', error);

          this.errorMessage.set(
            describeError(
              error,
              'Impossible de récupérer l’historique de cet élément.'
            )
          );

          this.isLoading.set(false);
        }

      });
  }

  // Champs à montrer pour une révision selon le réglage "uniquement modifiés".
  visibleChanges(revision: AuditRevision): AuditChange[] {
    return this.onlyChanges()
      ? revision.changes.filter(change => change.changed)
      : revision.changes;
  }

  icon(kind: AuditRevision['kind']): string {
    switch (kind) {
      case 'created':
        return 'add_circle';
      case 'updated':
        return 'edit';
      case 'deleted':
        return 'delete';
      default:
        return 'history';
    }
  }

  initials(username: string): string {
    return username.trim().slice(0, 2).toUpperCase();
  }
}
