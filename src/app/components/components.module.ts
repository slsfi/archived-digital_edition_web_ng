import { NgModule } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DigitalEditionListChildrenComponent } from './digital-edition-list-children/digital-edition-list-children';

@NgModule({
	declarations: [
		DigitalEditionListChildrenComponent
	],
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		RouterLink
	],
  exports: [
    DigitalEditionListChildrenComponent
  ]
})
export class ComponentsModule { }
