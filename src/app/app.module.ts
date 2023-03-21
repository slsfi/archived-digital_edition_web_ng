import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicStorageModule } from '@ionic/storage-angular';

import { DigitalEditionsApp } from './app.component';
import { EventsService } from './services/events/events.service';
import { HtmlContentService } from './services/html/html-content.service';
import { MdContentService } from './services/md/md-content.service';
import { TextService } from './services/texts/text.service';
import { LanguageService } from './services/languages/language.service';
import { ReadPopoverService } from './services/settings/read-popover.service';
import { CommentService } from './services/comments/comment.service';
import { CommentCacheService } from './services/comments/comment-cache.service';
import { CommonFunctionsService } from './services/common-functions/common-functions.service';
import { SemanticDataService } from './services/semantic-data/semantic-data.service';
import { ReferenceDataService } from './services/reference-data/reference-data.service';
import { UserSettingsService } from './services/settings/user-settings.service';
import { GenericSettingsService } from './services/settings/generic-settings.service';
import { AnalyticsService } from './services/analytics/analytics.service';
import { MetadataService } from './services/metadata/metadata.service';
import { GalleryService } from './services/gallery/gallery.service';
import { SongService } from './services/song/song.service';
import { TooltipService } from './services/tooltips/tooltip.service';
import { SearchDataService } from './services/search/search-data.service';
import { TableOfContentsService } from './services/toc/table-of-contents.service';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/pipes/pipes.module';
import { DigitalEditionListModule } from './components/digital-edition-list/digital-edition-list.module';
import { ComponentsModule } from './components/components.module';
import { MarkdownModule } from 'ngx-markdown';
import { MathJaxModule } from './components/math-jax/math-jax.module';
import { ReferenceDataModalPage } from './modals/reference-data-modal/reference-data-modal';
import { DownloadTextsModalPage } from './modals/download-texts-modal/download-texts-modal';
import { FacsimileZoomPageModule } from './modals/facsimile-zoom/facsimile-zoom.module';
import { FacsimileZoomModalPage } from './modals/facsimile-zoom/facsimile-zoom';
import { IllustrationPageModule } from './modals/illustration/illustration.module';
import { IllustrationPage } from './modals/illustration/illustration';
import { PersonSearchPageModule } from './pages/person-search/person-search.module';
import { ReadPopoverPageModule } from './modals/read-popover/read-popover.module';
import { ReadPopoverPage } from './modals/read-popover/read-popover';
import { SearchAppPageModule } from './modals/search-app/search-app.module';
import { UserSettingsPopoverPageModule } from './modals/user-settings-popover/user-settings-popover.module';
import { UserSettingsPopoverPage } from './modals/user-settings-popover/user-settings-popover';
import { SearchAppPage } from './modals/search-app/search-app';

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    DigitalEditionsApp,
    ReferenceDataModalPage,
    DownloadTextsModalPage,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    IonicModule.forRoot(
      {
        mode: 'md',
        backButtonText: '',
      }
    ),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot(),
    SearchAppPageModule,
    CommonModule,
    UserSettingsPopoverPageModule,
    ComponentsModule,
    PipesModule,
    DigitalEditionListModule,
    PersonSearchPageModule,
    FacsimileZoomPageModule,
    ReadPopoverPageModule,
    IllustrationPageModule,
    MathJaxModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
  ],
  providers: [
    HtmlContentService,
    MdContentService,
    TextService,
    TranslateService,
    LanguageService,
    ReadPopoverService,
    Title,
    CommentService,
    CommentCacheService,
    CommonFunctionsService,
    SemanticDataService,
    ReferenceDataService,
    SearchDataService,
    TooltipService,
    UserSettingsService,
    GenericSettingsService,
    SongService,
    GalleryService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AnalyticsService,
    MetadataService,
    EventsService,
    TableOfContentsService
  ],
  bootstrap: [DigitalEditionsApp],
  entryComponents: [
    DigitalEditionsApp,
    ReadPopoverPage,
    UserSettingsPopoverPage,
    ReferenceDataModalPage,
    FacsimileZoomModalPage,
    DownloadTextsModalPage,
    IllustrationPage,
    SearchAppPage,
  ]
})
export class AppModule {}
