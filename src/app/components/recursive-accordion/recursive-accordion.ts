import { Component, Input, OnInit } from '@angular/core';
import { ActivationEnd, NavigationEnd, Router, RoutesRecognized } from "@angular/router";
import { filter } from "rxjs/operators";

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
  selectedMenu: string = '';

  constructor(public router: Router) {
  }

  ngOnInit() {
    this.selectedMenu = this.children.map(item => item.id).find(item => this.router.url.includes(item)) || '';
  }

  toggleAccordion(value: string) {
    this.selectedMenu = this.selectedMenu === value ? '' : value;
  }
}
