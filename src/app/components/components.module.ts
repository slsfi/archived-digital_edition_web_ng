import { NgModule } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PipesModule } from 'src/pipes/pipes.module';
import { DigitalEditionListChildrenComponent } from './digital-edition-list-children/digital-edition-list-children';
import { DateHistogram } from './date-histogram/date-histogram';
import { MainSideMenu } from "./main-side-menu/main-side-menu";
import { CollectionSideMenu } from "./collection-side-menu/collection-side-menu";

@NgModule({
	declarations: [
		DigitalEditionListChildrenComponent,
		DateHistogram,
		MainSideMenu,
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
    DigitalEditionListChildrenComponent,
    DateHistogram,
    MainSideMenu,
    CollectionSideMenu
  ]
})
export class ComponentsModule { }
