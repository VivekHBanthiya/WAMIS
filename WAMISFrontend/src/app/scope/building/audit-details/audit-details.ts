
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-audit-details',
  standalone: false,
  templateUrl: './audit-details.html',
})
export class AuditDetails {
  auditDetails: any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      building: any;
      auditDetails: any[];
    }
  ) {
    this.auditDetails = this.data.auditDetails;
    
  }
  pageIndex = 0;
pageSize = 5;

readonly pageSizeOptions = [5, 10, 20, 50];
readonly Math = Math;

get totalElements(): number {
  return this.auditDetails?.length ?? 0;
}

get totalPages(): number {
  return Math.ceil(this.totalElements / this.pageSize);
}

get paginatedAuditDetails(): any[] {
  const start = this.pageIndex * this.pageSize;

  return (this.auditDetails ?? []).slice(
    start,
    start + this.pageSize
  );
}

changePage(page: number): void {
  if (page < 0 || page >= this.totalPages) {
    return;
  }

  this.pageIndex = page;
}

changePageSize(value: string | number): void {
  this.pageSize = Number(value);
  this.pageIndex = 0;
}
  
}
