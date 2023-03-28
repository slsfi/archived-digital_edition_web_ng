import { Component } from '@angular/core';
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: 'ion-app-v2',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class DigitalEditionsApp {

  showSideMenu: boolean = true;
  showCollectionSideMenu: boolean = false;
  collectionID: string = '';
  
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe({
      next: (event: any) => {
        const collectionSegment = '/publication/';
        if (event.url.startsWith(collectionSegment)) {
          this.collectionID = event.url.slice(collectionSegment.length).split('/')[0] || '';
          this.showCollectionSideMenu = true;
        } else {
          this.showCollectionSideMenu = false;
        }
      }
    });
  }

  toggleSideMenu() {
    this.showSideMenu = !this.showSideMenu
  }
}
