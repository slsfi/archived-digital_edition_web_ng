/// <reference types="@angular/localize" />

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { DigitalEditionsApp } from './app/app.component';
import { CommonModule } from '@angular/common';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app/app-routing.module';
import { IonicRouteStrategy, IonicModule } from '@ionic/angular';
import { RouteReuseStrategy } from '@angular/router';
import { Title, BrowserModule, bootstrapApplication } from '@angular/platform-browser';


if (environment.production) {
  enableProdMode();
}

function bootstrap() {
  bootstrapApplication(DigitalEditionsApp, {
    providers: [
        importProvidersFrom(BrowserModule.withServerTransition({ appId: 'serverApp' }), IonicModule.forRoot({
            mode: 'md',
            backButtonText: '',
        }), AppRoutingModule, CommonModule),
        Title,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .catch(err => console.log(err));
};


if (document.readyState === 'complete') {
  bootstrap();
} else {
  document.addEventListener('DOMContentLoaded', bootstrap);
}
