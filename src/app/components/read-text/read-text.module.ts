import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReadTextComponent } from './read-text';
import { MathJaxDirective } from 'src/directives/math-jax.directive';

@NgModule({
  declarations: [ReadTextComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MathJaxDirective
  ],
  exports: [ReadTextComponent]
})
export class ReadTextModule {}
