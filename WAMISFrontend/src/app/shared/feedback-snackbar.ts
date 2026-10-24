import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface FeedbackSnackBarData {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-feedback-snackbar',
  standalone: false,
  template: `
    <div class="feedback-toast" [class.success-toast]="data.type === 'success'" [class.error-toast]="data.type === 'error'">
      <span class="status-dot" aria-hidden="true">●</span>
      <span class="message">{{ data.message }}</span>
      <button type="button" class="copy-button" (click)="copy()" aria-label="Copy message">▢ Copy</button>
      <button type="button" class="close-button" (click)="snackBarRef.dismiss()" aria-label="Close">×</button>
    </div>
  `,
  styles: [`
    .feedback-toast { display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 0 12px; border-radius: 4px; box-shadow: 0 3px 10px #0003; font: 14px Roboto, Arial, sans-serif; }
    .success-toast { color: #16834a; background: #d8f1df; }
    .error-toast { color: #dc3545; background: #f9d9dc; }
    .status-dot { font-size: 13px; }
    .message { flex: 1; }
    button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; padding: 6px; }
    .copy-button { white-space: nowrap; }
    .close-button { font-size: 22px; line-height: 1; }
  `],
})
export class FeedbackSnackBar {
  readonly data = inject<FeedbackSnackBarData>(MAT_SNACK_BAR_DATA);
  readonly snackBarRef = inject(MatSnackBarRef<FeedbackSnackBar>);

  copy(): void {
    void navigator.clipboard?.writeText(this.data.message);
    this.snackBarRef.dismiss();
  }
}
