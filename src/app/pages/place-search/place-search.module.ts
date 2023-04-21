import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { PlaceSearchPage } from './place-search';
import { PlaceSearchRoutingModule } from './place-search-routing.module';

@NgModule({
  declarations: [
    PlaceSearchPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    PlaceSearchRoutingModule
  ],
  providers: [
    SemanticDataService
  ]
})
export class PlaceSearchPageModule {}
