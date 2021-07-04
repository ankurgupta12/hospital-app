import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentViewComponent } from './components/department-view/department-view.component';
import { HospitalViewComponent } from './components/hospital-view/hospital-view.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/hospital',
    pathMatch: 'full',
  },
  {
    path: 'hospital',
    component: HospitalViewComponent,
  },
  {
    path: 'department',
    component: DepartmentViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
