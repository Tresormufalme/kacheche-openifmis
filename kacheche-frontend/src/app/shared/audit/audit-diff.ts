import { RefNames } from '../../core/services/reference-lookup.service';
import { AuditEntry } from '../models/audit.model';
import { AuditFieldDef, STATUS_LABELS } from './audit-config';

export const EMPTY_VALUE = '—';

export type AuditKind = 'created' | 'updated' | 'deleted' | 'unknown';

export interface AuditChange {
  label: string;
  before: string;   // ancienne valeur
  after: string;    // nouvelle valeur
  changed: boolean;
}

export interface AuditRevision {
  revision: number;
  kind: AuditKind;
  kindLabel: string;
  date: string;
  username: string;
  changes: AuditChange[];
  changedCount: number;
}

const KIND_LABELS: Record<AuditKind, string> = {
  created: 'Création',
  updated: 'Modification',
  deleted: 'Suppression',
  unknown: 'Opération'
};

function kindOf(operation: string): AuditKind {
  switch (operation.toUpperCase()) {
    case 'ADD':
      return 'created';
    case 'MOD':
      return 'updated';
    case 'DEL':
      return 'deleted';
    default:
      return 'unknown';
  }
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Met en forme la valeur d'un champ pour l'affichage.
export function formatAuditValue(
  field: AuditFieldDef,
  entry: AuditEntry | undefined,
  refs: RefNames
): string {

  if (!entry) {
    return EMPTY_VALUE;
  }

  const raw = entry[field.key];

  if (raw === null || raw === undefined || raw === '') {
    return EMPTY_VALUE;
  }

  switch (field.type) {

    case 'money': {
      const amount = Number(raw);

      if (Number.isNaN(amount)) {
        return String(raw);
      }

      const currency = field.currencyKey
        ? entry[field.currencyKey]
        : null;

      return currency
        ? `${formatNumber(amount)} ${String(currency)}`
        : formatNumber(amount);
    }

    case 'date': {
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw));
      return match ? `${match[3]}/${match[2]}/${match[1]}` : String(raw);
    }

    case 'status':
      return STATUS_LABELS[String(raw)] ?? String(raw);

    case 'ref': {
      const name = field.refSource
        ? refs[field.refSource]?.get(Number(raw))
        : undefined;

      return name ? `${name} (#${String(raw)})` : `#${String(raw)}`;
    }

    default:
      return String(raw);
  }
}

/**
 * Transforme la liste brute des révisions en timeline lisible :
 *  - création     : valeurs initiales
 *  - modification : ancienne valeur -> nouvelle valeur, champ par champ
 *  - suppression  : dernières valeurs connues avant la suppression
 * Résultat trié de la plus récente à la plus ancienne.
 */
export function buildAuditTimeline(
  entries: AuditEntry[],
  fields: AuditFieldDef[],
  refs: RefNames
): AuditRevision[] {

  const ordered = [...entries].sort((a, b) => a.revision - b.revision);

  const timeline: AuditRevision[] = [];

  let lastKnown: AuditEntry | undefined;

  for (const entry of ordered) {

    const kind = kindOf(entry.operation);

    const changes: AuditChange[] = fields.map(field => {

      const before = kind === 'created'
        ? EMPTY_VALUE
        : formatAuditValue(field, lastKnown, refs);

      const after = kind === 'deleted'
        ? EMPTY_VALUE
        : formatAuditValue(field, entry, refs);

      return {
        label: field.label,
        before,
        after,
        changed: before !== after
      };
    });

    timeline.push({
      revision: entry.revision,
      kind,
      kindLabel: KIND_LABELS[kind],
      date: entry.revisionDate,
      username: entry.username || 'Utilisateur inconnu',
      changes,
      changedCount: changes.filter(change => change.changed).length
    });

    if (kind !== 'deleted') {
      lastKnown = entry;
    }
  }

  return timeline.reverse();
}
