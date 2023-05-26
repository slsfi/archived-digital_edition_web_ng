import { NgModule } from '@angular/core';
import {
  CollectionPathGeneratorPipe,
  InitialPathGeneratorPipe,
  PagePathGeneratorPipe,
  PositionParamGeneratorPipe
} from "./path-generator.pipe";

@NgModule({
  declarations: [
    InitialPathGeneratorPipe,
    CollectionPathGeneratorPipe,
    PagePathGeneratorPipe,
    PositionParamGeneratorPipe
  ],
  imports: [],
  exports: [
    InitialPathGeneratorPipe,
    CollectionPathGeneratorPipe,
    PagePathGeneratorPipe,
    PositionParamGeneratorPipe
  ]
})
export class PipesModule {
}
