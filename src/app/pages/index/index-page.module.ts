import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SemanticDataService } from 'src/app/services/semantic-data.service';
import { IndexPageRoutingModule } from './index-page-routing.module';
import { IndexPage } from './index-page';

@NgModule({
  declarations: [
    IndexPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    IndexPageRoutingModule
  ],
  providers: [
    SemanticDataService
  ]
})
export class IndexPageModule {}
