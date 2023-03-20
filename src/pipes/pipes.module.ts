import { NgModule } from '@angular/core';
import { OrderByPipe } from './order-by/order-by';
import { SearchPipe } from './search/search';
import { SortPipe } from './sort/sort';
import { PathGenerator } from "./path-generator";

@NgModule({
  declarations: [OrderByPipe,
    SearchPipe,
    SortPipe,
    PathGenerator],
  imports: [],
  exports: [OrderByPipe,
    SearchPipe,
    SortPipe,
    PathGenerator]
})
export class PipesModule {
}
