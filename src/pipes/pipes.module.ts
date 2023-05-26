import { NgModule } from '@angular/core';
import {
  CollectionPathGenerator,
  InitialPathGeneratorPipe,
  PagePathGenerator,
  PositionParamGenerator
} from "./path-generator";

@NgModule({
  declarations: [
    InitialPathGeneratorPipe,
    CollectionPathGenerator,
    PagePathGenerator,
    PositionParamGenerator
  ],
  imports: [],
  exports: [
    InitialPathGeneratorPipe,
    CollectionPathGenerator,
    PagePathGenerator,
    PositionParamGenerator
  ]
})
export class PipesModule {
}
