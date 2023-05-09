import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexOfPersonsPage } from './index-of-persons';

const routes: Routes = [
  {
    path: '',
    component: IndexOfPersonsPage,
  },
  {
    path: ':type',
    component: IndexOfPersonsPage,
  },
  {
    path: ':type/:subtype',
    component: IndexOfPersonsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndexOfPersonsPageRoutingModule {}
