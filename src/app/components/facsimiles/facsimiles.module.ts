import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DraggableImageDirective } from 'src/directives/draggable-image/draggable-image.directive';
import { FacsimilesComponent } from './facsimiles';

@NgModule({
  declarations: [FacsimilesComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    DraggableImageDirective
  ],
  exports: [FacsimilesComponent],
  providers: []
})
export class FacsimilesModule { }
