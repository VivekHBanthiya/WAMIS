import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { OthersRecord, OthersService, UnitOption } from '../../services/others';
import { AuditDetails } from '../building/audit-details/audit-details';
import { WorkContext } from '../../services/work-context';

@Component({ selector: 'app-others', standalone: false, templateUrl: './others.html' })
export class Others implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OthersService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly workContext = inject(WorkContext);
  units: UnitOption[] = [];
  records: OthersRecord[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  editingId: number | null = null;
  adding = false;
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  readonly pageSizeOptions = [5, 10, 20, 50];
  readonly form: FormGroup = this.createForm();
  ngOnInit(): void { this.loadUnits(); this.loadRecords(); }
  private createForm(): FormGroup { return this.fb.group({ description: ['', [Validators.required, Validators.maxLength(1000)]], unitId: [null, Validators.required], quantity: [null, [Validators.required, Validators.min(0)]] }); }
  loadUnits(): void { this.service.getUnits().subscribe({ next: u => { this.units = u; this.cdr.markForCheck(); }, error: () => this.errorMessage = 'Unable to load units.' }); }
  loadRecords(page = this.pageIndex): void {
    this.loading = true;
    this.service.getOthers(page, this.pageSize).subscribe({ next: p => { this.records = p.content ?? []; this.totalElements = p.totalElements ?? 0; this.totalPages = p.totalPages ?? 0; this.pageIndex = p.number ?? page; this.pageSize = p.size ?? this.pageSize; this.loading = false; this.cdr.markForCheck(); }, error: e => { this.errorMessage = e?.error?.message ?? 'Unable to load Others records.'; this.loading = false; this.cdr.markForCheck(); } });
  }
  startAdd(): void { if (this.adding || this.editingId !== null) return; this.adding = true; this.form.reset(); this.errorMessage = ''; }
  cancelAdd(): void { this.adding = false; this.form.reset(); }
  edit(row: OthersRecord): void { if (this.saving) return; this.adding = false; this.editingId = row.id; this.form.setValue({ description: row.description, unitId: row.unit.id, quantity: row.quantity }); this.errorMessage = ''; }
  cancelEdit(): void { this.editingId = null; this.form.reset(); }
  save(): void {
    if (this.form.invalid || this.saving) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue(); const id = this.editingId;
    const request = { description: String(v.description).trim(), unitId: Number(v.unitId), quantity: Number(v.quantity), ...(id === null && this.workContext.workId !== null ? { workId: this.workContext.workId } : {}) };
    this.saving = true; this.errorMessage = '';
    const op = id === null ? this.service.createOther(request) : this.service.updateOther(id, request);
    op.subscribe({ next: row => { if (id === null) { this.workContext.workId = row.workId ?? this.workContext.workId; this.records = [row, ...this.records].slice(0, this.pageSize); this.totalElements++; this.adding = true; } else { this.records = this.records.map(r => r.id === row.id ? row : r); this.editingId = null; } this.form.reset(); this.saving = false; this.cdr.markForCheck(); }, error: e => { this.errorMessage = e?.error?.message ?? 'Unable to save record.'; this.saving = false; this.cdr.markForCheck(); } });
  }
  delete(row: OthersRecord): void { if (this.saving || !confirm(`Delete "${row.description}"?`)) return; this.errorMessage = ''; this.service.deleteOther(row.id).subscribe({ next: () => { this.records = this.records.filter(r => r.id !== row.id); this.totalElements = Math.max(0, this.totalElements - 1); if (!this.records.length && this.pageIndex > 0) this.pageIndex--; this.loadRecords(this.pageIndex); }, error: e => this.errorMessage = e?.error?.message ?? 'Unable to delete record.' }); }
  viewAudit(row: OthersRecord): void { this.service.getAuditHistory(row.id).subscribe({ next: auditDetails => this.dialog.open(AuditDetails, { width: '900px', maxWidth: '95vw', maxHeight: '85vh', autoFocus: false, panelClass: 'audit-details-dialog', data: { building: row, auditDetails } }), error: e => this.errorMessage = e?.error?.message ?? 'Unable to load audit details.' }); }
  changePage(page: number): void { if (page >= 0 && page < this.totalPages && page !== this.pageIndex) this.loadRecords(page); }
  changePageSize(size: string): void { this.pageSize = Number(size); this.loadRecords(0); }
  get serialOffset(): number { return this.pageIndex * this.pageSize; }
}
