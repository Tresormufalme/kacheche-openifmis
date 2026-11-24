import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { BudgetService } from './budget.service';
import { DepartmentService } from './department.service';
import { RoleService } from './role.service';

export type RefSource = 'departments' | 'budgets' | 'roles';

export type RefNames = Partial<Record<RefSource, Map<number, string>>>;

/**
 * Résout les identifiants rencontrés dans l'audit (departmentId, budgetId...)
 * en noms lisibles. Si une source est indisponible, l'audit affiche "#id".
 */
@Injectable({
  providedIn: 'root'
})
export class ReferenceLookupService {

  private readonly departments = inject(DepartmentService);
  private readonly budgets = inject(BudgetService);
  private readonly roles = inject(RoleService);

  load(sources: RefSource[]): Observable<RefNames> {

    if (sources.length === 0) {
      return of({});
    }

    return forkJoin(
      sources.map(source =>
        this.names(source).pipe(
          catchError(() => of(new Map<number, string>())),
          map(names => [source, names] as const)
        )
      )
    ).pipe(
      map(entries => Object.fromEntries(entries) as RefNames)
    );
  }

  private names(source: RefSource): Observable<Map<number, string>> {

    if (source === 'departments') {
      return this.departments.getAll().pipe(
        map(items => new Map(items.map(item => [item.id, item.name] as const)))
      );
    }

    if (source === 'roles') {
      return this.roles.getAll().pipe(
        map(items => new Map(items.map(item => [item.id, item.name] as const)))
      );
    }

    return this.budgets.getAll().pipe(
      map(items => new Map(items.map(item => [item.id, item.name] as const)))
    );
  }
}
