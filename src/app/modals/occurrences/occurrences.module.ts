import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { OccurrencesPage } from './occurrences';

@NgModule({
  declarations: [
    OccurrencesPage,
  ],
  imports: [
    IonicModule,
    PipesModule,
    ComponentsModule,
    CommonModule,
    FormsModule
  ],
})
export class OccurrencesPageModule {}
