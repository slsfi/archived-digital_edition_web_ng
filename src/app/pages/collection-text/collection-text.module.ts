import { NgModule } from '@angular/core';
import { CollectionTextPage } from './collection-text';
import { CollectionTextPageRoutingModule } from './collection-text-routing.module';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommentsModule } from 'src/app/components/comments/comments.module';
import { MathJaxModule } from 'src/app/components/math-jax/math-jax.module';
import { ReadTextModule } from 'src/app/components/read-text/read-text.module';
import { FacsimilesModule } from 'src/app/components/facsimiles/facsimiles.module';
import { ManuscriptsModule } from 'src/app/components/manuscripts/manuscripts.module';
import { LegendModule } from 'src/app/components/legend/legend.module';
import { VariantsModule } from 'src/app/components/variants/variants.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
      MathJaxModule,
      LegendModule,
      CollectionTextPageRoutingModule
    ],
    entryComponents: [
      CollectionTextPage,
    ],
    providers: []
  })
  export class CollectionTextPageModule {}
