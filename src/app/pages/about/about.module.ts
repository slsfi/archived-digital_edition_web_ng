import { NgModule } from '@angular/core';
import { AboutPage } from './about';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { AboutPageRoutingModule } from './about-routing.module';
import { MarkdownModule } from 'ngx-markdown';
import { ComponentsModule } from 'src/app/components/components.module';
import { HtmlContentService } from 'src/app/services/html/html-content.service';
import { IonicModule, NavParams } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {CustomTranslateHttpLoader} from "../../../standalone/TranslateLoader-shim";

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
      AboutPage
    ],
    imports: [
      CommonModule,
      IonicModule,
      FormsModule,
      TranslateModule.forChild({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
      }),
      ComponentsModule,
      MarkdownModule.forRoot(),
      AboutPageRoutingModule,
    ],
    entryComponents: [
      AboutPage
    ],
    providers: [
        HtmlContentService,
        NavParams
    ]
  })
  export class AboutPageModule {}
