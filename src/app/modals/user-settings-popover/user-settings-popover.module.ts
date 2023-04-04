import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserSettingsPopoverPage } from './user-settings-popover';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';

@NgModule({
    declarations: [
        UserSettingsPopoverPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    entryComponents: [
        UserSettingsPopoverPage
    ],
    providers: [
        UserSettingsService
    ]
  })
  export class UserSettingsPopoverPageModule {}
