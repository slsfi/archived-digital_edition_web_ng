import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PinchZoomModule } from '../pinch-zoom/pinch-zoom.module';
import { FacsimileService } from 'src/app/services/facsimile/facsimile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacsimilesComponent } from './facsimiles';

@NgModule({
  declarations: [FacsimilesComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PinchZoomModule
  ],
  exports: [FacsimilesComponent],
  providers: [
    FacsimileService
  ]
})
export class FacsimilesModule { }
