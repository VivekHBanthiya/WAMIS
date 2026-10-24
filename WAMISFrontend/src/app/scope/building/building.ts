import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuditDetails } from './audit-details/audit-details';
import {
  BuildingRecord,
  BuildingService,
  DropdownOption,
  PageResponse,
} from '../../services/building';
import { WorkContext } from '../../services/work-context';
import { ConfirmDeleteDialog } from '../../shared/confirm-delete-dialog';
import { FeedbackSnackBar } from '../../shared/feedback-snackbar';

@Component({ selector: 'app-building', standalone: false, templateUrl: './building.html' })
export class Building implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BuildingService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly workContext = inject(WorkContext);
  @ViewChild('draftDescription') private draftDescription?: ElementRef<HTMLInputElement>;
  maintenanceTypes: DropdownOption[] = [];
  buildingActivities: DropdownOption[] = [];
  records: BuildingRecord[] = [];
  loading = false;
  loadingDropdowns = false;
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
  get buildingForm(): FormGroup {
    return this.form;
  }

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadBuildings();
  }
  private createForm(): FormGroup {
    return this.fb.group({
      buildingDescription: ['', [Validators.required, Validators.maxLength(1000)]],
      builtUpArea: [null, [Validators.required, Validators.min(0.01)]],
      numberOfFloors: [null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      numberOfBasements: [
        null,
        [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
      ],
      maintenanceType: ['', Validators.required],
      buildingActivity: ['', Validators.required],
    });
  }
  loadDropdowns(): void {
    this.loadingDropdowns = true;
    let done = 0;
    const finish = () => {
      if (++done === 2) this.loadingDropdowns = false;
    };
    this.service
      .getOptions('MAINTENANCE_TYPE')
      .subscribe({
        next: (v) => (this.maintenanceTypes = v),
        error: () => (this.errorMessage = 'Unable to load maintenance types.'),
        complete: finish,
      });
    this.service
      .getOptions('BUILDING_ACTIVITY')
      .subscribe({
        next: (v) => (this.buildingActivities = v),
        error: () => (this.errorMessage = 'Unable to load building activities.'),
        complete: finish,
      });
  }
  loadBuildings(page = this.pageIndex): void {
    this.loading = true;
    this.service.getAllBuildings(page, this.pageSize).subscribe({
      next: (result) => {
        if (Array.isArray(result)) {
          this.records = result;
          this.totalElements = result.length;
          this.totalPages = result.length ? 1 : 0;
        } else {
          const p = result as PageResponse<BuildingRecord>;
          this.records = p.content ?? [];
          this.totalElements = p.totalElements ?? 0;
          this.totalPages = p.totalPages ?? 0;
          this.pageIndex = p.number ?? page;
        }
        if (this.totalElements === 0 && this.editingId === null) this.adding = true;
        else if (this.pageIndex === 0 && this.editingId === null) this.adding = false;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.errorMessage = e?.error?.message ?? 'Unable to load buildings.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
  startAdd(): void {
    if (this.editingId !== null) return;
    if (!this.adding) {
      this.adding = true;
      this.form.reset();
      this.errorMessage = '';
    }
    setTimeout(() => this.draftDescription?.nativeElement.focus());
  }
  cancelAdd(): void {
    const hasInput = Object.values(this.form.getRawValue()).some(
      (value) => value !== null && String(value).trim() !== '',
    );
    if (hasInput) {
      this.errorMessage = 'This row has unsaved data. Save it before closing.';
      return;
    }
    this.adding = false;
    this.form.reset();
    this.errorMessage = '';
  }
  edit(row: BuildingRecord): void {
    if (this.saving) return;
    this.adding = false;
    this.editingId = row.id;
    this.form.patchValue(row);
    this.errorMessage = '';
  }
  cancelEdit(): void {
    this.editingId = null;
    this.form.reset();
    this.errorMessage = '';
  }
  save(): void {
    if (this.form.invalid || this.saving || this.loadingDropdowns) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const request = {
      buildingDescription: String(v.buildingDescription).trim(),
      builtUpArea: Number(v.builtUpArea),
      numberOfFloors: Number(v.numberOfFloors),
      numberOfBasements: Number(v.numberOfBasements),
      maintenanceType: v.maintenanceType,
      buildingActivity: v.buildingActivity,
      ...(this.editingId === null && this.workContext.workId !== null
        ? { workId: this.workContext.workId }
        : {}),
    };
    const editingId = this.editingId;
    this.saving = true;
    this.errorMessage = '';
    const op =
      editingId === null
        ? this.service.createBuilding(request)
        : this.service.updateBuilding(editingId, request);
    op.subscribe({
      next: (saved) => {
        if (editingId === null) {
          this.workContext.workId = saved.workId ?? this.workContext.workId;
          this.records = [saved, ...this.records].slice(0, this.pageSize);
          this.totalElements++;
          this.adding = true;
          this.editingId = null;
          this.form.reset();
        } else {
          this.records = this.records.map((r) => (r.id === saved.id ? saved : r));
          this.editingId = null;
          this.form.reset();
        }
        this.saving = false;
        this.showSuccess(editingId === null ? 'Building added successfully.' : 'Building updated successfully.');
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.showError(
          e?.status === 0
            ? 'Cannot reach the backend. Start the backend and PostgreSQL, then try again.'
            : (e?.error?.message ?? e?.message ?? 'Unable to save the building.'),
        );
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }
  delete(row: BuildingRecord): void {
    if (this.saving) return;
    this.dialog.open(ConfirmDeleteDialog, {
      width: '400px',
      panelClass: 'delete-confirm-panel',
      data: { title: 'Delete Building', message: `Are you sure you want to delete "${row.buildingDescription}"?` },
    }).afterClosed().subscribe(confirmed => { if (confirmed) this.confirmDelete(row); });
  }
  private confirmDelete(row: BuildingRecord): void {
    this.errorMessage = '';
    this.service.deleteBuilding(row.id).subscribe({
      next: () => {
        this.records = this.records.filter((r) => r.id !== row.id);
        this.totalElements = Math.max(0, this.totalElements - 1);
        if (!this.records.length && this.pageIndex > 0) this.pageIndex--;
        this.showSuccess('Building deleted successfully.');
        this.loadBuildings(this.pageIndex);
      },
      error: (e) => this.showError(e?.error?.message ?? 'Unable to delete the building.'),
    });
  }
  viewAudit(row: BuildingRecord): void {
    this.service
      .getAuditHistory(row.id)
      .subscribe({
        next: (auditDetails) =>
          this.dialog.open(AuditDetails, {
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '85vh',
            autoFocus: false,
            panelClass: 'audit-details-dialog',
            data: { building: row, auditDetails },
          }),
        error: (e) => (this.errorMessage = e?.error?.message ?? 'Unable to load audit details.'),
      });
  }
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.pageIndex) this.loadBuildings(page);
  }
  changePageSize(size: string): void {
    this.pageSize = Number(size);
    this.loadBuildings(0);
  }
  get serialOffset(): number {
    return this.pageIndex * this.pageSize;
  }
  private showSuccess(message: string): void {
    this.snackBar.openFromComponent(FeedbackSnackBar, {
      data: { message, type: 'success' }, duration: 5000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['custom-feedback-snackbar'],
    });
  }
  private showError(message: string): void {
    this.snackBar.openFromComponent(FeedbackSnackBar, {
      data: { message, type: 'error' }, duration: 7000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: ['custom-feedback-snackbar'],
    });
  }
}
