import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Building } from './scope/building/building';
import { Others } from './scope/others/others';

const routes: Routes = [
  { path: 'scope/building', component: Building },
  { path: 'scope/others', component: Others },
  { path: '', redirectTo: 'scope/building', pathMatch: 'full' },
  { path: '**', redirectTo: 'scope/building' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}