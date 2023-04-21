import { NgModule } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { PdfService } from 'src/app/services/pdf/pdf.service';
import { SingleEditionRoutingModule } from './single-edition-routing.module';
import { PipesModule } from 'src/pipes/pipes.module';
import { SingleEditionPage } from './single-edition';

@NgModule({
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    declarations: [
        SingleEditionPage
    ],
    imports: [
      CommonModule,
      FormsModule,
      PipesModule,
      ComponentsModule,
      SingleEditionRoutingModule
    ],
    providers: [
        PdfService
    ],
    entryComponents: [
        SingleEditionPage
    ]
  })
  export class SingleEditionPageModule {}
