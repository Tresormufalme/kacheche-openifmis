import { AuditEntry } from '../models/audit.model';
import { AUDIT_ENTITIES } from './audit-config';
import { buildAuditTimeline } from './audit-diff';

function entry(partial: Partial<AuditEntry>): AuditEntry {
  return {
    entityId: 1,
    revision: 1,
    operation: 'ADD',
    revisionDate: '2026-11-19T10:00:00Z',
    username: 'admin',
    ...partial
  };
}

describe('buildAuditTimeline', () => {

  const fields = AUDIT_ENTITIES['budgets'].fields;

  it('montre ancienne et nouvelle valeur pour une modification', () => {
    const timeline = buildAuditTimeline([
      entry({ revision: 1, operation: 'ADD', name: 'B1', totalAmount: 100, currency: 'USD', departmentId: 1, fiscalYear: 2026 }),
      entry({ revision: 2, operation: 'MOD', username: 'comptable', name: 'B1', totalAmount: 250, currency: 'USD', departmentId: 1, fiscalYear: 2026 })
    ], fields, {});

    // la plus récente en premier
    expect(timeline[0].kind).toBe('updated');
    expect(timeline[0].username).toBe('comptable');
    expect(timeline[0].changedCount).toBe(1);

    const amount = timeline[0].changes.find(c => c.label === 'Montant total')!;
    expect(amount.before).toBe('100.00 USD');
    expect(amount.after).toBe('250.00 USD');
  });

  it('affiche les dernières valeurs connues pour une suppression', () => {
    const timeline = buildAuditTimeline([
      entry({ revision: 1, operation: 'ADD', name: 'B1', totalAmount: 100, currency: 'USD', departmentId: 1, fiscalYear: 2026 }),
      entry({ revision: 2, operation: 'DEL', name: null, totalAmount: null, currency: null, departmentId: null, fiscalYear: null })
    ], fields, {});

    expect(timeline[0].kind).toBe('deleted');

    const name = timeline[0].changes.find(c => c.label === 'Nom du budget')!;
    expect(name.before).toBe('B1');
    expect(name.after).toBe('—');
  });

  it('résout le nom du département via les références', () => {
    const timeline = buildAuditTimeline([
      entry({ revision: 1, operation: 'ADD', name: 'B1', totalAmount: 1, currency: 'CDF', departmentId: 7, fiscalYear: 2026 })
    ], fields, { departments: new Map([[7, 'Finances']]) });

    const dept = timeline[0].changes.find(c => c.label === 'Département')!;
    expect(dept.after).toBe('Finances (#7)');
  });
});
