import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { DigitalEditionsApp } from './app.component';
import { CollectionSideMenu } from './components/collection-side-menu/collection-side-menu';
import { MainSideMenu } from './components/main-side-menu/main-side-menu';
import { TopMenuComponent } from './components/top-menu/top-menu';

@NgModule({
  declarations: [
    DigitalEditionsApp
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
    CollectionSideMenu,
    MainSideMenu,
    TopMenuComponent
  ],
  providers: [
    Title,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [DigitalEditionsApp]
})
export class AppModule {}
