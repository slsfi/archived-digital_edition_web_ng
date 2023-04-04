import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentsComponent } from './comments';

@NgModule({
  declarations: [CommentsComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  exports: [CommentsComponent]
})
export class CommentsModule {}
