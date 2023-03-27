import { NgModule } from '@angular/core';
import { CoverPage } from './cover';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoverPageRoutingModule } from './cover-routing.module';
import {CustomTranslateHttpLoader} from "../../../standalone/TranslateLoader-shim";

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    CoverPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    ComponentsModule,
    MarkdownModule.forRoot(),
    CoverPageRoutingModule,
  ],
})
export class CoverPageModule {}
