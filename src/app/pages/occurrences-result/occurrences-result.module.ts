import { NgModule } from '@angular/core';
import { OccurrencesResultRoutingModule } from './occurrences-result-routing.module';
import { OccurrencesResultPage } from './occurrences-result';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [
    OccurrencesResultPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    OccurrencesResultRoutingModule
  ],
})
export class OccurrencesResultPageModule {}
