import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagSearchRoutingModule } from './tag-search-routing.module';
import { TagSearchPage } from './tag-search';

@NgModule({
  declarations: [
    TagSearchPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    TagSearchRoutingModule
  ],
  providers: [
    SemanticDataService
  ]
})
export class TagearchPageModule {}
