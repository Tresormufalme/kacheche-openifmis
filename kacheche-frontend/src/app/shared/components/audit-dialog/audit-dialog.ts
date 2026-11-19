import { Component, inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { getAuditConfig } from '../../audit/audit-config';
import { AuditTimeline } from '../audit-timeline/audit-timeline';

export interface AuditDialogData {
  entity: string;
  entityId: number;
  title: string;
}

@Component({
  selector: 'app-audit-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    AuditTimeline
  ],
  templateUrl: './audit-dialog.html',
  styleUrl: './audit-dialog.scss'
})
export class AuditDialog {

  readonly data = inject<AuditDialogData>(MAT_DIALOG_DATA);

  readonly config = getAuditConfig(this.data.entity);
}
