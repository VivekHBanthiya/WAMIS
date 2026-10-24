import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { App } from './app';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDeleteDialog } from './shared/confirm-delete-dialog';
import { FeedbackSnackBar } from './shared/feedback-snackbar';

import { AuditDetails } from './scope/building/audit-details/audit-details';
import { Building } from './scope/building/building';
import { Others } from './scope/others/others';

@NgModule({
  declarations: [App, Building, AuditDetails, Others, ConfirmDeleteDialog, FeedbackSnackBar],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  providers: [provideBrowserGlobalErrorListeners(), provideAnimations(), provideHttpClient()],
  bootstrap: [App],
})
export class AppModule {}
