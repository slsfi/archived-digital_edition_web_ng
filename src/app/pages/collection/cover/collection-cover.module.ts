import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TextChangerComponent } from '@components/text-changer/text-changer';
import { CollectionCoverPageRoutingModule } from './collection-cover-routing.module';
import { CollectionCoverPage } from './collection-cover';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        TextChangerComponent,
        CollectionCoverPageRoutingModule,
        CollectionCoverPage
    ]
})
export class CollectionCoverPageModule {}
