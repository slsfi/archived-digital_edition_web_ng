import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexOfWorksPage } from './index-of-works';

const routes: Routes = [
  {
    path: '',
    component: IndexOfWorksPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndexOfWorksPageRoutingModule {}
