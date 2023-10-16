import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { DigitalEditionsApp } from './app.component';
import { CollectionSideMenu } from '@components/menus/collection-side/collection-side-menu';
import { MainSideMenu } from '@components/menus/main-side/main-side-menu';
import { TopMenuComponent } from '@components/menus/top/top-menu';


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
