import { NgModule } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PipesModule } from 'src/pipes/pipes.module';
import { DigitalEditionListChildrenComponent } from './digital-edition-list-children/digital-edition-list-children';
import { DateHistogram } from './date-histogram/date-histogram';
import { TextChangerComponent } from './text-changer/text-changer';
import { MathJaxComponent } from './math-jax/math-jax';
import { IllustrationsComponent } from './illustrations/illustrations';
import { TopMenuComponent } from "./top-menu/top-menu";
import { MainSideMenu } from "./main-side-menu/main-side-menu";
import { RecursiveAccordion } from "./recursive-accordion/recursive-accordion";
import { CollectionSideMenu } from "./collection-side-menu/collection-side-menu";

@NgModule({
	declarations: [
		TopMenuComponent,
		TextChangerComponent,
		DigitalEditionListChildrenComponent,
		IllustrationsComponent,
		DateHistogram,
		MathJaxComponent,
		MainSideMenu,
		RecursiveAccordion,
    	CollectionSideMenu
	],
	imports: [
		IonicModule,
		PipesModule,
		CommonModule,
		FormsModule,
		RouterLink
	],
  exports: [
    TopMenuComponent,
    TextChangerComponent,
    DigitalEditionListChildrenComponent,
    IllustrationsComponent,
    DateHistogram,
    MathJaxComponent,
    MainSideMenu,
    CollectionSideMenu
  ]
})
export class ComponentsModule { }
