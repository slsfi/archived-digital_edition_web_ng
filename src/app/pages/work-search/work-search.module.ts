import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { MarkdownModule } from 'ngx-markdown';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { WorkSearchPage } from './work-search';
import { WorkSearchPageRoutingModule } from './work-search-routing.module';

@NgModule({
  declarations: [
    WorkSearchPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    MarkdownModule,
    WorkSearchPageRoutingModule
  ],
  providers: [
    SemanticDataService
  ]
})
export class WorkearchPageModule {}
