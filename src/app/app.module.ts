import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';

import { DigitalEditionsApp } from './app.component';
import { EventsService } from './services/events/events.service';
import { HtmlContentService } from './services/html/html-content.service';
import { MdContentService } from './services/md/md-content.service';
import { TextService } from './services/texts/text.service';
import { ReadPopoverService } from './services/settings/read-popover.service';
import { CommentService } from './services/comments/comment.service';
import { CommonFunctionsService } from './services/common-functions/common-functions.service';
import { SemanticDataService } from './services/semantic-data/semantic-data.service';
import { ReferenceDataService } from './services/reference-data/reference-data.service';
import { UserSettingsService } from './services/settings/user-settings.service';
import { GenericSettingsService } from './services/settings/generic-settings.service';
import { GalleryService } from './services/gallery/gallery.service';
import { TooltipService } from './services/tooltips/tooltip.service';
import { TableOfContentsService } from './services/toc/table-of-contents.service';
import { CommonModule } from '@angular/common';
import { PipesModule } from 'src/pipes/pipes.module';
import { DigitalEditionListModule } from './components/digital-edition-list/digital-edition-list.module';
import { ComponentsModule } from './components/components.module';
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
import { UserSettingsPopoverPageModule } from './modals/user-settings-popover/user-settings-popover.module';
import { UserSettingsPopoverPage } from './modals/user-settings-popover/user-settings-popover';

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
    IonicStorageModule.forRoot(),
    CommonModule,
    UserSettingsPopoverPageModule,
    ComponentsModule,
    PipesModule,
    DigitalEditionListModule,
    PersonSearchPageModule,
    FacsimileZoomPageModule,
    ReadPopoverPageModule,
    IllustrationPageModule,
    MathJaxModule
  ],
  providers: [
    HtmlContentService,
    MdContentService,
    TextService,
    ReadPopoverService,
    Title,
    CommentService,
    CommonFunctionsService,
    SemanticDataService,
    ReferenceDataService,
    TooltipService,
    UserSettingsService,
    GenericSettingsService,
    GalleryService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
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
    IllustrationPage
  ]
})
export class AppModule {}
