import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReadPage } from './read';

const routes: Routes = [
  {
    path: ':collectionID/text/:publicationID',
    component: ReadPage,
  },
  {
    path: ':collectionID/text/:publicationID/:chapterID',
    component: ReadPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReadRoutingModule {}
