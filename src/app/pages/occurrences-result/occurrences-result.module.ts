import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { OccurrencesResultRoutingModule } from './occurrences-result-routing.module';
import { OccurrencesResultPage } from './occurrences-result';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import {CustomTranslateHttpLoader} from "../../../standalone/TranslateLoader-shim";

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    OccurrencesResultPage,
  ],
  imports: [
    IonicModule,
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
      OccurrencesResultRoutingModule
  ],
})
export class OccurrencesResultPageModule {}
