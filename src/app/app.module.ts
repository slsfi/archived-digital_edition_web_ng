import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { DigitalEditionsApp } from './app.component';
import { HtmlContentService } from './services/html-content.service';
import { MdContentService } from './services/md-content.service';
import { TextService } from './services/text.service';
import { ReadPopoverService } from './services/read-popover.service';
import { CommentService } from './services/comment.service';
import { CommonFunctionsService } from './services/common-functions.service';
import { SemanticDataService } from './services/semantic-data.service';
import { OccurrenceService } from './services/occurence.service';
import { ReferenceDataService } from './services/reference-data.service';
import { UserSettingsService } from './services/user-settings.service';
import { GenericSettingsService } from './services/generic-settings.service';
import { GalleryService } from './services/gallery.service';
import { TooltipService } from './services/tooltip.service';
import { TableOfContentsService } from './services/table-of-contents.service';
import { FacsimileService } from 'src/app/services/facsimile.service';
import { PipesModule } from 'src/pipes/pipes.module';
import { DigitalEditionListModule } from './components/digital-edition-list/digital-edition-list.module';
import { ComponentsModule } from './components/components.module';
import { ReferenceDataModalPage } from './modals/reference-data-modal/reference-data-modal';
import { DownloadTextsModalPage } from './modals/download-texts-modal/download-texts-modal';
import { FullscreenImageViewerModalModule } from './modals/fullscreen-image-viewer/fullscreen-image-viewer.module';
import { FullscreenImageViewerModal } from './modals/fullscreen-image-viewer/fullscreen-image-viewer';
import { IllustrationPageModule } from './modals/illustration/illustration.module';
import { IllustrationPage } from './modals/illustration/illustration';
import { ReadPopoverPageModule } from './modals/read-popover/read-popover.module';
import { ReadPopoverPage } from './modals/read-popover/read-popover';

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
    CommonModule,
    ComponentsModule,
    PipesModule,
    DigitalEditionListModule,
    FullscreenImageViewerModalModule,
    ReadPopoverPageModule,
    IllustrationPageModule
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
    OccurrenceService,
    ReferenceDataService,
    TooltipService,
    UserSettingsService,
    GenericSettingsService,
    GalleryService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    TableOfContentsService,
    FacsimileService
  ],
  bootstrap: [DigitalEditionsApp],
  entryComponents: [
    DigitalEditionsApp,
    ReadPopoverPage,
    ReferenceDataModalPage,
    FullscreenImageViewerModal,
    DownloadTextsModalPage,
    IllustrationPage
  ]
})
export class AppModule {}
