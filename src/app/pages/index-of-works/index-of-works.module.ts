import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { SemanticDataService } from 'src/app/services/semantic-data.service';
import { IndexOfWorksPage } from './index-of-works';
import { IndexOfWorksPageRoutingModule } from './index-of-works-routing.module';

@NgModule({
  declarations: [
    IndexOfWorksPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PipesModule,
    ComponentsModule,
    IndexOfWorksPageRoutingModule
  ],
  providers: [
    SemanticDataService
  ]
})
export class IndexOfWorksPageModule {}
