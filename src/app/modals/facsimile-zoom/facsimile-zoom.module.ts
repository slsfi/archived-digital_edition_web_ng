import { NgModule } from '@angular/core';
import { FacsimileZoomModalPage } from './facsimile-zoom';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { PinchZoomModule } from 'src/app/components/pinch-zoom/pinch-zoom.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {CustomTranslateHttpLoader} from "../../../standalone/TranslateLoader-shim";

export function createTranslateLoader(http: HttpClient): TranslateLoader {
    return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
      FacsimileZoomModalPage
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        PinchZoomModule,
        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: (createTranslateLoader),
              deps: [HttpClient]
            }
          }),
    ],
    entryComponents: [
      FacsimileZoomModalPage
    ],
    providers: [
        // FacsimileServce perhaps..
    ]
  })
  export class FacsimileZoomPageModule {}
