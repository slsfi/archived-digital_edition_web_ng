import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexOfPlacesPage } from './index-of-places';

const routes: Routes = [
  {
    path: '',
    component: IndexOfPlacesPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndexOfPlacesPageRoutingModule {}
