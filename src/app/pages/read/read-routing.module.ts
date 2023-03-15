import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReadPage } from './read';

const routes: Routes = [
  {
    path: ':collectionID/text/:publicationID/:chapterID/:facs_id/:facs_nr/:song_id/:search_title/:views',
    component: ReadPage,
  },
  {
    path: ':collectionID/text/:publicationID',
    component: ReadPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReadRoutingModule {}
