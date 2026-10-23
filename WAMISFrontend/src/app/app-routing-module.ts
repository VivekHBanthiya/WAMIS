import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Building } from './scope/building/building';
import { Others } from './scope/others/others';

const routes: Routes = [
  { path: 'building', component: Building },
  { path: 'others', component: Others },
  { path: '', redirectTo: 'building', pathMatch: 'full' },
  { path: '**', redirectTo: 'building' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
