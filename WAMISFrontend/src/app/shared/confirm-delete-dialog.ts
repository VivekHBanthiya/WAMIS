import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDeleteData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: false,
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="center">
      <button mat-raised-button type="button" class="confirm-button" (click)="dialogRef.close(true)">OK</button>
      <button mat-raised-button type="button" class="cancel-button" (click)="dialogRef.close(false)">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { text-align: center; font-size: 21px; font-weight: 400; margin: 0; padding: 18px 24px 10px; }
    mat-dialog-content { text-align: center; font-size: 16px; padding: 8px 24px 20px; }
    mat-dialog-actions { gap: 10px; padding: 12px 24px 14px; border-top: 1px solid #e5e5e5; }
    mat-dialog-actions button { min-width: 100px; height: 36px; border-radius: 4px; box-shadow: 0 2px 4px #0003; }
    .confirm-button { background: #062c70 !important; color: white !important; }
    .cancel-button { background: #f44336 !important; color: white !important; }
  `],
})
export class ConfirmDeleteDialog {
  readonly data = inject<ConfirmDeleteData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDeleteDialog, boolean>);
}
