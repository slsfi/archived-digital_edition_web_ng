import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TextChangerComponent } from '@components/text-changer/text-changer';
import { CollectionTitlePage } from './collection-title';
import { CollectionTitlePageRoutingModule } from './collection-title-routing.module';


@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        TextChangerComponent,
        CollectionTitlePageRoutingModule,
        CollectionTitlePage
    ]
})
export class CollectionTitlePageModule {}
