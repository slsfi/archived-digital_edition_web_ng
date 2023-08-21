import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { OccurrenceService } from 'src/app/services/occurence.service';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/pipes/pipes.module';
import { ElasticSearchService } from 'src/app/services/elastic-search.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElasticSearchPageRoutingModule } from './elastic-search-routing.module';
import { SemanticDataObjectModal } from 'src/app/modals/semantic-data-object/semantic-data-object.modal';
import { ElasticSearchPage } from './elastic-search';

@NgModule({
  schemas: [
    NO_ERRORS_SCHEMA
  ],
  declarations: [
    ElasticSearchPage
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    SemanticDataObjectModal,
    ElasticSearchPageRoutingModule
  ],
  providers: [
    ElasticSearchService,
    OccurrenceService
  ],
  entryComponents: [
    ElasticSearchPage
  ]
})
export class ElasticSearchPageModule {}
