import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { BudgetService } from './budget.service';

describe('BudgetService', () => {
  let service: BudgetService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BudgetService);
    http = TestBed.inject(HttpTestingController);
  });

  it('envoie la version lue lors d’une modification (optimistic locking)', () => {
    service.update(
      { id: 5, version: 3 },
      { name: 'B', fiscalYear: 2026, totalAmount: 10, currency: 'USD', departmentId: 1 }
    ).subscribe();

    const req = http.expectOne('http://localhost:8080/api/budgets/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.version).toBe(3);
    req.flush({});
  });
});
