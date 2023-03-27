import { NgModule } from '@angular/core';

import { ReadTextComponent } from './read-text';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { MathJaxModule } from '../math-jax/math-jax.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {CustomTranslateHttpLoader} from "../../../standalone/TranslateLoader-shim";

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateHttpLoader(http, '../../assets/i18n/', '.json');
}

@NgModule({
  declarations: [ReadTextComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    MathJaxModule
  ],
  exports: [ReadTextComponent]
})
export class ReadTextModule {}
