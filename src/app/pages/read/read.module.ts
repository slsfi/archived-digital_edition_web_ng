import { NgModule } from '@angular/core';
import { ReadPage } from './read';
import { ReadRoutingModule } from './read-routing.module';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommentsModule } from 'src/app/components/comments/comments.module';
import { MathJaxModule } from 'src/app/components/math-jax/math-jax.module';
import { ReadTextModule } from 'src/app/components/read-text/read-text.module';
import { FacsimilesModule } from 'src/app/components/facsimiles/facsimiles.module';
import { ManuscriptsModule } from 'src/app/components/manuscripts/manuscripts.module';
import { LegendModule } from 'src/app/components/legend/legend.module';
import { DragScrollModule } from 'src/directives/ngx-drag-scroll/public-api';
import { VariationsModule } from 'src/app/components/variations/variations.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
      ReadPage
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
      VariationsModule,
      DragScrollModule,
      MathJaxModule,
      LegendModule,
      ReadRoutingModule
    ],
    entryComponents: [
      ReadPage,
    ],
    providers: []
  })
  export class ReadPageModule {}
