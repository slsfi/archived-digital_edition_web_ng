import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CollectionTextPage } from './collection-text';
import { CollectionTextPageRoutingModule } from './collection-text-routing.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommentsModule } from 'src/app/components/comments/comments.module';
import { ReadTextModule } from 'src/app/components/read-text/read-text.module';
import { FacsimilesModule } from 'src/app/components/facsimiles/facsimiles.module';
import { ManuscriptsModule } from 'src/app/components/manuscripts/manuscripts.module';
import { LegendModule } from 'src/app/components/legend/legend.module';
import { VariantsModule } from 'src/app/components/variants/variants.module';
import { MathJaxDirective } from 'src/directives/math-jax.directive';

@NgModule({
    declarations: [
      CollectionTextPage
    ],
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      ComponentsModule,
      ReadTextModule,
      CommentsModule,
      FacsimilesModule,
      ManuscriptsModule,
      VariantsModule,
      LegendModule,
      CollectionTextPageRoutingModule,
      MathJaxDirective
    ],
    entryComponents: [
      CollectionTextPage,
    ],
    providers: []
  })
  export class CollectionTextPageModule {}
