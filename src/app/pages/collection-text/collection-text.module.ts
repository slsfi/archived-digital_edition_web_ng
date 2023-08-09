import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CollectionTextPage } from './collection-text';
import { CollectionTextPageRoutingModule } from './collection-text-routing.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { VariantsModule } from 'src/app/components/variants/variants.module';
import { CommentsComponent } from 'src/app/components/comments/comments';
import { FacsimilesComponent } from 'src/app/components/facsimiles/facsimiles';
import { IllustrationsComponent } from 'src/app/components/illustrations/illustrations';
import { LegendComponent } from 'src/app/components/legend/legend';
import { ManuscriptsComponent } from 'src/app/components/manuscripts/manuscripts';
import { MetadataComponent } from 'src/app/components/metadata/metadata';
import { ReadTextComponent } from 'src/app/components/read-text/read-text';
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
      VariantsModule,
      CommentsComponent,
      FacsimilesComponent,
      IllustrationsComponent,
      LegendComponent,
      ManuscriptsComponent,
      MetadataComponent,
      ReadTextComponent,
      CollectionTextPageRoutingModule,
      MathJaxDirective
    ],
    entryComponents: [
      CollectionTextPage,
    ],
    providers: []
  })
  export class CollectionTextPageModule {}
