import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { CommonFunctionsService } from "../../services/common-functions/common-functions.service";

type MenuChild = {
  title: string;
  id: string;
  [key: string]: any
}

@Component({
  selector: 'app-recursive-accordion',
  templateUrl: './recursive-accordion.html',
  styleUrls: ['./recursive-accordion.scss'],
})
export class RecursiveAccordion implements OnInit {
  @Input() children: MenuChild[];
  @Input() parentPath: string = '';
  selectedMenu: string[] = [];

  constructor(public router: Router, private commonFunctions: CommonFunctionsService) {
  }

  ngOnInit() {
    if(this.router.url.includes(this.parentPath)) {
      const selectedChild = this.children.find(item => this.router.url.includes(item.id))
      selectedChild && this.selectedMenu.push(selectedChild.id)
      if (selectedChild && !selectedChild.children) {
        this.commonFunctions.setTitle(selectedChild.title, 1)
      }
    }
  }

  toggleAccordion(item: MenuChild) {
    this.commonFunctions.addOrRemoveValueInArray(this.selectedMenu, item.id)
    if(!item.children) {
      this.commonFunctions.setTitle(item.title, 1)
    }
  }
}
