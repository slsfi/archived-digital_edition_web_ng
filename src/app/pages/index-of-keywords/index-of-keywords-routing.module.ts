import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexOfKeywordsPage } from './index-of-keywords';

const routes: Routes = [
  {
    path: '',
    component: IndexOfKeywordsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndexOfKeywordsPageRoutingModule {}
