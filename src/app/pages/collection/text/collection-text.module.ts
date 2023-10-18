import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MathJaxDirective } from '@directives/math-jax.directive';
import { CommentsComponent } from '@components/collection-text-types/comments/comments';
import { FacsimilesComponent } from '@components/collection-text-types/facsimiles/facsimiles';
import { IllustrationsComponent } from '@components/collection-text-types/illustrations/illustrations';
import { LegendComponent } from '@components/collection-text-types/legend/legend';
import { ManuscriptsComponent } from '@components/collection-text-types/manuscripts/manuscripts';
import { MetadataComponent } from '@components/collection-text-types/metadata/metadata';
import { ReadTextComponent } from '@components/collection-text-types/read-text/read-text';
import { TextChangerComponent } from '@components/text-changer/text-changer';
import { VariantsComponent } from '@components/collection-text-types/variants/variants';
import { CollectionTextPage } from './collection-text';
import { CollectionTextPageRoutingModule } from './collection-text-routing.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MathJaxDirective,
        CommentsComponent,
        FacsimilesComponent,
        IllustrationsComponent,
        LegendComponent,
        ManuscriptsComponent,
        MetadataComponent,
        ReadTextComponent,
        TextChangerComponent,
        VariantsComponent,
        CollectionTextPageRoutingModule,
        CollectionTextPage
    ]
})
export class CollectionTextPageModule {}
