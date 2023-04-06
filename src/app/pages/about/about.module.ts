import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { ComponentsModule } from 'src/app/components/components.module';
import { HtmlContentService } from 'src/app/services/html/html-content.service';
import { IonicModule, NavParams } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AboutPage } from './about';
import { AboutPageRoutingModule } from './about-routing.module';

@NgModule({
    declarations: [
      AboutPage
    ],
    imports: [
      CommonModule,
      IonicModule,
      FormsModule,
      ComponentsModule,
      MarkdownModule.forRoot(),
      AboutPageRoutingModule,
    ],
    entryComponents: [
      AboutPage
    ],
    providers: [
        HtmlContentService,
        NavParams
    ]
  })
  export class AboutPageModule {}
