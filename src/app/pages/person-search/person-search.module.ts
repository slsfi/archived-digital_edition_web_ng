import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonSearchPage } from './person-search';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { OccurrenceService } from 'src/app/services/occurrence/occurence.service';
import { PersonSearchRoutingModule } from './person-search-routing.module';
import { OccurrencesPage } from 'src/app/modals/occurrences/occurrences';
import { OccurrencesPageModule } from 'src/app/modals/occurrences/occurrences.module';
import { FilterPageModule } from 'src/app/modals/filter/filter.module';
import { FilterPage } from 'src/app/modals/filter/filter';

@NgModule({
  schemas: [
    NO_ERRORS_SCHEMA
  ],
  declarations: [
    PersonSearchPage
  ],
  imports: [
    IonicModule,
    PipesModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    FilterPageModule,
    OccurrencesPageModule,
    PersonSearchRoutingModule
  ],
  providers: [
    SemanticDataService,
    OccurrenceService
  ],
  entryComponents: [
    FilterPage,
    OccurrencesPage
  ]
})
export class PersonSearchPageModule {}
