import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { SemanticDataService } from 'src/app/services/semantic-data.service';
import { IndexOfPlacesPage } from './index-of-places';
import { IndexOfPlacesPageRoutingModule } from './index-of-places-routing.module';

@NgModule({
  declarations: [
    IndexOfPlacesPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    IndexOfPlacesPageRoutingModule
  ],
  providers: [
    SemanticDataService
  ]
})
export class IndexOfPlacesPageModule {}
