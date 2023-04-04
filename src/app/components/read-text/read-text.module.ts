import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MathJaxModule } from '../math-jax/math-jax.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReadTextComponent } from './read-text';

@NgModule({
  declarations: [ReadTextComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MathJaxModule
  ],
  exports: [ReadTextComponent]
})
export class ReadTextModule {}
