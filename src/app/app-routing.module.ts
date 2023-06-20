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
    loadChildren: () => import('./pages/content/content.module').then( m => m.ContentPageModule)
  },
  {
    path: 'collection/:collectionID/cover',
    loadChildren: () => import('./pages/collection-cover/collection-cover.module').then( m => m.CollectionCoverPageModule)
  },
  {
    path: 'collection/:collectionID/title',
    loadChildren: () => import('./pages/collection-title/collection-title.module').then( m => m.CollectionTitlePageModule)
  },
  {
    path: 'collection/:collectionID/foreword',
    loadChildren: () => import('./pages/collection-foreword/collection-foreword.module').then( m => m.CollectionForewordPageModule)
  },
  {
    path: 'collection/:collectionID/introduction',
    loadChildren: () => import('./pages/collection-introduction/collection-introduction.module').then( m => m.CollectionIntroductionPageModule)
  },
  {
    path: 'collection/:collectionID/text',
    loadChildren: () => import('./pages/collection-text/collection-text.module').then( m => m.CollectionTextPageModule)
  },
  {
    path: 'ebook',
    loadChildren: () => import('./pages/ebook/ebook.module').then( m => m.EbookPageModule)
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'keywords',
    loadChildren: () => import('./pages/index-of-keywords/index-of-keywords.module').then( m => m.IndexOfKeywordsPageModule)
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
    loadChildren: () => import('./pages/index-of-persons/index-of-persons.module').then( m => m.IndexOfPersonsPageModule)
  },
  {
    path: 'places',
    loadChildren: () => import('./pages/index-of-places/index-of-places.module').then( m => m.IndexOfPlacesPageModule)
  },
  {
    path: 'publication-toc',
    loadChildren: () => import('./pages/single-edition/single-edition.module').then( m => m.SingleEditionPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/elastic-search/elastic-search.module').then( m => m.ElasticSearchPageModule)
  },
  {
    path: 'works',
    loadChildren: () => import('./pages/index-of-works/index-of-works.module').then( m => m.IndexOfWorksPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabledBlocking' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
