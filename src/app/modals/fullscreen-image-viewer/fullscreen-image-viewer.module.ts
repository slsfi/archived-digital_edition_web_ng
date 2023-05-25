import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullscreenImageViewerModal } from './fullscreen-image-viewer';
import { DraggableImageDirective } from 'src/directives/draggable-image/draggable-image.directive';

@NgModule({
    declarations: [
      FullscreenImageViewerModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        DraggableImageDirective
    ],
    entryComponents: [
      FullscreenImageViewerModal
    ],
    providers: []
  })
  export class FullscreenImageViewerModalModule {}
