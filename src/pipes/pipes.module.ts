import { NgModule } from '@angular/core';
import { OrderByPipe } from './order-by/order-by';
import { SearchPipe } from './search/search';
import { SortPipe } from './sort/sort';
import {
  InitialPathGeneratorPipe,
  PagePathGenerator,
  PositionParamGenerator,
  CollectionPathGenerator
} from "./path-generator";

@NgModule({
  declarations: [OrderByPipe,
    SearchPipe,
    SortPipe,
    InitialPathGeneratorPipe, CollectionPathGenerator, PagePathGenerator, PositionParamGenerator],
  imports: [],
  exports: [OrderByPipe,
    SearchPipe,
    SortPipe,
    InitialPathGeneratorPipe, CollectionPathGenerator, PagePathGenerator, PositionParamGenerator]
})
export class PipesModule {
}
