import { NgModule } from '@angular/core';
import {
  CollectionPathGeneratorPipe,
  InitialPathGeneratorPipe,
  PagePathGeneratorPipe,
  PositionParamGeneratorPipe,
  OccurrenceTextQueryParamGeneratorPipe
} from "./path-generator.pipe";

@NgModule({
  declarations: [
    InitialPathGeneratorPipe,
    CollectionPathGeneratorPipe,
    PagePathGeneratorPipe,
    PositionParamGeneratorPipe,
    OccurrenceTextQueryParamGeneratorPipe
  ],
  imports: [],
  exports: [
    InitialPathGeneratorPipe,
    CollectionPathGeneratorPipe,
    PagePathGeneratorPipe,
    PositionParamGeneratorPipe,
    OccurrenceTextQueryParamGeneratorPipe
  ]
})
export class PipesModule {
}
