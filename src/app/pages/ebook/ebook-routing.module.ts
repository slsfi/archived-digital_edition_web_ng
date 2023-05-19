import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EbookPage } from './ebook';

const routes: Routes = [
  {
    path: ':selectedFile',
    component: EbookPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EbookPageRoutingModule {}