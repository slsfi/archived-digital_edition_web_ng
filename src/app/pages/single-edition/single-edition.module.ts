import { NgModule } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SingleEditionPage } from './single-edition';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { MarkdownModule } from 'ngx-markdown';
import { PdfService } from 'src/app/services/pdf/pdf.service';
import { SingleEditionRoutingModule } from './single-edition-routing.module';
import { PipesModule } from 'src/pipes/pipes.module';
import {CustomTranslateHttpLoader} from "../../../standalone/TranslateLoader-shim";

export function createTranslateLoader(http: HttpClient) {
    return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    declarations: [
        SingleEditionPage
    ],
    imports: [
      CommonModule,
      FormsModule,
      PipesModule,
      TranslateModule.forChild({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
        }
      }),
      ComponentsModule,
      MarkdownModule.forRoot(),
      SingleEditionRoutingModule
    ],
    providers: [
        PdfService
    ],
    entryComponents: [
        SingleEditionPage
    ]
  })
  export class SingleEditionPageModule {}
