import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullscreenImageViewerModal } from './fullscreen-image-viewer';
import { PinchZoomModule } from 'src/app/components/pinch-zoom/pinch-zoom.module';
import { DraggableImageDirective } from 'src/directives/draggable-image/draggable-image.directive';

@NgModule({
    declarations: [
      FullscreenImageViewerModal
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        PinchZoomModule,
        DraggableImageDirective
    ],
    entryComponents: [
      FullscreenImageViewerModal
    ],
    providers: []
  })
  export class FullscreenImageViewerModalModule {}
