import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  OthersService,
  OthersRecord,
  UnitOption
} from '../../services/others';

@Component({
  selector: 'app-others',
  standalone: false,
  templateUrl: './others.html'
})
export class Others implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OthersService);
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

  othersForm = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    unitId: [null as number | null, Validators.required],
    quantity: [null as number | null, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadUnits();
    this.loadRecords();
  }

  loadUnits(): void {
    this.service.getUnits().subscribe({
      next: units => {
        this.units = units;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Unable to load units.';
        this.cdr.detectChanges();
      }
    });
  }

  loadRecords(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getOthers(this.pageIndex, this.pageSize).subscribe({
      next: response => {
        this.records = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.pageIndex = response.number;
        this.pageSize = response.size;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Unable to load Others records.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  save(): void {
    if (this.othersForm.invalid || this.saving) {
      this.othersForm.markAllAsTouched();
      return;
    }

    const value = this.othersForm.getRawValue();

    if (
      !value.description?.trim() ||
      value.unitId == null ||
      value.quantity == null
    ) {
      return;
    }

    const request = {
      description: value.description.trim(),
      unitId: value.unitId,
      quantity: value.quantity
    };

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const operation = this.editingId === null
      ? this.service.createOther(request)
      : this.service.updateOther(this.editingId, request);

    operation.subscribe({
      next: () => {
        this.successMessage = this.editingId === null
          ? 'Record added successfully.'
          : 'Record updated successfully.';

        this.saving = false;
        this.resetForm();
        this.pageIndex = 0;
        this.loadRecords();
        this.cdr.detectChanges();
      },
      error: error => {
        this.errorMessage =
          error.error?.message ?? 'Unable to save record.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  edit(record: OthersRecord): void {
    this.editingId = record.id;

    this.othersForm.patchValue({
      description: record.description,
      unitId: record.unit.id,
      quantity: record.quantity
    });

    this.successMessage = '';
    this.errorMessage = '';
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

        if (this.records.length === 1 && this.pageIndex > 0) {
          this.pageIndex--;
        }

        this.loadRecords();
        this.cdr.detectChanges();
      },
      error: error => {
        this.errorMessage =
          error.error?.message ?? 'Unable to delete record.';
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.othersForm.reset({
      description: '',
      unitId: null,
      quantity: null
    });
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.pageIndex) {
      return;
    }

    this.pageIndex = page;
    this.loadRecords();
  }

  changePageSize(size: number | string): void {
    this.pageSize = Number(size);
    this.pageIndex = 0;
    this.loadRecords();
  }
}