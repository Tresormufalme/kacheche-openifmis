import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { AuditTimeline } from './audit-timeline';

describe('AuditTimeline', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditTimeline],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('affiche anciennes valeurs, nouvelles valeurs et auteur', async () => {

    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AuditTimeline);

    fixture.componentRef.setInput('entity', 'budgets');
    fixture.componentRef.setInput('entityId', 5);
    fixture.detectChanges();

    http.expectOne('http://localhost:8080/api/audit/budgets/5').flush([
      {
        entityId: 5, revision: 1, operation: 'ADD', username: 'admin',
        revisionDate: '2026-11-18T08:00:00Z',
        name: 'Budget 2026', fiscalYear: 2026, totalAmount: 100,
        currency: 'USD', departmentId: 1
      },
      {
        entityId: 5, revision: 2, operation: 'MOD', username: 'comptable',
        revisionDate: '2026-11-19T09:30:00Z',
        name: 'Budget 2026', fiscalYear: 2026, totalAmount: 250,
        currency: 'USD', departmentId: 1
      }
    ]);

    http.expectOne('http://localhost:8080/api/departments').flush([
      { id: 1, name: 'Finances', code: 'FIN', description: null, version: 0 }
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Modification');
    expect(text).toContain('comptable');
    expect(text).toContain('100.00 USD');
    expect(text).toContain('250.00 USD');
    expect(text).toContain('Création');
    expect(text).toContain('Finances (#1)');
  });
});
