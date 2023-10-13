import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MathJaxDirective } from '@directives/math-jax.directive';
import { CommentsComponent } from '@components/comments/comments';
import { FacsimilesComponent } from '@components/facsimiles/facsimiles';
import { IllustrationsComponent } from '@components/illustrations/illustrations';
import { LegendComponent } from '@components/legend/legend';
import { ManuscriptsComponent } from '@components/manuscripts/manuscripts';
import { MetadataComponent } from '@components/metadata/metadata';
import { ReadTextComponent } from '@components/read-text/read-text';
import { TextChangerComponent } from '@components/text-changer/text-changer';
import { VariantsComponent } from '@components/variants/variants';
import { CollectionTextPage } from './collection-text';
import { CollectionTextPageRoutingModule } from './collection-text-routing.module';


@NgModule({
    declarations: [
      CollectionTextPage
    ],
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
      CollectionTextPageRoutingModule
    ]
  })
  export class CollectionTextPageModule {}
