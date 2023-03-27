import { NgModule } from '@angular/core';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { SimpleSearchComponent } from './simple-search/simple-search';
import { DigitalEditionListChildrenComponent } from './digital-edition-list-children/digital-edition-list-children';
import { DateHistogram } from './date-histogram/date-histogram';
import { IonicModule } from '@ionic/angular';
import { PipesModule } from 'src/pipes/pipes.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleLogoComponent } from './title-logo/title-logo';
import { ListOfSongsComponent } from './list-of-songs/list-of-songs';
import { TextChangerComponent } from './text-changer/text-changer';
import { MathJaxComponent } from './math-jax/math-jax';
import { SongExampleComponent } from './song-example/song-example';
import { IllustrationsComponent } from './illustrations/illustrations';
import { RouterLink } from "@angular/router";
import { TopMenuComponent } from "./top-menu/top-menu";
import { SideMenu} from "./side-menu/side-menu";
import { RecursiveAccordion } from "./recursive-accordion/recursive-accordion";
import {CustomTranslateHttpLoader} from "../../standalone/TranslateLoader-shim";
import { TableOfContent} from "./table-of-content/table-of-content";

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	declarations: [
		TitleLogoComponent,
		TopMenuComponent,
		TextChangerComponent,
		SimpleSearchComponent,
		SongExampleComponent,
		DigitalEditionListChildrenComponent,
		ListOfSongsComponent,
		IllustrationsComponent,
		DateHistogram,
		MathJaxComponent,
		SideMenu,
		RecursiveAccordion,
    TableOfContent
	],
	imports: [
		IonicModule,
		PipesModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [HttpClient]
			}
		}),
		CommonModule,
		FormsModule,
		RouterLink,
	],
  exports: [
    TitleLogoComponent,
    TopMenuComponent,
    TextChangerComponent,
    SimpleSearchComponent,
    SongExampleComponent,
    DigitalEditionListChildrenComponent,
    ListOfSongsComponent,
    IllustrationsComponent,
    DateHistogram,
    MathJaxComponent,
    SideMenu,
    TableOfContent
  ]
})
export class ComponentsModule { }
