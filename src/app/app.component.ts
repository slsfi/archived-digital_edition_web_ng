import { Component } from '@angular/core';

@Component({
  selector: 'ion-app-v2',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class DigitalEditionsApp {
  showSideMenu:boolean = true;
  constructor() {}

  toggleSideMenu() {
    this.showSideMenu = !this.showSideMenu
  }
}
