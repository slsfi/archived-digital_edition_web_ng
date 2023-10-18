import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TextChangerComponent } from '@components/text-changer/text-changer';
import { CollectionIntroductionPage } from './collection-introduction';
import { CollectionIntroductionPageRoutingModule } from './collection-introduction-routing.module';


@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        TextChangerComponent,
        CollectionIntroductionPageRoutingModule,
        CollectionIntroductionPage
    ]
})
export class CollectionIntroductionPageModule {}
