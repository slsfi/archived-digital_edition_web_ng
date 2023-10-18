import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DateHistogram } from '@components/date-histogram/date-histogram';
import { ElasticHitCollectionPagePathPipe } from '@pipes/elastic-hit-collection-page-path.pipe';
import { ElasticHitCollectionPageQueryparamsPipe } from '@pipes/elastic-hit-collection-page-queryparams.pipe';
import { ElasticSearchPageRoutingModule } from './elastic-search-routing.module';
import { ElasticSearchPage } from './elastic-search';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DateHistogram,
        ElasticHitCollectionPagePathPipe,
        ElasticHitCollectionPageQueryparamsPipe,
        ElasticSearchPageRoutingModule,
        ElasticSearchPage
    ],
    entryComponents: [
        ElasticSearchPage
    ]
})
export class ElasticSearchPageModule {}
