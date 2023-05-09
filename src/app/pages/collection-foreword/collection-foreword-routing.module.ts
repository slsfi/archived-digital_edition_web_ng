import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollectionForewordPage } from './collection-foreword';

const routes: Routes = [
  {
    path: '',
    component: CollectionForewordPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionForewordPageRoutingModule {}
