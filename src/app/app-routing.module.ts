import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'content',
    loadChildren: () => import('./pages/editions/editions.module').then( m => m.EditionsPageModule)
  },
  {
    path: 'collection/:collectionID/cover',
    loadChildren: () => import('./pages/cover/cover.module').then( m => m.CoverPageModule)
  },
  {
    path: 'collection/:collectionID/title',
    loadChildren: () => import('./pages/title/title.module').then( m => m.TitlePageModule)
  },
  {
    path: 'collection/:collectionID/foreword',
    loadChildren: () => import('./pages/foreword/foreword.module').then( m => m.ForewordPageModule)
  },
  {
    path: 'collection/:collectionID/introduction',
    loadChildren: () => import('./pages/introduction/introduction.module').then( m => m.IntroductionPageModule)
  },
  {
    path: 'collection/:collectionID/text',
    loadChildren: () => import('./pages/read/read.module').then( m => m.ReadPageModule)
  },
  {
    path: 'ebook',
    loadChildren: () => import('./pages/epub/epub.module').then( m => m.EpubModule)
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'keywords',
    loadChildren: () => import('./pages/tag-search/tag-search.module').then( m => m.TagearchPageModule)
  },
  {
    path: 'media-collection',
    loadChildren: () => import('./pages/media-collection/media-collection.module').then( m => m.MediaCollectionPageModule)
  },
  {
    path: 'media-collections',
    loadChildren: () => import('./pages/media-collections/media-collections.module').then( m => m.MediaCollectionsPageModule)
  },
  {
    path: 'persons',
    loadChildren: () => import('./pages/person-search/person-search.module').then( m => m.PersonSearchPageModule)
  },
  {
    path: 'places',
    loadChildren: () => import('./pages/place-search/place-search.module').then( m => m.PlaceSearchPageModule)
  },
  {
    path: 'publication-toc',
    loadChildren: () => import('./pages/single-edition/single-edition.module').then( m => m.SingleEditionPageModule)
  },
  {
    path: 'result',
    loadChildren: () => import('./pages/occurrences-result/occurrences-result.module').then( m => m.OccurrencesResultPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/elastic-search/elastic-search.module').then( m => m.ElasticSearchPageModule)
  },
  {
    path: 'works',
    loadChildren: () => import('./pages/work-search/work-search.module').then( m => m.WorkearchPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabledBlocking' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
