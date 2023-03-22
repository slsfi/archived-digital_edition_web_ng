import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReadPage } from './read';

const routes: Routes = [
  {
    path: ':publicationID',
    component: ReadPage,
  },
  {
    path: ':publicationID/:chapterID',
    component: ReadPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReadRoutingModule {}
