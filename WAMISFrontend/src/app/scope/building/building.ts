
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuditDetails } from './audit-details/audit-details';
import {
  BuildingService,
  BuildingRecord,
  DropdownOption
} from '../../services/building';


@Component({
  selector: 'app-building',
  standalone: false,
  templateUrl: './building.html',
})
export class Building implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly buildingService = inject(BuildingService);
  private readonly dialog = inject(MatDialog);

  maintenanceTypes: DropdownOption[] = [];
  buildingActivities: DropdownOption[] = [];
  savedBuildings: BuildingRecord[] = [];

  loading = false;
  saving = false;
  editingId: number | null = null;

  successMessage = '';
  errorMessage = '';

  buildingForm = this.fb.group({
    buildingDescription: ['', Validators.required],
    builtUpArea: [null as number | null, [Validators.required, Validators.min(0.01)]],
    numberOfFloors: [null as number | null, [Validators.required, Validators.min(0)]],
    numberOfBasements: [null as number | null, [Validators.required, Validators.min(0)]],
    maintenanceType: ['', Validators.required],
    buildingActivity: ['', Validators.required],
  });

  editForm = this.fb.group({
    buildingDescription: ['', Validators.required],
    builtUpArea: [null as number | null, [Validators.required, Validators.min(0.01)]],
    numberOfFloors: [null as number | null, [Validators.required, Validators.min(0)]],
    numberOfBasements: [null as number | null, [Validators.required, Validators.min(0)]],
    maintenanceType: ['', Validators.required],
    buildingActivity: ['', Validators.required],
  });

  searchForm = this.fb.group({
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

  readonly operators = ['=', '<', '>', '<=', '>='];

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadBuildings();
  }

  loadDropdowns(): void {
    this.loading = true;

    let completed = 0;
    const done = () => {
      completed++;
      if (completed === 2) this.loading = false;
    };

    this.buildingService.getOptions('MAINTENANCE_TYPE').subscribe({
      next: options => this.maintenanceTypes = options,
      error: () => this.errorMessage = 'Unable to load maintenance types.',
      complete: done,
    });

    this.buildingService.getOptions('BUILDING_ACTIVITY').subscribe({
      next: options => this.buildingActivities = options,
      error: () => this.errorMessage = 'Unable to load building activities.',
      complete: done,
    });
  }

  loadBuildings(): void {
    this.buildingService.getAllBuildings(0, 100).subscribe({
      next: result => {
        this.savedBuildings = Array.isArray(result)
          ? result
          : result?.content ?? [];
      },
      error: error => {
        this.errorMessage = 'Unable to load saved buildings.';
        console.error(error);
      },
    });
  }

  addBuilding(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.buildingForm.invalid) {
      this.buildingForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required building fields.';
      return;
    }

    this.saving = true;

    this.buildingService.createBuilding(this.getFormData(this.buildingForm)).subscribe({
      next: building => {
        // Update the UI immediately using the returned record.
        this.savedBuildings = [building, ...this.savedBuildings];
        this.buildingForm.reset();
        this.successMessage = 'Building added successfully.';
        this.saving = false;
      },
      error: error => {
        this.errorMessage = error?.error?.message ?? 'Unable to save the building.';
        this.saving = false;
      },
    });
  }

  editBuilding(building: BuildingRecord): void {
    this.editingId = building.id;
    this.successMessage = '';
    this.errorMessage = '';

    this.editForm.reset({
      buildingDescription: building.buildingDescription,
      builtUpArea: building.builtUpArea,
      numberOfFloors: building.numberOfFloors,
      numberOfBasements: building.numberOfBasements,
      maintenanceType: building.maintenanceType,
      buildingActivity: building.buildingActivity,
    });
  }

  saveInlineEdit(building: BuildingRecord): void {
    if (this.editingId !== building.id || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.buildingService
      .updateBuilding(building.id, this.getFormData(this.editForm))
      .subscribe({
        next: updated => {
          this.savedBuildings = this.savedBuildings.map(item =>
            item.id === building.id ? updated : item
          );
          this.editingId = null;
          this.successMessage = 'Building updated successfully.';
          this.saving = false;
        },
        error: error => {
          this.errorMessage = error?.error?.message ?? 'Unable to update the building.';
          this.saving = false;
        },
      });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset();
    this.errorMessage = '';
  }

  deleteBuilding(building: BuildingRecord): void {
    if (!confirm(`Delete "${building.buildingDescription}"?`)) return;

    this.saving = true;
    this.errorMessage = '';

    this.buildingService.deleteBuilding(building.id).subscribe({
      next: () => {
        this.savedBuildings = this.savedBuildings.filter(item => item.id !== building.id);
        if (this.editingId === building.id) this.cancelEdit();
        this.successMessage = 'Building deleted successfully.';
        this.saving = false;
      },
      error: error => {
        this.errorMessage = error?.error?.message ?? 'Unable to delete the building.';
        this.saving = false;
      },
    });
  }

  searchBuildings(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const raw = this.searchForm.getRawValue();
    const filters = {
      buildingDescription: raw.buildingDescription?.trim() || undefined,
      maintenanceType: raw.maintenanceType || undefined,
      buildingActivity: raw.buildingActivity || undefined,
      areaOperator: raw.areaValue !== null ? raw.areaOperator || '=' : undefined,
      areaValue: raw.areaValue,
      floorsOperator: raw.floorsValue !== null ? raw.floorsOperator || '=' : undefined,
      floorsValue: raw.floorsValue,
      basementsOperator: raw.basementsValue !== null ? raw.basementsOperator || '=' : undefined,
      basementsValue: raw.basementsValue,
    };

    this.buildingService.searchBuildings(filters, 0, 100).subscribe({
      next: result => {
        this.savedBuildings = result.content ?? [];
        this.editingId = null;
        if (this.savedBuildings.length === 0) {
          this.successMessage = 'No buildings match the search criteria.';
        }
      },
      error: error => {
        this.errorMessage = error?.error?.message ?? 'Unable to search buildings.';
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
    this.loadBuildings();
    this.errorMessage = '';
    this.successMessage = '';
  }

  viewAudit(building: BuildingRecord): void {
    this.buildingService.getAuditHistory(building.id).subscribe({
      next: auditDetails => {
        this.dialog.open(AuditDetails, {
          width: '95vw',
          maxWidth: '1200px',
          data: { building, auditDetails },
        });
      },
      error: error => {
        this.errorMessage = error?.error?.message ?? 'Unable to load audit details.';
      },
    });
  }

  private getFormData(form: typeof this.buildingForm | typeof this.editForm) {
    const value = form.getRawValue();

    return {
      buildingDescription: value.buildingDescription ?? '',
      builtUpArea: value.builtUpArea,
      numberOfFloors: value.numberOfFloors,
      numberOfBasements: value.numberOfBasements,
      maintenanceType: value.maintenanceType ?? '',
      buildingActivity: value.buildingActivity ?? '',
    };
  }
}
