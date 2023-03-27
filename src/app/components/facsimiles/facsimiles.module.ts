import { NgModule } from '@angular/core';

import { FacsimilesComponent } from './facsimiles';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { PinchZoomModule } from '../pinch-zoom/pinch-zoom.module';
import { FacsimileService } from 'src/app/services/facsimile/facsimile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {CustomTranslateHttpLoader} from "../../../standalone/TranslateLoader-shim";

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateHttpLoader(http, '../../assets/i18n/', '.json');
}

@NgModule({
  declarations: [FacsimilesComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PinchZoomModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  exports: [FacsimilesComponent],
  providers: [
    FacsimileService
  ]
})
export class FacsimilesModule { }
