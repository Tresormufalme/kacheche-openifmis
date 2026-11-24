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

  it('montre les permissions ajoutées et retirées d’un rôle', () => {
    const roleFields = AUDIT_ENTITIES['roles'].fields;

    const timeline = buildAuditTimeline([
      entry({ revision: 1, operation: 'ADD', name: 'GEST', description: null, systemRole: false,
        permissions: ['BUDGET_READ', 'EXPENSE_READ'] }),
      entry({ revision: 2, operation: 'MOD', name: 'GEST', description: null, systemRole: false,
        permissions: ['BUDGET_READ', 'EXPENSE_APPROVE'] })
    ], roleFields, {});

    const permissions = timeline[0].changes.find(c => c.label === 'Permissions')!;

    expect(permissions.changed).toBe(true);
    expect(permissions.list!.before.find(c => c.label === 'EXPENSE_READ')!.state).toBe('removed');
    expect(permissions.list!.after.find(c => c.label === 'EXPENSE_APPROVE')!.state).toBe('added');
    expect(permissions.list!.after.find(c => c.label === 'BUDGET_READ')!.state).toBe('same');
  });

  it('résout les noms des rôles d’un utilisateur et affiche Oui/Non', () => {
    const userFields = AUDIT_ENTITIES['users'].fields;

    const timeline = buildAuditTimeline([
      entry({ revision: 1, operation: 'ADD', username: 'admin', fullName: 'J', email: null,
        enabled: true, mustChangePassword: true, roles: [2] })
    ], userFields, { roles: new Map([[2, 'COMPTABLE']]) });

    const roles = timeline[0].changes.find(c => c.label === 'Rôles')!;
    const enabled = timeline[0].changes.find(c => c.label === 'Compte actif')!;

    expect(roles.after).toBe('COMPTABLE');
    expect(enabled.after).toBe('Oui');
  });
});
