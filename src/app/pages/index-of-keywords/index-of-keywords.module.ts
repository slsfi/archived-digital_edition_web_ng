import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { SemanticDataService } from 'src/app/services/semantic-data/semantic-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexOfKeywordsPageRoutingModule } from './index-of-keywords-routing.module';
import { IndexOfKeywordsPage } from './index-of-keywords';

@NgModule({
  declarations: [
    IndexOfKeywordsPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    IndexOfKeywordsPageRoutingModule
  ],
  providers: [
    SemanticDataService
  ]
})
export class IndexOfKeywordsPageModule {}
