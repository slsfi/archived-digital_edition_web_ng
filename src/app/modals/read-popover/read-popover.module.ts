import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { ReadPopoverPage } from './read-popover';

@NgModule({
    declarations: [
        ReadPopoverPage
    ],
    imports: [
        IonicModule,
        CommonModule,
        FormsModule
    ],
    entryComponents: [
        ReadPopoverPage
    ],
    providers: [
        ReadPopoverService
    ]
  })
  export class ReadPopoverPageModule {}
