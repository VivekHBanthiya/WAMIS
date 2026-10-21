
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuditDetails } from './audit-details/audit-details';

import {
  BuildingService,
  BuildingRequest,
  BuildingRecord,
  DropdownOption,
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

  readonly deletingIds = new Set<number>();

  successMessage = '';
  errorMessage = '';

  buildingForm = this.fb.group({
    buildingDescription: ['', Validators.required],
    builtUpArea: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
    numberOfFloors: [
      null as number | null,
      [Validators.required, Validators.min(0)],
    ],
    numberOfBasements: [
      null as number | null,
      [Validators.required, Validators.min(0)],
    ],
    maintenanceType: ['', Validators.required],
    buildingActivity: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadBuildings();
  }

  loadDropdowns(): void {
    this.loading = true;

    let completed = 0;
    const finishLoading = () => {
      completed++;
      if (completed === 2) {
        this.loading = false;
      }
    };

    this.buildingService.getOptions('MAINTENANCE_TYPE').subscribe({
      next: options => {
        this.maintenanceTypes = options;
      },
      error: () => {
        this.errorMessage = 'Unable to load maintenance types.';
      },
      complete: finishLoading,
    });

    this.buildingService.getOptions('BUILDING_ACTIVITY').subscribe({
      next: options => {
        this.buildingActivities = options;
      },
      error: () => {
        this.errorMessage = 'Unable to load building activities.';
        finishLoading();
      },
      complete: finishLoading,
    });
  }

  loadBuildings(): void {
    this.buildingService.getAllBuildings(0, 100).subscribe({
      next: result => {
        this.savedBuildings = Array.isArray(result)
          ? result
          : result.content ?? [];
      },
      error: error => {
        this.errorMessage =
          error?.error?.message ?? 'Unable to load saved buildings.';
      },
    });
  }

  addBuilding(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.editingId !== null) {
      this.errorMessage = 'Finish editing the current row first.';
      return;
    }

    if (this.buildingForm.invalid) {
      this.buildingForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required information first.';
      return;
    }

    this.saving = true;

    this.buildingService.createBuilding(this.getFormData()).subscribe({
      next: createdBuilding => {
        // Update the table immediately from the POST response.
        this.savedBuildings = [
          ...this.savedBuildings,
          createdBuilding,
        ];

        this.buildingForm.reset();
        this.successMessage = 'Building added successfully.';
        this.saving = false;
      },
      error: error => {
        this.errorMessage =
          error?.error?.message ?? 'Unable to save the building.';
        this.saving = false;
      },
    });
  }

  editBuilding(building: BuildingRecord): void {
    if (this.saving || this.deletingIds.size > 0) {
      return;
    }

    this.editingId = building.id;
    this.successMessage = '';
    this.errorMessage = '';

    this.buildingForm.reset({
      buildingDescription: building.buildingDescription,
      builtUpArea: building.builtUpArea,
      numberOfFloors: building.numberOfFloors,
      numberOfBasements: building.numberOfBasements,
      maintenanceType: building.maintenanceType,
      buildingActivity: building.buildingActivity,
    });
  }

  updateBuilding(): void {
    if (this.editingId === null || this.saving) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    if (this.buildingForm.invalid) {
      this.buildingForm.markAllAsTouched();
      this.errorMessage = 'Please correct the required fields.';
      return;
    }

    const id = this.editingId;
    this.saving = true;

    this.buildingService.updateBuilding(id, this.getFormData()).subscribe({
      next: updatedBuilding => {
        // Replace only the edited row; do not append a new row.
        this.savedBuildings = this.savedBuildings.map(building =>
          building.id === id ? updatedBuilding : building
        );

        this.editingId = null;
        this.buildingForm.reset();
        this.successMessage = 'Building updated successfully.';
        this.saving = false;
      },
      error: error => {
        this.errorMessage =
          error?.error?.message ?? 'Unable to update the building.';
        this.saving = false;
      },
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.buildingForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteBuilding(building: BuildingRecord): void {
    if (this.deletingIds.has(building.id)) {
      return;
    }

    if (!confirm(`Delete "${building.buildingDescription}"?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingIds.add(building.id);

    this.buildingService.deleteBuilding(building.id).subscribe({
      next: () => {
        // Remove the row from the UI only after DELETE succeeds.
        this.savedBuildings = this.savedBuildings.filter(
          item => item.id !== building.id
        );

        if (this.editingId === building.id) {
          this.cancelEdit();
        }

        this.successMessage = 'Building deleted successfully.';
        this.deletingIds.delete(building.id);
      },
      error: error => {
        this.errorMessage =
          error?.error?.message ??
          'Unable to delete the building. Please try again.';
        this.deletingIds.delete(building.id);
      },
    });
  }

  private getFormData(): BuildingRequest {
    const form = this.buildingForm.getRawValue();

    return {
      buildingDescription: form.buildingDescription ?? '',
      builtUpArea: form.builtUpArea,
      numberOfFloors: form.numberOfFloors,
      numberOfBasements: form.numberOfBasements,
      maintenanceType: form.maintenanceType ?? '',
      buildingActivity: form.buildingActivity ?? '',
    };
  }

  resetForm(): void {
    this.buildingForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  
viewAudit(building: BuildingRecord): void {
  this.buildingService.getAuditHistory(building.id).subscribe({
    next: (auditDetails) => {
      this.dialog.open(AuditDetails, {
        width: '95vw',
        maxWidth: '1200px',
        data: {
          building,
          auditDetails,
        },
      });
    },
    error: (error) => {
      console.error('Unable to load audit details:', error);
      this.errorMessage = 'Unable to load audit details.';
    },
  });
}

}
