import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacsimileZoomModalPage } from './facsimile-zoom';
import { PinchZoomModule } from 'src/app/components/pinch-zoom/pinch-zoom.module';

@NgModule({
    declarations: [
      FacsimileZoomModalPage
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        PinchZoomModule
    ],
    entryComponents: [
      FacsimileZoomModalPage
    ],
    providers: [
        // FacsimileServce perhaps..
    ]
  })
  export class FacsimileZoomPageModule {}
