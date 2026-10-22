import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { AuditDetails } from './audit-details/audit-details';
import {
  BuildingService,
  BuildingRecord,
  DropdownOption,
  PageResponse,
} from '../../services/building';

type BuildingFilters = {
  buildingDescription?: string;
  maintenanceType?: string;
  buildingActivity?: string;
  areaOperator?: string;
  areaValue?: number | null;
  floorsOperator?: string;
  floorsValue?: number | null;
  basementsOperator?: string;
  basementsValue?: number | null;
};

@Component({
  selector: 'app-building',
  standalone: false,
  templateUrl: './building.html',
})
export class Building implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly buildingService = inject(BuildingService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);

  selectedTabIndex = 0;
  maintenanceTypes: DropdownOption[] = [];
  buildingActivities: DropdownOption[] = [];
  savedBuildings: BuildingRecord[] = [];

  loadingDropdowns = false;
  loadingBuildings = false;
  saving = false;
  searching = false;
  exporting = false;

  editingId: number | null = null;
  showSearchForm = false;
  showCsvMenu = false;
  filtersApplied = false;
  errorMessage = '';

  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  readonly pageSizeOptions = [5, 10, 20, 50];
  readonly operators = ['=', '<', '>', '<=', '>='];

  private activeFilters: BuildingFilters = {};

  readonly buildingRows = this.fb.array<FormGroup>([]);
  readonly addRowsForm = this.fb.group({
    buildingRows: this.buildingRows,
  });

  readonly searchForm = this.fb.group({
    buildingDescription: [''],
    maintenanceType: [''],
    buildingActivity: [''],
    areaOperator: ['='],
    areaValue: [null as number | null],
    floorsOperator: ['='],
    floorsValue: [null as number | null],
    basementsOperator: ['='],
    basementsValue: [null as number | null],
  });

  readonly editForm = this.createBuildingForm();

  ngOnInit(): void {
    this.addBuildingRow();
    this.loadDropdowns();
    this.loadBuildings(0);
  }

  private createBuildingForm(): FormGroup {
    return this.fb.group({
      buildingDescription: ['', Validators.required],
      builtUpArea: [null as number | null, [Validators.required, Validators.min(0.01)]],
      numberOfFloors: [null as number | null, [Validators.required, Validators.min(0)]],
      numberOfBasements: [null as number | null, [Validators.required, Validators.min(0)]],
      maintenanceType: ['', Validators.required],
      buildingActivity: ['', Validators.required],
    });
  }

  // ADD ROWS

  addBuildingRow(): void {
    this.buildingRows.push(this.createBuildingForm());
  }

  removeBuildingRow(index: number): void {
    if (this.buildingRows.length === 1) {
      this.buildingRows.at(0).reset();
      return;
    }

    this.buildingRows.removeAt(index);
  }

  //Save Building Row
  saveBuildingRow(index: number): void {
    const form = this.buildingRows.at(index);

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const request =
      this.editingId !== null
        ? this.buildingService.updateBuilding(this.editingId, this.getFormData(form))
        : this.buildingService.createBuilding(this.getFormData(form));

    request.subscribe({
      next: () => {
        form.reset();
        this.editingId = null;
        this.saving = false;
        this.loadBuildings(this.pageIndex);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to save the building.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  // DROPDOWNS

  loadDropdowns(): void {
    this.loadingDropdowns = true;

    let completed = 0;

    const done = () => {
      completed++;

      if (completed === 2) {
        this.loadingDropdowns = false;
      }
    };

    this.buildingService.getOptions('MAINTENANCE_TYPE').subscribe({
      next: (options) => {
        this.maintenanceTypes = options;
      },
      error: () => {
        this.errorMessage = 'Unable to load maintenance types.';
        done();
      },
      complete: done,
    });

    this.buildingService.getOptions('BUILDING_ACTIVITY').subscribe({
      next: (options) => {
        this.buildingActivities = options;
      },
      error: () => {
        this.errorMessage = 'Unable to load building activities.';
        done();
      },
      complete: done,
    });
  }

  // PAGINATED LIST

  loadBuildings(page = this.pageIndex): void {
    this.loadingBuildings = true;

    this.buildingService.getAllBuildings(page, this.pageSize).subscribe({
      next: (result) => {
        if (Array.isArray(result)) {
          this.savedBuildings = result;
          this.totalElements = result.length;
          this.totalPages = result.length ? 1 : 0;
          this.pageIndex = 0;
        } else {
          const response = result as PageResponse<BuildingRecord>;

          this.applyPage(response, page);
        }

        this.loadingBuildings = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to load buildings.';
        this.loadingBuildings = false;
        this.cdr.markForCheck();
      },
    });
  }

  // EDIT

  editBuilding(building: BuildingRecord): void {
    this.editingId = null;
    this.selectedTabIndex = 0;

    const form = this.buildingRows.at(0);

    form.patchValue({
      buildingDescription: building.buildingDescription,
      builtUpArea: building.builtUpArea,
      numberOfFloors: building.numberOfFloors,
      numberOfBasements: building.numberOfBasements,
      maintenanceType: building.maintenanceType,
      buildingActivity: building.buildingActivity,
    });
    this.editingId = building.id;
  }

  saveInlineEdit(building: BuildingRecord): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.buildingService.updateBuilding(building.id, this.getFormData(this.editForm)).subscribe({
      next: (updated) => {
        this.savedBuildings = this.savedBuildings.map((item) =>
          item.id === building.id ? updated : item,
        );

        this.editingId = null;
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to update the building.';
        this.saving = false;
      },
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset();
  }

  // SOFT DELETE

  deleteBuilding(building: BuildingRecord): void {
    if (!confirm(`Delete "${building.buildingDescription}"?`)) {
      return;
    }

    this.errorMessage = '';

    this.buildingService.deleteBuilding(building.id).subscribe({
      next: () => {
        // Remove the deleted record immediately.
        this.savedBuildings = this.savedBuildings.filter((item) => item.id !== building.id);

        this.totalElements = Math.max(0, this.totalElements - 1);
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);

        // Load the previous page if the current page becomes empty.
        if (this.savedBuildings.length === 0 && this.pageIndex > 0) {
          this.changePage(this.pageIndex - 1);
          return;
        }

        // Refresh the current page to fill the missing row.
        if (this.filtersApplied) {
          this.fetchSearchPage(this.pageIndex);
        } else {
          this.loadBuildings(this.pageIndex);
        }
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to delete the building.';
      },
    });
  }

  // SEARCH

  toggleSearchForm(): void {
    this.showSearchForm = !this.showSearchForm;
  }

  private readFilters(): BuildingFilters {
    const raw = this.searchForm.getRawValue();

    return {
      buildingDescription: raw.buildingDescription?.trim() || undefined,

      maintenanceType: raw.maintenanceType || undefined,
      buildingActivity: raw.buildingActivity || undefined,

      areaOperator: raw.areaValue != null ? raw.areaOperator || '=' : undefined,
      areaValue: raw.areaValue,

      floorsOperator: raw.floorsValue != null ? raw.floorsOperator || '=' : undefined,
      floorsValue: raw.floorsValue,

      basementsOperator: raw.basementsValue != null ? raw.basementsOperator || '=' : undefined,
      basementsValue: raw.basementsValue,
    };
  }

  searchBuildings(page = 0): void {
    this.activeFilters = this.readFilters();

    this.filtersApplied = Object.values(this.activeFilters).some(
      (value) => value !== undefined && value !== null && value !== '',
    );

    this.fetchSearchPage(page, true);
  }

  private fetchSearchPage(page: number, closeSearch = false): void {
    this.searching = true;
    this.errorMessage = '';

    this.buildingService.searchBuildings(this.activeFilters, page, this.pageSize).subscribe({
      next: (result) => {
        this.applyPage(result, page);

        this.searching = false;
        this.editingId = null;

        if (closeSearch) {
          this.showSearchForm = false;
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to search buildings.';
        this.searching = false;
      },
    });
  }

  resetSearch(): void {
    this.searchForm.reset({
      buildingDescription: '',
      maintenanceType: '',
      buildingActivity: '',
      areaOperator: '=',
      areaValue: null,
      floorsOperator: '=',
      floorsValue: null,
      basementsOperator: '=',
      basementsValue: null,
    });

    this.activeFilters = {};
    this.filtersApplied = false;
    this.showSearchForm = false;

    this.loadBuildings(0);
  }

  // PAGINATION

  changePage(page: number): void {
    if (page < 0 || page === this.pageIndex || page >= this.totalPages) {
      return;
    }

    if (this.filtersApplied) {
      this.fetchSearchPage(page);
    } else {
      this.loadBuildings(page);
    }
  }

  changePageSize(value: string | number): void {
    this.pageSize = Number(value);
    this.pageIndex = 0;

    if (this.filtersApplied) {
      this.fetchSearchPage(0);
    } else {
      this.loadBuildings(0);
    }
  }

  private applyPage(result: PageResponse<BuildingRecord>, requestedPage: number): void {
    this.savedBuildings = [...(result?.content ?? [])];
    this.totalElements = result?.totalElements ?? 0;
    this.totalPages = result?.totalPages ?? 0;
    this.pageIndex = result?.number ?? requestedPage;
  }

  // CSV EXPORT

  toggleCsvMenu(): void {
    this.showCsvMenu = !this.showCsvMenu;
  }

  async downloadCsv(scope: 'current' | 'all'): Promise<void> {
    this.showCsvMenu = false;
    this.exporting = true;
    this.errorMessage = '';

    try {
      let rows: BuildingRecord[] = [...this.savedBuildings];

      if (scope === 'all') {
        const filters = this.filtersApplied ? this.activeFilters : {};

        const first = await firstValueFrom(this.buildingService.searchBuildings(filters, 0, 100));

        rows = [...(first.content ?? [])];

        for (let page = 1; page < first.totalPages; page++) {
          const response = await firstValueFrom(
            this.buildingService.searchBuildings(filters, page, 100),
          );

          rows.push(...(response.content ?? []));
        }
      }

      if (!rows.length) {
        this.errorMessage = 'There is no building data to export.';
        return;
      }

      const headers = [
        'ID',
        'Building Description',
        'Built-up Area',
        'Number of Floors',
        'Number of Basements',
        'Maintenance Type',
        'Building Activity',
      ];

      const csvCell = (value: unknown): string => {
        let text = String(value ?? '');

        // Protect spreadsheet users against formula injection.
        if (/^[=+@\-]/.test(text)) {
          text = `'${text}`;
        }

        return `"${text.replace(/"/g, '""')}"`;
      };

      const csv = [
        headers,
        ...rows.map((building) => [
          building.id,
          building.buildingDescription,
          building.builtUpArea,
          building.numberOfFloors,
          building.numberOfBasements,
          building.maintenanceType,
          building.buildingActivity,
        ]),
      ]
        .map((row) => row.map(csvCell).join(','))
        .join('\r\n');

      const blob = new Blob(['\uFEFF', csv], {
        type: 'text/csv;charset=utf-8;',
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = `buildings-${
        scope === 'current' ? `page-${this.pageIndex + 1}` : 'all-matching'
      }.csv`;

      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed', error);
      this.errorMessage = 'Unable to download CSV. Please try again.';
    } finally {
      this.exporting = false;
    }
  }

  // AUDIT

  viewAudit(building: BuildingRecord): void {
    this.buildingService.getAuditHistory(building.id).subscribe({
      next: (auditDetails) => {
        this.dialog.open(AuditDetails, {
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          autoFocus: false,
          panelClass: 'audit-details-dialog',
          data: {
            building,
            auditDetails,
          },
        });
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to load audit details.';
      },
    });
  }

  // FORM DATA

  private getFormData(form: FormGroup) {
    const value = form.getRawValue();

    return {
      buildingDescription: value.buildingDescription ?? '',
      builtUpArea: value.builtUpArea == null ? null : Number(value.builtUpArea),
      numberOfFloors: value.numberOfFloors == null ? null : Number(value.numberOfFloors),
      numberOfBasements: value.numberOfBasements == null ? null : Number(value.numberOfBasements),
      maintenanceType: value.maintenanceType ?? '',
      buildingActivity: value.buildingActivity ?? '',
    };
  }
}
