
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-audit-details',
  standalone: false,
  templateUrl: './audit-details.html',
})
export class AuditDetails {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      building: any;
      auditDetails: any[];
    }
  ) {}
}
