import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TextChangerComponent } from '@components/text-changer/text-changer';
import { CollectionForewordPage } from './collection-foreword';
import { CollectionForewordPageRoutingModule } from './collection-foreword-routing.module';


@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        TextChangerComponent,
        CollectionForewordPageRoutingModule,
        CollectionForewordPage
    ]
})
export class CollectionForewordPageModule {}
