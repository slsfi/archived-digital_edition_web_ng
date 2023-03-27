import { Component } from '@angular/core';
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: 'ion-app-v2',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class DigitalEditionsApp {
  showSideMenu:boolean = true;
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if((event as any).url.includes('/publication'))
        this.showSideMenu = false;
    })
  }

  toggleSideMenu() {
    this.showSideMenu = !this.showSideMenu
  }
}
