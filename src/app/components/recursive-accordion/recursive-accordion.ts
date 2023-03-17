import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { config } from "src/app/services/config/config";

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
  @Input() selected: boolean = false;
  @Input() childId: string = '';
  @Input() parentPath: string = '';
  selectedMenu: string = '';

  constructor(public router: Router) {
  }

  ngOnInit() {
    if (this.childId) {
      this.selected = this.selected || this.router.url.includes(this.childId);
    }
  }

  toggleAccordion(value: string) {
    this.selectedMenu = this.selectedMenu === value ? '' : value;
  }

  pathGenerator(parentPath: string, childId: string): string {
    if (this.parentPath === '/publication') {
      if(config.HasCover) {
        return `${parentPath}/${childId}/cover`
      } else if (config.HasTitle) {
        return `${parentPath}/${childId}/title`
      } else if (config.HasForeword) {
        return `${parentPath}/${childId}/foreword`
      } else if (config.HasIntro) {
        return `${parentPath}/${childId}/introduction`
      } else {
        //TODO: thanh - path for when all conditions fail
        return ''
      }
    } else {
      return childId === 'media-collections' ? `/media-collections` : `${parentPath}/${childId}`
    }
  }
}
