import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DateHistogram } from 'src/app/components/date-histogram/date-histogram';
import { SemanticDataObjectModal } from 'src/app/modals/semantic-data-object/semantic-data-object.modal';
import { ElasticHitPathGeneratorPipe } from 'src/pipes/elastic-hit-path-generator';
import { ElasticHitQueryParamsGeneratorPipe } from 'src/pipes/elastic-hit-queryparams-generator';
import { PipesModule } from 'src/pipes/pipes.module';
import { OccurrenceService } from 'src/app/services/occurence.service';
import { ComponentsModule } from 'src/app/components/components.module';
import { ElasticSearchService } from 'src/app/services/elastic-search.service';
import { ElasticSearchPageRoutingModule } from './elastic-search-routing.module';
import { ElasticSearchPage } from './elastic-search';

@NgModule({
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
    ElasticHitPathGeneratorPipe,
    ElasticHitQueryParamsGeneratorPipe,
    ElasticSearchPageRoutingModule,
    DateHistogram
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
