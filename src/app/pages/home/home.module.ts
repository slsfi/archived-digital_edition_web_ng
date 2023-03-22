import { NgModule } from '@angular/core';
import { HomePage } from './home';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ComponentsModule } from 'src/app/components/components.module';
import { DigitalEditionListModule } from 'src/app/components/digital-edition-list/digital-edition-list.module';
import { PipesModule } from 'src/pipes/pipes.module';
import { MarkdownModule } from 'ngx-markdown';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { CommonModule } from '@angular/common';
import {CustomTranslateHttpLoader} from "../../../standalone/TranslateLoader-shim";

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
      HomePage,
    ],
    imports: [
      CommonModule,
      IonicModule,
      ComponentsModule,
      DigitalEditionListModule,
      MarkdownModule.forRoot(),
      PipesModule,
      TranslateModule.forChild({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
      }),
      ComponentsModule,
      HomePageRoutingModule,
    ],
    providers: [],
  })
  export class HomePageModule {}
