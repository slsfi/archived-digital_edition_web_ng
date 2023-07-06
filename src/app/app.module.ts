import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { DigitalEditionsApp } from './app.component';
import { PipesModule } from 'src/pipes/pipes.module';
import { DigitalEditionListModule } from './components/digital-edition-list/digital-edition-list.module';
import { ComponentsModule } from './components/components.module';
import { DownloadTextsModalPage } from './modals/download-texts-modal/download-texts-modal';
import { IllustrationPageModule } from './modals/illustration/illustration.module';
import { IllustrationPage } from './modals/illustration/illustration';

@NgModule({
  declarations: [
    DigitalEditionsApp,
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
    IllustrationPageModule
  ],
  providers: [
    Title,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [DigitalEditionsApp],
  entryComponents: [
    DigitalEditionsApp,
    DownloadTextsModalPage,
    IllustrationPage
  ]
})
export class AppModule {}
