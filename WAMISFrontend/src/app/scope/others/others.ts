
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { OthersService, OthersRecord, UnitOption } from '../../services/others';
import { AuditDetails } from '../building/audit-details/audit-details';

@Component({
  selector: 'app-others',
  standalone: false,
  templateUrl: './others.html'
})
export class Others implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OthersService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);

  units: UnitOption[] = [];
  records: OthersRecord[] = [];

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  editingId: number | null = null;

  pageIndex = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  readonly pageSizeOptions = [5, 10, 20, 50];

  readonly otherRows = this.fb.array<FormGroup>([]);
  readonly addRowsForm = this.fb.group({ otherRows: this.otherRows });

  ngOnInit(): void {
    this.addRow();
    this.loadUnits();
    this.loadRecords();
  }

  private createRow(): FormGroup {
    return this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      unitId: [null as number | null, Validators.required],
      quantity: [null as number | null, [Validators.required, Validators.min(0)]]
    });
  }

  addRow(): void {
    this.otherRows.push(this.createRow());
  }

  removeRow(index: number): void {
    if (this.otherRows.length === 1) {
      this.otherRows.at(0).reset({
        description: '',
        unitId: null,
        quantity: null
      });
      return;
    }

    this.otherRows.removeAt(index);
  }

  loadUnits(): void {
    this.service.getUnits().subscribe({
      next: units => {
        this.units = units;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load units.';
        this.cdr.markForCheck();
      }
    });
  }

  loadRecords(page = this.pageIndex): void {
    this.loading = true;

    this.service.getOthers(page, this.pageSize).subscribe({
      next: response => {
        this.records = response.content ?? [];
        this.totalElements = response.totalElements ?? 0;
        this.totalPages = response.totalPages ?? 0;
        this.pageIndex = response.number ?? page;
        this.pageSize = response.size ?? this.pageSize;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load Others records.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  saveRow(index: number): void {
    const form = this.otherRows.at(index);

    if (form.invalid || this.saving) {
      form.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    const value = form.getRawValue();

    if (!String(value.description ?? '').trim() ||
        value.unitId == null || value.quantity == null) {
      return;
    }

    const request = {
      description: String(value.description).trim(),
      unitId: Number(value.unitId),
      quantity: Number(value.quantity)
    };

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const operation = this.editingId !== null
      ? this.service.updateOther(this.editingId, request)
      : this.service.createOther(request);

    operation.subscribe({
      next: () => {
        this.successMessage = this.editingId !== null
          ? 'Record updated successfully.'
          : 'Record saved successfully.';

        this.saving = false;
        this.editingId = null;

        form.reset({
          description: '',
          unitId: null,
          quantity: null
        });

        this.loadRecords(0);
        this.cdr.markForCheck();
      },
      error: error => {
        this.errorMessage =
          error?.error?.message ?? 'Unable to save record.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  edit(record: OthersRecord): void {
    this.editingId = record.id;

    const form = this.otherRows.at(0);
    form.patchValue({
      description: record.description,
      unitId: record.unit.id,
      quantity: record.quantity
    });

    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.otherRows.at(0).reset({
      description: '',
      unitId: null,
      quantity: null
    });
  }

  delete(record: OthersRecord): void {
    if (!confirm(`Delete "${record.description}"?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.service.deleteOther(record.id).subscribe({
      next: () => {
        this.successMessage = 'Record deleted successfully.';

        const nextPage = this.records.length === 1 && this.pageIndex > 0
          ? this.pageIndex - 1
          : this.pageIndex;

        this.loadRecords(nextPage);
      },
      error: error => {
        this.errorMessage =
          error?.error?.message ?? 'Unable to delete record.';
        this.cdr.markForCheck();
      }
    });
  }

  viewAudit(record: OthersRecord): void {
    this.service.getAuditHistory(record.id).subscribe({
      next: auditDetails => {
        this.dialog.open(AuditDetails, {
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          autoFocus: false,
          panelClass: 'audit-details-dialog',
          data: {
            building: record,
            auditDetails
          }
        });
      },
      error: error => {
        this.errorMessage =
          error?.error?.message ?? 'Unable to load audit details.';
        this.cdr.markForCheck();
      }
    });
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.pageIndex) {
      return;
    }

    this.loadRecords(page);
  }

  changePageSize(value: string | number): void {
    this.pageSize = Number(value);
    this.loadRecords(0);
  }
}
